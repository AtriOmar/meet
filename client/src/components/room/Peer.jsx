"use client";
import { useMeetContext } from "@/contexts/MeetProvider";
import { socket } from "@/lib/socket";
import { MicrophoneIcon } from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";

let timeout = null;

export default function Peer({ peer, room, setPinned, isPinned = false, pinned }) {
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [hasScreenSharing, setHasScreenSharing] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isSilent, setIsSilent] = useState(true);
  const { streamSettings } = useMeetContext();

  useEffect(() => {
    if (!peer.stream) return;
    console.log("peer changed");
    console.log(peer.stream?.getVideoTracks());

    const videoTrack = peer.stream.getVideoTracks()[0];
    const audioTrack = peer.stream.getAudioTracks()[0];
    const videoStream = new MediaStream([videoTrack]);
    const audioStream = new MediaStream([audioTrack]);
    videoRef.current.srcObject = videoStream;
    audioRef.current.srcObject = audioStream;
  }, [peer.stream]);

  useEffect(() => {
    const audioTrack = peer.stream.getAudioTracks()[0];
    detectContinuousSound(audioTrack, (audioBlob) => {
      setIsSilent(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsSilent(true);
      }, 1000);
    });
  }, []);

  // useEffect(() => {
  //   if (streamSettings.audioEnabled) peer.peer.send("audio-enabled");
  //   else peer.peer.send("audio-disabled");
  //   if (streamSettings.cameraEnabled) peer.peer.send("video-enabled");
  //   else peer.peer.send("video-disabled");
  //   if (streamSettings.screenSharingEnabled) peer.peer.send("screen-sharing-enabled");
  //   else peer.peer.send("screen-sharing-disabled");
  // }, []);

  useEffect(() => {
    peer.peer.on("data", (data) => {
      let str = new TextDecoder("utf-8").decode(data);

      switch (str) {
        case "audio-disabled":
          setHasAudio(false);
          break;
        case "audio-enabled":
          setHasAudio(true);
          break;
        case "video-disabled":
          setHasVideo(false);
          break;
        case "video-enabled":
          setHasVideo(true);
          break;
        case "screen-sharing-disabled":
          setPinned(null);
          setHasScreenSharing(false);
          break;
        case "screen-sharing-enabled":
          setHasScreenSharing(true);
          setPinned(peer.id);
          break;
        case "ready":
          console.log("ready");
          break;
      }
    });
  }, []);

  useEffect(() => {
    socket.emit("request-stream-settings", { to: peer.id });

    socket.on("stream-settings", ({ from, streamSettings }) => {
      if (from !== peer.id) return;

      setHasAudio(streamSettings.audioEnabled);
      setHasVideo(streamSettings.cameraEnabled);
      setHasScreenSharing(streamSettings.screenSharingEnabled);
    });
  }, []);

  const MIN_DECIBELS = -45;

  async function detectContinuousSound(audioTrack, onSoundDetected, silenceThreshold = 0.01, timeout = 500) {
    const stream = new MediaStream([audioTrack]);
    try {
      const mediaRecorder = new MediaRecorder(stream);

      const audioChunks = [];
      let soundDetected = false;

      const audioContext = new AudioContext();
      const audioStreamSource = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.minDecibels = MIN_DECIBELS;
      audioStreamSource.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const domainData = new Uint8Array(bufferLength);

      const detectSound = () => {
        analyser.getByteFrequencyData(domainData);

        for (let i = 0; i < bufferLength; i++) {
          if (domainData[i] > 0) {
            if (!soundDetected) {
              soundDetected = true;
              mediaRecorder.start();
            }
          }
        }

        window.requestAnimationFrame(detectSound);
      };

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.muted = true;
        audio.play();

        onSoundDetected(audioBlob);

        // Reset for next detection
        soundDetected = false;
        audioChunks.length = 0;
      });

      mediaRecorder.addEventListener("start", () => {
        setTimeout(() => {
          if (soundDetected) {
            mediaRecorder.stop();
          }
        }, timeout);
      });

      window.requestAnimationFrame(detectSound);
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  }

  // Usage

  return (
    <div
      className={`relative flex w-full max-h-[calc(100vh_-_100px)] ${
        isPinned ? "" : "max-w-[300px]"
      } aspect-[800/500] rounded-lg overflow-hidden bg-black ring-blue-500 ${isSilent ? "" : "ring-1"}`}
    >
      <div className={`${hasVideo || hasScreenSharing ? "hidden" : "flex"} items-center justify-center w-full h-full`}>
        <div>
          <img alt="avatar" src="/avatar.webp" className="mx-auto size-[70px]" />
          <p className="mt-2 text-white text-center font-medium capitalize">
            {peer.user.firstname} {room.host.id === peer.user.id ? <span className="text-blue-500">(host)</span> : ""}
          </p>
        </div>
      </div>
      <video className={`${hasVideo || hasScreenSharing ? "" : "hidden"} w-full`} ref={videoRef} autoPlay playsInline controls={!isPinned} />
      <p className="absolute left-1 bottom-0 mt-2 px-1 py-0.5 rounded-lg bg-slate-700 text-white text-xs text-center font-medium capitalize">
        {peer.user.firstname} {room.host.id === peer.user.id ? <span className="text-blue-500">(host)</span> : ""}
      </p>
      <audio ref={audioRef} autoPlay></audio>
      {/* <div className="video-container"></div> */}
      <div
        className={`${
          hasAudio ? "hidden" : "flex"
        } absolute bottom-0.5 right-1 items-center justify-center size-7 rounded-full bg-slate-700 overflow-hidden duration-200`}
      >
        <div className={`relative`}>
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-0.5 h-4/5 bg-white`}></div>
          <MicrophoneIcon className="w-[18px] h-[18px] text-white" />
        </div>
      </div>
    </div>
  );
}
