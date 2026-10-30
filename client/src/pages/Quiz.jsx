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

  if (error) return <p style={{ padding: 24, color: "crimson" }}>{error}</p>;
  if (!quiz) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>
      <h2>{quiz.title}</h2>
      <small>Pass mark: {quiz.passPercent}%</small>

      {result && (
        <div
          style={{
            margin: "16px 0",
            padding: 16,
            borderRadius: 8,
            background: result.passed ? "#e8f5e9" : "#ffebee",
          }}
        >
          <h3 style={{ margin: 0 }}>
            {result.passed ? "Passed" : "Not passed"}: {result.score}/{result.total} ({result.percent}%)
          </h3>
          <button onClick={retry} style={{ marginTop: 8 }}>Try again</button>
        </div>
      )}

      {quiz.questions.map((q, i) => {
        const r = result?.review[i];
        return (
          <div key={q._id} style={{ margin: "20px 0" }}>
            <b>{i + 1}. {q.text}</b>
            {q.options.map((opt, j) => {
              let bg = "transparent";
              if (r) {
                if (j === r.correctIndex) bg = "#c8e6c9";
                else if (j === r.picked) bg = "#ffcdd2";
              }
              return (
                <label key={j} style={{ display: "block", padding: "6px 8px", background: bg, borderRadius: 4 }}>
                  <input
                    type="radio"
                    name={`q${i}`}
                    checked={answers[i] === j}
                    disabled={!!result}
                    onChange={() => pick(i, j)}
                  />{" "}
                  {opt}
                </label>
              );
            })}
            {r?.explanation && <small style={{ color: "#555" }}>{r.explanation}</small>}
          </div>
        );
      })}

      {!result && (
        <button onClick={handleSubmit} disabled={busy}>
          {busy ? "Checking..." : "Submit quiz"}
        </button>
      )}
    </div>
  );
}