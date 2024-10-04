import EnterRoom from "@/components/home/EnterRoom";
import UserInfo from "@/components/home/UserInfo";
import JoinRoom from "@/components/joinRoom/JoinRoom";
import Room from "@/components/room/Room";
import React, { useRef, useState } from "react";

export default function Home() {
  return (
    <div className="py-10">
      <UserInfo />
      <EnterRoom />
    </div>
  );
}
