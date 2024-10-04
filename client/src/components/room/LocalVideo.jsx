"use client";
import { useMeetContext } from "@/contexts/MeetProvider";
import { MicrophoneIcon, VideoCameraIcon } from "@heroicons/react/16/solid";
import React, { use, useEffect, useState } from "react";

export default function LocalVideo({ room }) {
  const { user, localStream, setLocalStream, localVideoRef, streamSettings, setStreamSettings } = useMeetContext();

  // useEffect(() => {
  //   async function main() {
  //     if (localStream) return;
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       // video: true,
  //       audio: true,
  //     });
  //     setLocalStream(stream);
  //   }

  //   main();
  // }, []);

  useEffect(() => {
    if (!localVideoRef.current || !localStream) return;

    localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  return (
    <div className="flex w-full max-w-[300px] aspect-[800/500] rounded-lg overflow-hidden bg-black">
      <div className={`${streamSettings.cameraEnabled || streamSettings.screenSharingEnabled ? "hidden" : "flex"} items-center justify-center w-full h-full`}>
        <div>
          <img alt="avatar" src="/avatar.webp" className="mx-auto size-[70px]" />
          <p className="mt-2 text-white text-center font-medium capitalize">
            You {room?.host?.id === user?.id ? <span className="text-blue-500">(host)</span> : ""}
          </p>
        </div>
      </div>
      <video
        className={`${streamSettings.cameraEnabled || streamSettings.screenSharingEnabled ? "" : "hidden"} w-full`}
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
      />
    </div>
  );
}
