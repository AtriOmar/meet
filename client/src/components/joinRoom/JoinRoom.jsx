import { useMeetContext } from "@/contexts/MeetProvider";
import LocalVideo from "@/components/joinRoom/LocalVideo";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

export default function JoinRoom({ setJoinRoom, room }) {
  const { user } = useMeetContext();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 px-3 bg-slate-900 isolate">
      <div className="fixed z-[-1] right-[200px] top-[100px] w-[100px] h-[500px] bg-slate-700 -rotate-45 blur-[100px]"></div>
      <div className="fixed z-[-1] right-[700px] top-[200px] w-[100px] h-[700px] bg-slate-700 -rotate-45 blur-[100px]"></div>
      <div className="fixed z-[-1] right-[1400px] top-[50px] w-[100px] h-[500px] bg-slate-700 -rotate-45 blur-[100px]"></div>
      <LocalVideo />
      <div className="flex flex-col gap-4 w-full max-w-[300px]">
        <p className="text-center text-white text-2xl font-bold">{room?.name}</p>
        <button
          onClick={() => {
            setJoinRoom(true);
          }}
          className="px-3 py-2 rounded-lg bg-blue-500 text-white"
        >
          Join Room
        </button>
        {user && user?.id === room?.host?.id ? <button className="mt-4 px-3 py-2 rounded-lg bg-red-500 text-white">End Session</button> : ""}
      </div>
    </div>
  );
}
