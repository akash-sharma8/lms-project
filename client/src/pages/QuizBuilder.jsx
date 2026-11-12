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
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
        {/* Back Navigation */}
        <div>
          <Link
            to={`/instructor/courses/${id}`}
            className="group mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-blue-600"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            Back to course
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Create New Quiz
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Set up questions, mark correct answers, and add helpful explanations
          </p>
        </div>

        {/* Quiz Settings Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Quiz title
              </label>
              <input
                placeholder="e.g. Module 1 Assessment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Pass mark (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={passPercent}
                onChange={(e) => setPassPercent(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>
        </div>

        {/* Questions Builder List */}
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              {/* Question Header & Input */}
              <div className="flex items-start gap-3">
                <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                  Q{i + 1}
                </span>

                <div className="flex-1">
                  <input
                    placeholder="Enter question text..."
                    value={q.text}
                    onChange={(e) => patchQuestion(i, { text: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions(questions.filter((_, k) => k !== i))
                    }
                    className="mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Options List */}
              <div className="mt-4 space-y-2.5 pl-0 sm:pl-10">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Answer options</span>
                  <span>Select the circle to mark correct answer</span>
                </div>

                {q.options.map((opt, j) => {
                  const isCorrect = q.correctIndex === j;
                  return (
                    <div
                      key={j}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition ${
                        isCorrect
                          ? "border-emerald-300 bg-emerald-50/40"
                          : "border-gray-200 bg-gray-50/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correct-${i}`}
                        checked={isCorrect}
                        onChange={() => patchQuestion(i, { correctIndex: j })}
                        title="Mark as correct answer"
                        className="h-4 w-4 cursor-pointer border-gray-300 text-emerald-600 focus:ring-emerald-600"
                      />

                      <input
                        placeholder={`Option ${j + 1}`}
                        value={opt}
                        onChange={(e) => setOption(i, j, e.target.value)}
                        className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                      />

                      {isCorrect && (
                        <span className="hidden rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 sm:inline-block">
                          Correct
                        </span>
                      )}

                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i, j)}
                          title="Remove option"
                          className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add Option Trigger */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => addOption(i)}
                    disabled={q.options.length >= 6}
                    className="inline-flex items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>+</span> Add option
                  </button>
                </div>

                {/* Optional Explanation Field */}
                <div className="pt-2">
                  <input
                    placeholder="Explanation (optional, shown to students after submit)"
                    value={q.explanation}
                    onChange={(e) =>
                      patchQuestion(i, { explanation: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Bottom Sticky-Style Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <button
            type="button"
            onClick={() => setQuestions([...questions, blankQuestion()])}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.99]"
          >
            <span>+</span> Add question
          </button>

          <button
            disabled={busy}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save quiz"}
          </button>
        </div>
      </form>
    </div>
  );
}