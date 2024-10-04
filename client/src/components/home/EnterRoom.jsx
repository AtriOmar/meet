import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function EnterRoom() {
  const [input, setInput] = useState({
    roomId: "",
  });
  const navigate = useNavigate();

  function enterRoom(e) {
    e.preventDefault();

    navigate(`/${input.roomId}`);
  }

  return (
    <div className="w-[400px] mt-10 mx-auto p-4 rounded-xl bg-slate-800 shadow-[2px_2px_5px_rgb(0,0,0,.3)]">
      <form onSubmit={enterRoom}>
        <input
          type="text"
          className="w-full px-3 py-1 border border-slate-900 rounded-md bg-slate-700 text-slate-300"
          value={input.roomId}
          onChange={(e) => {
            setInput((prev) => ({ ...prev, roomId: e.target.value }));
          }}
          placeholder="Room ID"
        />
        <button type="submit" className="block w-full mt-2 px-3 py-1 rounded-lg bg-blue-500 text-white text-center">
          Enter Room
        </button>
      </form>
    </div>
  );
}
