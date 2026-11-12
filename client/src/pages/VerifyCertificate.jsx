import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
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

          <h2 className="text-xl font-bold text-gray-900">
            Certificate not valid
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No certificate with ID{" "}
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-gray-800">
              {certId}
            </span>{" "}
            exists in our records.
          </p>

          <Link
            to="/"
            className="mt-6 inline-block w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Back to EduPortal
          </Link>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md animate-pulse rounded-2xl border border-gray-200 bg-white p-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-200" />
          <div className="mx-auto mt-4 h-6 w-48 rounded bg-gray-200" />
          <div className="mt-6 space-y-3">
            <div className="h-16 w-full rounded-xl bg-gray-100" />
            <div className="h-16 w-full rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Top Verified Banner */}
        <div className="border-b border-emerald-100 bg-emerald-50/70 px-6 py-5 text-center">
          <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">
            Verified Credential
          </span>
          <h1 className="mt-2 text-xl font-bold text-gray-900">
            Certificate is Valid
          </h1>
        </div>

        {/* Certificate Details */}
        <div className="p-6 sm:p-8">
          <div className="text-center">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Awarded to
            </span>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {info.studentName}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              for successfully completing
            </p>
            <p className="mt-1 text-base font-bold text-blue-600">
              {info.courseTitle}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm">
            <div>
              <span className="block text-xs text-gray-500">Instructor</span>
              <span className="mt-0.5 block font-semibold text-gray-900">
                {info.instructorName}
              </span>
            </div>

            <div>
              <span className="block text-xs text-gray-500">Issued on</span>
              <span className="mt-0.5 block font-semibold text-gray-900">
                {info.issuedOn}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
            <span>Certificate ID</span>
            <span className="rounded-md bg-gray-100 px-2.5 py-1 font-mono font-semibold text-gray-700">
              {info.certificateId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}