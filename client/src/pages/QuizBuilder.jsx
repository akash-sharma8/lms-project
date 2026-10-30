
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const blankQuestion = () => ({
  text: "",
  options: ["", ""],
  correctIndex: 0,
  explanation: "",
});

export default function QuizBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [passPercent, setPassPercent] = useState(60);
  const [questions, setQuestions] = useState([blankQuestion()]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // ek question ke fields badlo, baaki same rakho
  const patchQuestion = (i, patch) =>
    setQuestions(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  function setOption(i, j, value) {
    const options = questions[i].options.map((o, k) => (k === j ? value : o));
    patchQuestion(i, { options });
  }

  function addOption(i) {
    if (questions[i].options.length >= 6) return;
    patchQuestion(i, { options: [...questions[i].options, ""] });
  }

  function removeOption(i, j) {
    const q = questions[i];
    if (q.options.length <= 2) return;
    const options = q.options.filter((_, k) => k !== j);
    // sahi answer wale se pehle wala option hata to index ek peeche khiskega
    let correctIndex = q.correctIndex;
    if (j < correctIndex) correctIndex -= 1;
    else if (j === correctIndex) correctIndex = 0;
    patchQuestion(i, { options, correctIndex });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return setError(`Question ${i + 1} has no text`);
      if (q.options.some((o) => !o.trim())) return setError(`Question ${i + 1} has an empty option`);
    }

    setBusy(true);
    try {
      await api.post(`/courses/${id}/quizzes`, {
        title,
        passPercent: Number(passPercent),
        questions,
      });
      navigate(`/instructor/courses/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save quiz");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, maxWidth: 700 }}>
      <Link to={`/instructor/courses/${id}`}>← Back to course</Link>
      <h2>New quiz</h2>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ flex: 1 }}
        />
        <label>
          Pass %{" "}
          <input
            type="number"
            min="1"
            max="100"
            value={passPercent}
            onChange={(e) => setPassPercent(e.target.value)}
            style={{ width: 60 }}
          />
        </label>
      </div>

      {questions.map((q, i) => (
        <div key={i} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginTop: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <b>Q{i + 1}</b>
            <input
              placeholder="Question text"
              value={q.text}
              onChange={(e) => patchQuestion(i, { text: e.target.value })}
              style={{ flex: 1 }}
            />
            {questions.length > 1 && (
              <button type="button" onClick={() => setQuestions(questions.filter((_, k) => k !== i))}>
                Remove
              </button>
            )}
          </div>

          {q.options.map((opt, j) => (
            <div key={j} style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
              <input
                type="radio"
                name={`correct-${i}`}
                checked={q.correctIndex === j}
                onChange={() => patchQuestion(i, { correctIndex: j })}
                title="Mark as correct answer"
              />
              <input
                placeholder={`Option ${j + 1}`}
                value={opt}
                onChange={(e) => setOption(i, j, e.target.value)}
                style={{ flex: 1 }}
              />
              {q.options.length > 2 && (
                <button type="button" onClick={() => removeOption(i, j)}>x</button>
              )}
            </div>
          ))}

          <div style={{ marginTop: 6 }}>
            <button type="button" onClick={() => addOption(i)} disabled={q.options.length >= 6}>
              + Option
            </button>
            <small> (radio button = correct answer)</small>
          </div>

          <input
            placeholder="Explanation (optional, shown after submit)"
            value={q.explanation}
            onChange={(e) => patchQuestion(i, { explanation: e.target.value })}
            style={{ width: "100%", marginTop: 8, boxSizing: "border-box" }}
          />
        </div>
      ))}

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button type="button" onClick={() => setQuestions([...questions, blankQuestion()])}>
          + Add question
        </button>
        <button disabled={busy}>{busy ? "Saving..." : "Save quiz"}</button>
      </div>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </form>
  );
}