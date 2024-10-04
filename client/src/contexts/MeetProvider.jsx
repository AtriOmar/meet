"use client";
import useLocalStorage from "@/lib/useLocalStorage";
import React, { useContext, useMemo, useRef, useState } from "react";
import { generateUsername } from "unique-username-generator";
import { v4 as uuidv4 } from "uuid";

const MeetContext = React.createContext(undefined);

export function MeetProvider({ children }) {
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);
  const [streamSettings, setStreamSettings] = useState({
    screenSharingEnabled: false,
    cameraEnabled: false,
    audioEnabled: false,
  });
  const [peers, setPeers] = useState({});
  const peersRef = useRef();
  const [showPeersSidebar, setShowPeersSidebar] = useState(false);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [user, setUser] = useLocalStorage("user", {
    id: uuidv4(),
    firstname: generateUsername("-"),
  });

  const peersArr = useMemo(() => Object.values(peers), [peers]);

  const value = {
    localStream,
    setLocalStream,
    localVideoRef,
    peers,
    setPeers,
    peersRef,
    peersArr,
    streamSettings,
    setStreamSettings,
    showPeersSidebar,
    setShowPeersSidebar,
    showChatSidebar,
    setShowChatSidebar,
    unreadMessages,
    setUnreadMessages,
    user,
    setUser,
  };
  return <MeetContext.Provider value={value}>{children}</MeetContext.Provider>;
}

export function useMeetContext() {
  const context = useContext(MeetContext);
  if (context === undefined) {
    throw new Error("useCounter must be used within a CounterProvider");
  }
  return context;
}
