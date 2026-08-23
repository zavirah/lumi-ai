import {
  LuCopy,
  LuRefreshCw,
  LuSparkles,
  LuThumbsDown,
  LuThumbsUp,
} from "react-icons/lu";
import "./AIResponseCard.css";

function AIResponseCard({ answer, loading, onRegenerate }) {
  if (!loading && !answer) {
    return null;
  }

  return (
    <section className="response-section">
      <div className="response-heading">
        <div className="response-label">
          <LuSparkles />
          <span>Lumi's response</span>
        </div>

        <h2>Your answer, made simple.</h2>
      </div>

      <div className="response-card">
        <div className="response-card-header">
          <div className="response-profile">
            <div className="response-avatar">
              <LuSparkles />
            </div>

            <div>
              <strong>LumiAI</strong>
              <span>AI Study Assistant</span>
            </div>
          </div>

          <span className="response-status">
            <span></span>
            {loading ? "Thinking..." : "Generated just now"}
          </span>
        </div>

        <div className="response-body">
          <h3>{loading ? "Lumi is thinking..." : "Your answer"}</h3>

          <p>
            {loading
              ? "Please wait while Lumi prepares your answer."
              : answer}
          </p>

          {!loading && (
            <div className="response-tip">
              <div className="tip-icon">💡</div>

              <div>
                <strong>Quick tip</strong>
                <p>
                  You can ask Lumi a follow-up question if you want a deeper
                  explanation or another example.
                </p>
              </div>
            </div>
          )}
        </div>

        {!loading && (
          <div className="response-actions">
            <div>
              <button type="button" aria-label="Helpful">
                <LuThumbsUp />
              </button>

              <button type="button" aria-label="Not helpful">
                <LuThumbsDown />
              </button>

              <button
                type="button"
                aria-label="Copy response"
                onClick={() => navigator.clipboard.writeText(answer)}
              >
                <LuCopy />
              </button>
            </div>

            <button
              className="regenerate-button"
              type="button"
              onClick={onRegenerate}
            >
              <LuRefreshCw />
              Regenerate
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default AIResponseCard;