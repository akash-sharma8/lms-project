import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import api from "../api/axios";

export default function LiveRoom() {
  const { liveId } = useParams();
  const navigate = useNavigate();
  const [conn, setConn] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .post(`/live/${liveId}/token`)
      .then(({ data }) => setConn(data))
      .catch((err) => setError(err.response?.data?.message || "Could not join"));
  }, [liveId]);

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            Unable to join session
          </h3>
          <p className="mt-1.5 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.99]"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!conn) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gray-950 px-4 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
        <p className="mt-4 text-sm font-medium text-gray-300">
          Connecting to live classroom...
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Setting up audio and video streams
        </p>
      </div>
    );
  }

  return (
    <div
      data-lk-theme="default"
      className="flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden bg-gray-950"
    >
      <LiveKitRoom
        serverUrl={conn.url}
        token={conn.token}
        connect={true}
        video={conn.isHost}
        audio={conn.isHost}
        onDisconnected={() => navigate(-1)}
        className="h-full w-full"
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}