import { useMeetContext } from "@/contexts/MeetProvider";
import SendMessageInput from "@/components/room/SendMessageInput";
import { socket } from "@/lib/socket";
import React, { useEffect, useState } from "react";

export default function ChatSidebar({ room }) {
  const { showChatSidebar, setUnreadMessages } = useMeetContext();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (showChatSidebar) {
      setUnreadMessages(0);
    }
  }, [showChatSidebar]);

  useEffect(() => {
    socket.on("message", ({ user, message }) => {
      console.log("message", user, message);
      setMessages((prev) => [...prev, { user, message }]);
      if (!showChatSidebar) {
        setUnreadMessages((prev) => prev + 1);
      }
    });

    return () => {
      socket.off("message");
    };
  }, [showChatSidebar]);

  console.log(messages);

  return (
    <div
      className={`${
        showChatSidebar ? "" : "translate-x-full"
      } fixed right-0 top-3 flex flex-col w-[300px] h-full px-2 bg-white shadow-[1px_1px_5px_rgb(0,0,0,.3)] max-h-[calc(100vh_-_100px)] rounded-l-xl py-3 overflow-y-auto duration-300`}
    >
      <p className="font-bold text-center text-xl">{room.name}</p>
      <div className="grow messages-box">
        {messages.map((msg, i) => (
          <div key={i} className="flex gap-2">
            <p className="font-bold">{msg.user.firstname}:</p>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>
      <SendMessageInput />
    </div>
  );
}
