// src/VideoChat.js
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Device } from "mediasoup-client";

const VideoChat = () => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [socket, setSocket] = useState(null);
  const [device, setDevice] = useState(null);
  const [producerTransport, setProducerTransport] = useState(null);
  const [consumerTransport, setConsumerTransport] = useState(null);
  const [producer, setProducer] = useState(null);
  const [consumer, setConsumer] = useState(null);

  useEffect(() => {
    const initSocket = async () => {
      const socket = io("http://localhost:5000");
      setSocket(socket);

      socket.on("connect", async () => {
        const device = new Device();
        setDevice(device);

        // Create a send transport for the producer
        socket.emit("createTransport", async (response) => {
          const producerTransport = device.createSendTransport(response);
          setProducerTransport(producerTransport);

          producerTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
            try {
              await socket.emit("connectTransport", {
                transportId: producerTransport.id,
                dtlsParameters,
              });
              callback();
            } catch (error) {
              errback(error);
            }
          });

          producerTransport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
            try {
              const { id } = await new Promise((resolve, reject) => {
                socket.emit(
                  "sendTrack",
                  {
                    transportId: producerTransport.id,
                    kind,
                    rtpParameters,
                  },
                  (response) => {
                    if (response.error) {
                      return reject(response.error);
                    }
                    resolve(response);
                  }
                );
              });
              callback({ id });
            } catch (error) {
              errback(error);
            }
          });
        });
      });

      socket.on("producerCreated", async ({ id }) => {
        // Create a receive transport for the consumer
        socket.emit("createTransport", async (response) => {
          const consumerTransport = device.createRecvTransport(response);
          setConsumerTransport(consumerTransport);

          consumerTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
            try {
              await socket.emit("connectTransport", {
                transportId: consumerTransport.id,
                dtlsParameters,
              });
              callback();
            } catch (error) {
              errback(error);
            }
          });

          const consumer = await consumerTransport.consume({
            id,
            kind: "video",
            rtpCapabilities: device.rtpCapabilities,
          });
          setConsumer(consumer);

          const stream = new MediaStream();
          stream.addTrack(consumer.track);
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.play();
        });
      });
    };

    initSocket();
  }, []);

  const startStreaming = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    localVideoRef.current.play();

    const track = stream.getVideoTracks()[0];
    if (producerTransport) {
      const prod = await producerTransport.produce({ track });
      setProducer(prod);
    }
  };

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted></video>
      <video ref={remoteVideoRef} autoPlay></video>
      <button onClick={startStreaming}>Start Streaming</button>
    </div>
  );
};

export default VideoChat;
