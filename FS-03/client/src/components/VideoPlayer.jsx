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
    <div className="relative w-full bg-black">
      {error ? (
        <div className="flex aspect-video w-full flex-col items-center justify-center bg-gray-900 px-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.75"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-white">Playback Error</p>
          <p className="mt-1 max-w-sm text-xs text-gray-400">{error}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          controls
          onEnded={onEnded}
          className="aspect-video max-h-[520px] w-full bg-black object-contain focus:outline-none"
        />
      )}
    </div>
  );
}