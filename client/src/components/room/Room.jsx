import { useMeetContext } from "@/contexts/MeetProvider";
import LocalVideoTools from "@/components/room/LocalVideoTools";
import LocalVideo from "@/components/room/LocalVideo";
import Peer from "@/components/room/Peer";
import { socket } from "@/lib/socket";
import React, { useEffect, useMemo, useRef, useState } from "react";
import SimplePeer from "simple-peer/simplepeer.min.js";
import ChatSidebar from "@/components/room/ChatSidebar";

export default function Room({ room, setJoinRoom }) {
  const { user, localStream, peers, setPeers, peersArr, peersRef, streamSettings, showChatSidebar, showPeersSidebar } = useMeetContext();
  const [isConnected, setIsConnceted] = useState(false);
  const [pinned, setPinned] = useState(null);

  // const hostPeer = useMemo(() => peersArr.find((p) => p.user.id === room.host.id), [peers]);

  // useEffect(() => {
  //   if (hostPeer?.stream) {
  //     hostVideoRef.current.srcObject = hostPeer.stream;
  //   }
  // }, [hostPeer]);

  useEffect(() => {
    socket._opts.query.user = JSON.stringify(user);

    socket.connect();

    socket.on("connect", () => {
      setIsConnceted(true);
    });

    socket.on("disconnet", () => {
      setIsConnceted(false);
    });

    socket.on("user-left", (socketId) => {
      console.log("user left", socketId);
      setPeers((prev) => {
        delete prev[socketId];
        return { ...prev };
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("user-left");
    };
  }, []);

  useEffect(() => {
    socket.on("request-stream-settings", ({ from }) => {
      console.log("request stream settings", from);
      socket.emit("stream-settings", { to: from, streamSettings });
    });

    return () => {
      socket.off("request-stream-settings");
    };
  }, [streamSettings]);

  useEffect(() => {
    if (!isConnected) return;

    socket.emit("join-room", room.id);

    // ----------------------------------------------------------------------------
    // ----------------------------------------------------------------------------
    socket.on("user-joined", (user) => {
      const peer = new SimplePeer({
        initiator: true,
        trickle: true,
        stream: localStream,
        config: {
          iceServers: [
            {
              urls: "stun:stun.l.google.com:19302",
            },
          ],
        },
      });

      peer.on("signal", (signal) => {
        console.log("-------------------- signal from user-joined --------------------");
        console.log(signal);
        socket.emit("send-signal", { userToSignal: user, signal });
      });

      peer.on("stream", (stream) => {
        console.log("incoming stream from user-joined", peer, stream);
        // setPeers((users) => ({ ...users, [user.socketId]: { ...users[user.socketId], stream } }));
        setPeers((users) => ({ ...users, [user.socketId]: { id: user.socketId, user, peer, stream } }));
        peersRef.current = { ...peersRef.current, [user.socketId]: { id: user.socketId, user, peer, stream } };
        // setPeers((users) => [...users, { id: user.socketId, user, peer, stream }]);
      });

      peer.on("error", (err) => {
        console.log(err);
      });

      peer.on("data", (data) => {
        let str = new TextDecoder("utf-8").decode(data);
        console.log("initiator - ", str);
      });

      peer.on("close", () => {
        console.log("peer closed");
        setPeers((prev) => {
          delete prev[user.socketId];
          return { ...prev };
        });
      });

      socket.on("signal-" + user.socketId, (data) => {
        peer.signal(data.signal);
      });
      // setPeers((users) => ({ ...users, [user.socketId]: { id: user.socketId, user, peer } }));
      // peersRef.current.push({ id: user.socketId, peer });
    });

    // ----------------------------------------------------------------------------
    // ----------------------------------------------------------------------------
    socket.on("signal", ({ sender, signal }) => {
      console.log("incoming signle", sender, signal);
      const peer = new SimplePeer({
        initiator: false,
        trickle: true,
        stream: localStream,
        config: {
          iceServers: [
            {
              urls: "stun:stun.l.google.com:19302",
            },
          ],
        },
      });

      peer.on("signal", (data) => {
        socket.emit("return-signal", { signal: data, userToSignal: sender });
      });

      peer.on("stream", (stream) => {
        console.log("incoming stream from onSignal", peer, stream);
        setPeers((users) => ({ ...users, [sender.socketId]: { id: sender.socketId, user: sender, peer, stream } }));
        // setPeers((users) => ({ ...users, [sender.socketId]: { ...users[sender.socketId], stream } }));
        peersRef.current = { ...peersRef.current, [sender.socketId]: { id: sender.socketId, user: sender, peer, stream } };

        // setPeers((users) => [...users, { id: sender.socketId, user: sender, peer, stream }]);
      });

      peer.on("data", (data) => {
        let str = new TextDecoder("utf-8").decode(data);
        console.log("non-initiator - ", str);
      });

      peer.on("close", () => {
        console.log("peer closed");
        setPeers((prev) => {
          delete prev[sender.socketId];
          return { ...prev };
        });
      });

      peer.on("error", (err) => {
        console.log(err);
      });

      // setPeers((users) => ({ ...users, [sender.socketId]: { id: sender.socketId, user: sender, peer } }));
      peer.signal(signal);
      // peersRef.current.push({ id: sender, peer });
    });

    return () => {
      socket.off("user-joined");
      socket.off("signal");
    };
  }, [isConnected]);

  console.log("pinned", pinned, peers[pinned]);

  return (
    <div className="min-h-screen py-3">
      <div className=" flex items-center gap-8 h-0 min-h-[calc(100vh_-_100px)] px-3">
        <p className="fixed top-1 left-1 z-50 px-2 py-0.5 rounded-lg bg-slate-700 text-white text-xs">{room.name}</p>
        {/* <div className={`${hostPeer?.stream?.getVideoTracks?.()?.[0] || true ? "" : "hidden"} grow max-h-full bg-black aspect-[800/500]`}>
          <video className="w-full h-full" ref={hostVideoRef} autoPlay></video>
        </div> */}
        {peers[pinned] ? (
          <div className="grow shrink-">
            <Peer room={room} key={peers[pinned].id} peer={peers[pinned]} setPinned={setPinned} isPinned={true} pinned={pinned} />
          </div>
        ) : null}
        <div
          className={`${
            peers[pinned] && showPeersSidebar
              ? "fixed right-0 top-3 w-[300px] h-full px-2 bg-slate-700 box-content"
              : peers[pinned] && !showPeersSidebar
              ? "fixed right-0 top-3 translate-x-full w-[300px] h-full px-2 bg-slate-700 box-content"
              : "grow"
          } lg:static lg:translate-x-0 max-h-[calc(100vh_-_100px)] overflow-y-auto shrink-0 flex items-center justify-center flex-wrap gap-3 rounded-l-xl lg:bg-transparent duration-300`}
        >
          <LocalVideo room={room} />
          {peersArr
            // .filter((p: any) => p.user.id !== room.host.id)
            .map((peer) => (
              <Peer room={room} key={peer.id} peer={peer} setPinned={setPinned} isPinned={false} pinned={pinned} />
            ))}
        </div>
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2">
          <LocalVideoTools setJoinRoom={setJoinRoom} />
        </div>
        <ChatSidebar room={room} />
      </div>
    </div>
  );
}
