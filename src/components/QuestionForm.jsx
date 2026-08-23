import { useState } from "react";
import {
  LuArrowUp,
  LuBookOpen,
  LuBrain,
  LuSparkles,
} from "react-icons/lu";
import AIResponseCard from "./AIResponseCard";
import "./QuestionForm.css";

function QuestionForm() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  const askLumi = async () => {
    if (!question.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("https://lumi-ai-mepd.onrender.com/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      const data = await response.json();

      console.log("Lumi response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setAnswer(data.answer);
    } catch (error) {
      console.error("Error asking Lumi:", error);
      alert("Sorry, Lumi couldn't answer right now.");
    } finally {
      setLoading(false);
    }
  };

  const useSuggestion = (text) => {
    setQuestion(text);
  };

  return (
    <section className="ask-section" id="ask">
      <div className="ask-intro">
        <div className="ask-label">
          <LuSparkles />
          <span>Meet your AI study companion</span>
        </div>

        <h2>
          What would you like
          <br />
          <span>to learn today?</span>
        </h2>

        <p>
          Ask Lumi anything about your studies. Get explanations, examples,
          summaries, and personalized help in seconds.
        </p>
      </div>

      <div className="question-area">
        <div className="question-card">
          <div className="question-top">
            <div className="question-user">
              <div className="question-avatar">Z</div>

              <div>
                <strong>Ask Lumi</strong>
                <span>Your personal study assistant</span>
              </div>
            </div>

            <div className="status-pill">
              <span></span>
              {loading ? "Thinking..." : "Ready"}
            </div>
          </div>

          <textarea
            placeholder="Ask me anything... e.g. Explain differential equations in simple terms."
            rows="5"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <div className="question-footer">
            <div className="question-options">
              <button
                type="button"
                onClick={() =>
                  setQuestion(
                    "Explain this topic to me in simple terms with examples."
                  )
                }
              >
                <LuBrain />
                Explain
              </button>

              <button
                type="button"
                onClick={() =>
                  setQuestion(
                    "Summarize this topic for me and give me the key points."
                  )
                }
              >
                <LuBookOpen />
                Summarize
              </button>
            </div>

            <button
              className="ask-button"
              type="button"
              onClick={askLumi}
              disabled={loading}
            >
              <span>{loading ? "Thinking..." : "Ask Lumi"}</span>
              <LuArrowUp />
            </button>
          </div>
        </div>

        <div className="suggestions">
          <span>Try asking:</span>

          <button
            type="button"
            onClick={() => useSuggestion("Explain recursion simply")}
          >
            Explain recursion simply
          </button>

          <button
            type="button"
            onClick={() => useSuggestion("Summarize my notes")}
          >
            Summarize my notes
          </button>

          <button
            type="button"
            onClick={() => useSuggestion("Give me quiz questions")}
          >
            Give me quiz questions
          </button>
        </div>
      </div>

      <AIResponseCard
        answer={answer}
        loading={loading}
        onRegenerate={askLumi}
      />

    </section>
  );
}

export default QuestionForm;