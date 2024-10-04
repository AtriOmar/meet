import JoinRoom from "@/components/joinRoom/JoinRoom";
import Room from "@/components/room/Room";
import React, { useRef, useState } from "react";
import { useParams } from "react-router";

export default function Meet() {
  const [joinRoom, setJoinRoom] = useState(false);
  const { id } = useParams();
  const room = useRef({
    id: id,
    name: "Room " + id,
    host: {
      id: "123",
      username: "Omar Atri Host",
    },
    users: [],
  }).current;

  if (joinRoom) {
    return <Room room={room} setJoinRoom={setJoinRoom} />;
  }

  return <JoinRoom setJoinRoom={setJoinRoom} room={room} />;
}
