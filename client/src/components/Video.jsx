import React, { useEffect, useRef } from "react";

export default function Video({ peer }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (peer.stream) {
      videoRef.current.srcObject = peer.stream;
      videoRef.current.play();
    }
  }, [peer]);

  return (
    <div>
      <video style={{ width: "300px" }} ref={videoRef} autoPlay playsInline />
    </div>
  );
}
