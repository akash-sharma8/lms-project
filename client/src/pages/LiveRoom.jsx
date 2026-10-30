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
      <div style={{ padding: 24 }}>
        <p style={{ color: "crimson" }}>{error}</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }
  if (!conn) return <p style={{ padding: 24 }}>Joining...</p>;

  return (
    <div data-lk-theme="default" style={{ height: "calc(100vh - 56px)" }}>
      <LiveKitRoom
        serverUrl={conn.url}
        token={conn.token}
        connect={true}
        video={conn.isHost}
        audio={conn.isHost}
        onDisconnected={() => navigate(-1)}
        style={{ height: "100%" }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}