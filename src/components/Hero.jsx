import { FiArrowRight } from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-badge">
          <LuSparkles />
          <span>Your intelligent study companion</span>
        </div>

        <h1>
          Study smarter.
          <br />
          <span>Understand faster.</span>
        </h1>

        <p>
          Meet LumiAI, your personal AI study companion designed to help you
          understand difficult topics, simplify your notes, and learn with
          confidence.
        </p>

        <div className="hero-buttons">
          <a href="#ask" className="hero-primary">
            Ask Lumi
            <FiArrowRight />
          </a>

          <a href="#features" className="hero-secondary">
            Explore features
          </a>
        </div>

        <div className="hero-trust">
          <div className="trust-avatars">
            <span>👩🏽‍💻</span>
            <span>👩🏻‍🎓</span>
            <span>👨🏽‍💻</span>
          </div>

          <div>
            <strong>Learn with confidence</strong>
            <p>Built for curious minds ✨</p>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-glow"></div>

        <div className="ai-card">
          <div className="ai-card-header">
            <div className="ai-avatar">
              <LuSparkles />
            </div>

            <div>
              <strong>LumiAI</strong>
              <span>Always ready to help</span>
            </div>

            <div className="online-dot"></div>
          </div>

          <div className="ai-message user-message">
            Can you explain differential equations simply?
          </div>

          <div className="ai-message">
            <div className="message-icon">
              <LuSparkles />
            </div>

            <div>
              <strong>Of course! ✨</strong>
              <p>
                Think of a differential equation as a way of describing how
                something changes over time.
              </p>
            </div>
          </div>

          <div className="typing">
            <span></span>
            <span></span>
            <span></span>
            Lumi is thinking...
          </div>
        </div>

        <div className="floating-card floating-card-one">
          <span>🧠</span>
          <div>
            <strong>Smart explanations</strong>
            <small>Made simple for you</small>
          </div>
        </div>

        <div className="floating-card floating-card-two">
          <span>✨</span>
          <div>
            <strong>Personalized</strong>
            <small>Learning your way</small>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;