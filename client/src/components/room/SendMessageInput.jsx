import { useMeetContext } from "@/contexts/MeetProvider";
import { socket } from "@/lib/socket";
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import React, { useEffect, useRef, useState } from "react";

export default function SendMessageInput() {
  const [text, setText] = useState("");
  const textRef = useRef(null);
  const { showChatSidebar } = useMeetContext();

  useEffect(() => {
    if (showChatSidebar) {
      textRef.current.focus();
    }
  }, [showChatSidebar]);

  useEffect(() => {
    function handleClick(e) {
      if (e.detail === 1 && document.getSelection().toString() === "") textRef.current.focus();
    }

    const messagesBox = document.querySelector(".messages-box");

    if (!messagesBox) return;

    messagesBox.addEventListener("click", handleClick);

    return () => messagesBox.removeEventListener("click", handleClick);
  }, []);

  function handleSubmit() {
    if (!text.trim().length) {
      setText("");
      textRef.current.innerText = "";
      return;
    }

    textRef.current.innerText = "";
    socket.emit("message", { message: text });

    setText("");
  }

  function handlePaste(event) {
    event.preventDefault();

    let paste = event.clipboardData.getData("text/plain");
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(paste));
    selection.collapseToEnd();

    setText(event.target.innerText);
  }

  return (
    <div className="flex gap-2 px-4">
      <div
        className="grow rounded-lg px-3 py-2 overflow-y-auto max-h-[100px] bg-slate-100  ring-2 ring-slate-300 focus-within:ring-purple-500 focus-within:ring-opacity-75"
        style={{ overflowWrap: "anywhere" }}
      >
        <p
          contentEditable
          className="sendThoughtInput outline-none whitespace-pre-line break-anywhere"
          suppressContentEditableWarning={true}
          onInput={(e) => {
            setText(e.target.innerText);
          }}
          ref={textRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          onPaste={handlePaste}
          spellCheck={false}
        ></p>
      </div>
      <button onClick={handleSubmit}>
        <PaperAirplaneIcon className="w-6 h-6 text-black transition duration-200" />
      </button>
    </div>
  );
}
