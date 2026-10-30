import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function VerifyCertificate() {
  const { certId } = useParams();
  const [info, setInfo] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/certificates/${certId}/verify`)
      .then(({ data }) => setInfo(data))
      .catch(() => setNotFound(true));
  }, [certId]);

  if (notFound) {
    return (
      <div style={{ padding: 24, maxWidth: 480 }}>
        <h2 style={{ color: "crimson" }}>Certificate not valid</h2>
        <p>No certificate with ID <b>{certId}</b> exists in our records.</p>
      </div>
    );
  }
  if (!info) return <p style={{ padding: 24 }}>Checking...</p>;

  return (
    <div style={{ padding: 24, maxWidth: 480 }}>
      <h2 style={{ color: "green" }}>Certificate is valid</h2>
      <p><b>{info.studentName}</b> completed <b>{info.courseTitle}</b></p>
      <p>Instructor: {info.instructorName}</p>
      <p>Issued on: {info.issuedOn}</p>
      <small>ID: {info.certificateId}</small>
    </div>
  );
}