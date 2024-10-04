"use client";
import { useMeetContext } from "@/contexts/MeetProvider";
import { MicrophoneIcon, VideoCameraIcon } from "@heroicons/react/16/solid";
import React, { useEffect, useState } from "react";

export default function LocalVideo() {
  const { localStream, setLocalStream, localVideoRef, setAudioOn, streamSettings, setStreamSettings } = useMeetContext();

  function createVideoTrack() {
    const canvas = document.getElementById("videoCanvas");
    const context = canvas.getContext("2d");

    // Draw something on the canvas, e.g., a solid color or text
    context.fillStyle = "green";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Optionally draw some text or other graphics
    context.fillStyle = "white";
    context.font = "30px Arial";
    context.fillText("Hello World", 50, 50);

    // Capture the canvas stream as a video stream
    const stream = canvas.captureStream(30); // 30 FPS
    const videoTrack = stream.getVideoTracks()[0];
    videoTrack.enabled = false;
    videoTrack.stop();

    return videoTrack;
  }

  function createAudioTrack() {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const destination = audioContext.createMediaStreamDestination();

    // Set up the oscillator
    oscillator.type = "sine"; // You can use 'sine', 'square', 'sawtooth', 'triangle'
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440 Hz (A note)
    oscillator.connect(destination);
    oscillator.start();

    // Capture the audio stream
    const stream = destination.stream;
    const audioTrack = stream.getAudioTracks()[0];
    audioTrack.enabled = false;
    audioTrack.stop();

    return audioTrack;
  }

  useEffect(() => {
    async function main() {
      const newStream = new MediaStream();
      const fakeVideoTrack = createVideoTrack();
      newStream.addTrack(fakeVideoTrack);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        const audioTrack = stream.getAudioTracks()[0];
        setStreamSettings((prev) => ({ ...prev, audioEnabled: true }));
        newStream.addTrack(audioTrack);
      } catch (err) {
        console.log("err");
        const fakeAudioTrack = createAudioTrack();
        newStream.addTrack(fakeAudioTrack);
      }
      setLocalStream(newStream);
    }

    main();
  }, []);

  // useEffect(() => {
  //   async function main() {
  //     if (localStream) return;
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: false,
  //         audio: true,
  //       });
  //       setStreamSettings((prev) => ({ ...prev, audioEnabled: true }));
  //       setLocalStream(stream);
  //     } catch (err) {
  //       toast.error("Error accessing microphone");
  //     }
  //   }

  //   main();
  // }, []);

  useEffect(() => {
    if (!localVideoRef.current || !localStream) return;

    localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  async function toggleAudio() {
    if (!localStream) return;

    const oldAudioTrack = localStream.getAudioTracks()?.[0];
    if (!oldAudioTrack) return;

    if (oldAudioTrack.enabled) {
      oldAudioTrack.enabled = false;
      oldAudioTrack.stop();
      setStreamSettings((prev) => ({ ...prev, audioEnabled: false }));
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      const newAudioTrack = stream.getAudioTracks()[0];
      localStream.removeTrack(oldAudioTrack);
      localStream.addTrack(newAudioTrack);
      setStreamSettings((prev) => ({ ...prev, audioEnabled: true }));
    }
  }

  async function toggleVideo() {
    if (!localStream) return;

    const oldVideoTrack = localStream.getVideoTracks()?.[0];
    if (!oldVideoTrack) return;

    if (oldVideoTrack.enabled) {
      oldVideoTrack.enabled = false;
      oldVideoTrack.stop();
      setStreamSettings((prev) => ({ ...prev, cameraEnabled: false }));
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      const newVideoTrack = stream.getVideoTracks()[0];
      localStream.removeTrack(oldVideoTrack);
      localStream.addTrack(newVideoTrack);
      setStreamSettings((prev) => ({ ...prev, cameraEnabled: true }));
    }
    return;
  }

  return (
    <div className="w-full max-w-[700px]">
      <div className="opacity-0 pointer-events-none fixed bottom-0 right-0">
        <canvas id="videoCanvas" width="800" height="500"></canvas>
      </div>
      <div className="flex w-full aspect-[700/500] max-h-[500px] rounded-lg overflow-hidden bg-black">
        <div className={`${streamSettings.cameraEnabled ? "hidden" : "flex"} items-center justify-center w-full h-full`}>
          <p className="font-bold text-white text-2xl">Video Off</p>
        </div>
        <video className={`${streamSettings.cameraEnabled ? "" : "hidden"} w-screen`} ref={localVideoRef} autoPlay playsInline muted />
      </div>
      <div className="flex gap-3 w-fit mt-4 mx-auto">
        <button
          onClick={toggleAudio}
          className={`${
            streamSettings.audioEnabled ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600"
          } relative flex items-center justify-center size-12 rounded-full overflow-hidden duration-200`}
        >
          <div
            className={`${
              streamSettings.audioEnabled ? "hidden" : ""
            } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-0.5 h-4/5 bg-white`}
          ></div>
          <MicrophoneIcon className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={toggleVideo}
          className={`${
            streamSettings.cameraEnabled ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600"
          } relative flex items-center justify-center size-12 rounded-full overflow-hidden duration-200`}
        >
          <div
            className={`${
              streamSettings.cameraEnabled ? "hidden" : ""
            } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-0.5 h-4/5 bg-white transition-all`}
          ></div>
          <VideoCameraIcon className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
