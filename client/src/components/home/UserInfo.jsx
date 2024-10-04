import { useMeetContext } from "@/contexts/MeetProvider";
import React, { useState } from "react";

export default function UserInfo() {
  const { user, setUser } = useMeetContext();
  const [input, setInput] = useState({
    firstname: user.firstname,
  });

  return (
    <div className="w-[400px] mx-auto p-4 rounded-xl bg-slate-800 shadow-[2px_2px_5px_rgb(0,0,0,.3)]">
      <div className="flex items-center p-2">
        <div className="w-10 h-10 rounded-full bg-gray-400">
          <img src="/avatar.webp" alt="" />
        </div>
        <p className="ml-2 text-white">{user.firstname}</p>
      </div>
      <input
        type="text"
        className="w-full mt-8 px-3 py-1 border border-slate-900 rounded-md bg-slate-700 text-slate-300"
        value={input.firstname}
        onChange={(e) => {
          setInput((prev) => ({ ...prev, firstname: e.target.value }));
        }}
      />
      <button className="w-full mt-2 px-3 py-1 rounded-lg bg-blue-500 text-white" onClick={() => setUser({ ...user, firstname: input.firstname })}>
        Change Name
      </button>
    </div>
  );
}
