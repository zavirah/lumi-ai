import {
  LuCheck,
  LuGraduationCap,
  LuHeart,
  LuSparkles,
} from "react-icons/lu";
import "./About.css";

function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-visual">
        <div className="about-orbit orbit-one"></div>
        <div className="about-orbit orbit-two"></div>

        <div className="about-main-card">
          <div className="about-card-icon">
            <LuSparkles />
          </div>

          <span>Meet Lumi</span>

          <h3>
            Learning should feel
            <br />
            <strong>less overwhelming.</strong>
          </h3>

          <div className="about-mini-card">
            <div className="mini-icon">
              <LuGraduationCap />
            </div>

            <div>
              <strong>Made for learners</strong>
              <span>Study at your own pace</span>
            </div>

            <LuCheck className="mini-check" />
          </div>
        </div>

        <div className="about-floating about-floating-one">
          🧠
          <span>Understand</span>
        </div>

        <div className="about-floating about-floating-two">
          ✨
          <span>Learn</span>
        </div>
      </div>

      <div className="about-content">
        <div className="about-label">
          <LuHeart />
          <span>About LumiAI</span>
        </div>

        <h2>
          Your questions deserve
          <br />
          <span>better explanations.</span>
        </h2>

        <p>
          LumiAI is an intelligent study companion designed to make learning
          clearer, simpler, and more personal. Instead of struggling through
          complicated explanations alone, you can ask Lumi to break ideas
          down in a way that makes sense to you.
        </p>

        <p>
          Whether you're revising for an exam, learning a new concept, or
          simply curious about something, Lumi is here to help you understand
          — not just memorize.
        </p>

        <div className="about-points">
          <div>
            <LuCheck />
            <span>Simple, understandable explanations</span>
          </div>

          <div>
            <LuCheck />
            <span>Personalized study assistance</span>
          </div>

          <div>
            <LuCheck />
            <span>Designed around your learning journey</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;