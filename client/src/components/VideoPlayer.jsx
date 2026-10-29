import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function VideoPlayer({ lessonId, onEnded }) {
  const videoRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    const token = localStorage.getItem("token");
    const src = `${import.meta.env.VITE_API_URL}/lessons/${lessonId}/stream/master.m3u8`;

    const hls = new Hls({
      xhrSetup: (xhr) => xhr.setRequestHeader("Authorization", `Bearer ${token}`),
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) setError("Could not load this video (are you enrolled?)");
    });

    hls.loadSource(src);
    hls.attachMedia(videoRef.current);

    // lesson badalne par purana player band karna zaroori hai
    return () => hls.destroy();
  }, [lessonId]);

  return (
    <div>
      <video
        ref={videoRef}
        controls
        onEnded={onEnded}
        style={{ width: "100%", maxHeight: 480, background: "#000" }}
      />
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}