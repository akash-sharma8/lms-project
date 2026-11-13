import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function Quiz() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/quizzes/${quizId}`)
      .then(({ data }) => {
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(-1));
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load quiz"));
  }, [quizId]);

  function pick(qIndex, optIndex) {
    const next = [...answers];
    next[qIndex] = optIndex;
    setAnswers(next);
  }

  async function handleSubmit() {
    const skipped = answers.filter((a) => a === -1).length;
    if (skipped > 0 && !window.confirm(`${skipped} question(s) unanswered. Submit anyway?`)) {
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post(`/quizzes/${quizId}/submit`, { answers });
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setResult(null);
    setAnswers(new Array(quiz.questions.length).fill(-1));
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-3xl animate-pulse space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="h-7 w-1/2 rounded-lg bg-gray-200" />
            <div className="mt-2 h-4 w-28 rounded bg-gray-100" />
          </div>
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="h-5 w-3/4 rounded bg-gray-200" />
              <div className="h-10 w-full rounded-xl bg-gray-100" />
              <div className="h-10 w-full rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const answeredCount = answers.filter((a) => a !== -1).length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Quiz Header Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                {quiz.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs font-medium text-gray-500">
                <span>{quiz.questions.length} questions</span>
                <span>•</span>
                <span>Pass mark: {quiz.passPercent}%</span>
              </div>
            </div>

            {!result && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {answeredCount} of {quiz.questions.length} answered
              </span>
            )}
          </div>
        </div>

        {/* Result Score Banner */}
        {result && (
          <div
            className={`flex flex-col justify-between gap-4 rounded-2xl border p-6 shadow-sm sm:flex-row sm:items-center ${
              result.passed
                ? "border-emerald-200 bg-emerald-50/80"
                : "border-red-200 bg-red-50/80"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                  result.passed
                    ? "bg-emerald-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {result.passed ? "✓" : "✕"}
              </div>
              <div>
                <h2
                  className={`text-lg font-bold ${
                    result.passed ? "text-emerald-900" : "text-red-900"
                  }`}
                >
                  {result.passed ? "Quiz Passed!" : "Not Passed"}
                </h2>
                <p
                  className={`mt-0.5 text-sm font-medium ${
                    result.passed ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  You scored {result.score} out of {result.total} (
                  {result.percent}%)
                </p>
              </div>
            </div>

            <button
              onClick={retry}
              className="self-start rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.99] sm:self-auto"
            >
              Try again
            </button>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {quiz.questions.map((q, i) => {
            const r = result?.review[i];
            return (
              <div
                key={q._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                    {i + 1}
                  </span>
                  <h3 className="text-base font-semibold leading-snug text-gray-900">
                    {q.text}
                  </h3>
                </div>

                <div className="space-y-2">
                  {q.options.map((opt, j) => {
                    const isSelected = answers[i] === j;
                    let optionStyle =
                      "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/70";

                    if (r) {
                      if (j === r.correctIndex) {
                        optionStyle =
                          "border-emerald-300 bg-emerald-50/80 font-medium text-emerald-900";
                      } else if (j === r.picked) {
                        optionStyle =
                          "border-red-300 bg-red-50/80 font-medium text-red-900";
                      } else {
                        optionStyle =
                          "border-gray-100 bg-gray-50/50 text-gray-400";
                      }
                    } else if (isSelected) {
                      optionStyle =
                        "border-blue-600 bg-blue-50/50 font-medium text-blue-900 ring-1 ring-blue-600/20";
                    }

                    return (
                      <label
                        key={j}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                          result ? "cursor-default" : "cursor-pointer"
                        } ${optionStyle}`}
                      >
                        <input
                          type="radio"
                          name={`q${i}`}
                          checked={isSelected}
                          disabled={!!result}
                          onChange={() => pick(i, j)}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="flex-1">{opt}</span>
                        {r && j === r.correctIndex && (
                          <span className="text-xs font-semibold text-emerald-700">
                            Correct
                          </span>
                        )}
                        {r && j === r.picked && j !== r.correctIndex && (
                          <span className="text-xs font-semibold text-red-700">
                            Your pick
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {r?.explanation && (
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-xs leading-relaxed text-gray-700">
                    <span className="font-semibold text-blue-800">
                      Explanation:{" "}
                    </span>
                    {r.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Action Bar */}
        {!result && (
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
            <span className="text-xs font-medium text-gray-500">
              {answeredCount === quiz.questions.length
                ? "All questions answered"
                : `${quiz.questions.length - answeredCount} remaining`}
            </span>

            <button
              onClick={handleSubmit}
              disabled={busy}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Checking..." : "Submit quiz"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}