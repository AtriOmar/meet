import { useMeetContext } from "@/contexts/MeetProvider";
import {
  ChatBubbleBottomCenterTextIcon,
  EllipsisVerticalIcon,
  FaceSmileIcon,
  HandRaisedIcon,
  MicrophoneIcon,
  PhoneIcon,
  UsersIcon,
  VideoCameraIcon,
} from "@heroicons/react/16/solid";
import React from "react";

export default function LocalVideoTools({ setJoinRoom }) {
  const {
    user,
    localStream,
    setLocalStream,
    peersArr,
    setPeers,
    streamSettings,
    setStreamSettings,
    setShowPeersSidebar,
    setShowChatSidebar,
    showChatSidebar,
    showPeersSidebar,
    unreadMessages,
  } = useMeetContext();

  async function toggleAudio() {
    if (!localStream) return;

    const oldAudioTrack = localStream.getAudioTracks()?.[0];
    console.log(localStream.getAudioTracks());
    if (!oldAudioTrack) return;

    if (oldAudioTrack.enabled) {
      oldAudioTrack.enabled = false;
      oldAudioTrack.stop();
      setStreamSettings((prev) => ({ ...prev, audioEnabled: false }));
      peersArr.forEach((peer) => {
        peer.peer.send("audio-disabled");
      });
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      const newAudioTrack = stream.getAudioTracks()[0];
      peersArr.forEach((peer) => {
        peer.peer.replaceTrack(oldAudioTrack, newAudioTrack, peer.peer.streams[0]);
        peer.peer.send("audio-enabled");
      });
      localStream.removeTrack(oldAudioTrack);
      localStream.addTrack(newAudioTrack);
      setStreamSettings((prev) => ({ ...prev, audioEnabled: true }));
    }
  }

  async function toggleVideo() {
    if (!localStream) return;

    const oldVideoTrack = localStream.getVideoTracks()?.[0];
    console.log(localStream.getVideoTracks());
    if (!oldVideoTrack) return;

    if (oldVideoTrack.enabled) {
      oldVideoTrack.enabled = false;
      oldVideoTrack.stop();
      setStreamSettings((prev) => ({ ...prev, cameraEnabled: false, screenSharingEnabled: false }));
      peersArr.forEach((peer) => {
        peer.peer.send("video-disabled");
        peer.peer.send("screen-sharing-disabled");
      });
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      const newVideoTrack = stream.getVideoTracks()[0];
      peersArr.forEach((peer) => {
        // peer.peer.replaceTrack(oldVideoTrack, newVideoTrack, peer.peer.streams[0]);
        try {
          peer.peer.replaceTrack(oldVideoTrack, newVideoTrack, peer.peer.streams[0]);
          peer.peer.send("video-enabled");
        } catch (err) {}
      });
      localStream.removeTrack(oldVideoTrack);
      localStream.addTrack(newVideoTrack);
      setStreamSettings((prev) => ({ ...prev, cameraEnabled: true }));
    }
    return;

    // else (there is no video track), get a video stream and add it to the local stream
    // const stream = await navigator.mediaDevices.getUserMedia({
    //   video: true,
    //   audio: false,
    // });
    // const videoTrack = stream.getVideoTracks()[0];
    // localStream.addTrack(videoTrack);
    // peersArr.forEach((peer) => {
    //   console.log("fdsfsf", peer.peer.streams[0].getVideoTracks(), localStream.getVideoTracks());
    //   // peer.peer.addTrack(videoTrack, peer.peer.streams[0]);
    //   // peer.peer.addTrack(videoTrack, peer.peer.streams[0]);
    //   peer.peer.addTrack(videoTrack, localStream);
    // });
    // setVideoOn(true);
  }

  async function toggleScreenSharing() {
    if (!localStream) return;

    const oldVideoTrack = localStream.getVideoTracks()?.[0];
    console.log(localStream.getVideoTracks());
    if (!oldVideoTrack) return;

    if (oldVideoTrack.enabled) {
      oldVideoTrack.enabled = false;
      oldVideoTrack.stop();
      setStreamSettings((prev) => ({ ...prev, cameraEnabled: false, screenSharingEnabled: false }));
      peersArr.forEach((peer) => {
        peer.peer.send("video-disabled");
        peer.peer.send("screen-sharing-disabled");
      });
    } else {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 1024, max: 1080 },
        },
      });
      console.log("screen stream", stream.getAudioTracks());
      const newVideoTrack = stream.getVideoTracks()[0];
      peersArr.forEach((peer) => {
        try {
          peer.peer.replaceTrack(oldVideoTrack, newVideoTrack, peer.peer.streams[0]);
          peer.peer.send("screen-sharing-enabled");
        } catch (err) {}
      });
      localStream.removeTrack(oldVideoTrack);
      localStream.addTrack(newVideoTrack);
      setStreamSettings((prev) => ({ ...prev, screenSharingEnabled: true }));
    }
    return;
  }

  async function toggleVideo2() {
    if (!localStream) return;

    // if there is a video track, stop it and remove it from the stream
    if (localStream.getVideoTracks().length > 0) {
      const track = localStream.getVideoTracks()[0];
      track.enabled = !track.enabled;
      setStreamSettings((prev) => ({ ...prev, cameraEnabled: track.enabled }));
      return;
    }

    // else (there is no video track), get a video stream and add it to the local stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    const videoTrack = stream.getVideoTracks()[0];
    peersArr.forEach((peer) => {
      peer.peer.addTrack(videoTrack, localStream);
    });
    localStream.addTrack(videoTrack);
    setStreamSettings((prev) => ({ ...prev, cameraEnabled: true }));
  }

  function leaveRoom() {
    peersArr.forEach((peer) => {
      peer.peer.destroy();
    });
    setPeers({});
    setJoinRoom(false);
  }

  return (
    <div className="flex gap-3 justify-between items-center w-screen max-w-[1350px] mt-4 px-4">
      <div className="flex flex-1 gap-3 items-center">
        <img alt="avatar" src="/avatar.webp" className="size-[60px]" />
        <p className="font-bold text-white">{user.firstname}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={toggleAudio}
          className={`${
            streamSettings.audioEnabled ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600"
          } relative flex items-center justify-center size-12 rounded-full overflow-hidden duration-200`}
        >
          <div
            className={`${
              streamSettings.audioEnabled ? "hidden" : ""
            } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-0.5 h-4/5 bg-white`}
          ></div>
          <MicrophoneIcon className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={toggleVideo}
          className={`${
            streamSettings.cameraEnabled ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600"
          } relative flex items-center justify-center size-12 rounded-full overflow-hidden duration-200`}
        >
          <div
            className={`${
              streamSettings.cameraEnabled ? "hidden" : ""
            } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-0.5 h-4/5 bg-white transition-all`}
          ></div>
          <VideoCameraIcon className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={toggleScreenSharing}
          className={`${
            streamSettings.screenSharingEnabled ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600"
          } relative flex items-center justify-center size-12 rounded-full overflow-hidden duration-200`}
        >
          <div
            className={`${
              streamSettings.screenSharingEnabled ? "hidden" : ""
            } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-0.5 h-4/5 bg-white transition-all`}
          ></div>
          <MirroringScreenIcon />
        </button>
        <button
          onClick={toggleVideo}
          className={`bg-slate-700 hover:bg-slate-800 relative flex items-center justify-center size-12 rounded-full overflow-hidden duration-200`}
        >
          <div
            className={`${
              streamSettings.cameraEnabled ? "hidden" : "hidden"
            } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-0.5 h-4/5 bg-white transition-all`}
          ></div>
          <EllipsisVerticalIcon className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={toggleVideo}
          className={`bg-slate-700 hover:bg-slate-800 relative flex items-center justify-center size-12 rounded-full overflow-hidden duration-200`}
        >
          <div
            className={`${
              streamSettings.cameraEnabled ? "hidden" : "hidden"
            } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-0.5 h-4/5 bg-white transition-all`}
          ></div>
          <FaceSmileIcon className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={toggleVideo}
          className={`bg-slate-700 hover:bg-slate-800 relative flex items-center justify-center size-12 rounded-full overflow-hidden duration-200`}
        >
          <div
            className={`${
              streamSettings.cameraEnabled ? "hidden" : "hidden"
            } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-0.5 h-4/5 bg-white transition-all`}
          ></div>
          <HandRaisedIcon className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={leaveRoom}
          className={`bg-red-500 hover:bg-red-600 relative flex items-center justify-center size-12 rounded-full overflow-hidden duration-200`}
        >
          <div
            className={`${
              streamSettings.cameraEnabled ? "hidden" : "hidden"
            } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-0.5 h-4/5 bg-white transition-all`}
          ></div>
          <PhoneIcon className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="flex flex-1 gap-3 justify-end">
        <button
          onClick={() => {
            setShowChatSidebar((prev) => !prev);
          }}
          className={`${
            showChatSidebar ? "ring-2" : ""
          } bg-slate-700 hover:bg-slate-800 relative flex items-center justify-center size-12 rounded-full ring-blue-500 duration-200`}
        >
          {unreadMessages > 0 && (
            <div className="absolute top-0 left-0 size-4 flex items-center justify-center rounded-full bg-orange-500 text-white text-xs ">{unreadMessages}</div>
          )}
          <div
            className={`${
              streamSettings.cameraEnabled ? "hidden" : "hidden"
            } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-0.5 h-4/5 bg-white transition-all`}
          ></div>
          <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => {
            setShowPeersSidebar((prev) => !prev);
          }}
          className={`${
            showPeersSidebar ? "ring-2" : ""
          } bg-slate-700 hover:bg-slate-800 relative flex items-center justify-center size-12 rounded-full ring-blue-500 overflow-hidden duration-200`}
        >
          <div
            className={`${
              streamSettings.cameraEnabled ? "hidden" : "hidden"
            } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-0.5 h-4/5 bg-white transition-all`}
          ></div>
          <UsersIcon className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}

const MirroringScreenIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"white"} fill={"none"} {...props}>
    <path
      d="M4 21C4 19.8954 3.10457 19 2 19M8 21C8 17.6863 5.31371 15 2 15M12 21C12 15.4772 7.52285 11 2 11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M3 8.00027C3.0779 6.12787 3.32904 4.97985 4.1387 4.17164C5.31244 3 7.20153 3 10.9797 3H13.9853C17.7634 3 19.6525 3 20.8263 4.17164C22 5.34327 22 7.229 22 11.0004V12.0005C22 15.7719 22 17.6577 20.8263 18.8293C19.7612 19.8924 18.1071 19.9909 14.9871 20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
