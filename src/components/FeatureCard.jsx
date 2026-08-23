import { LuBookOpen, LuBrain, LuSparkles } from "react-icons/lu";
import "./FeatureCard.css";

const features = [
  {
    icon: LuBrain,
    title: "Smart Explanations",
    description:
      "Turn difficult concepts into clear, easy-to-understand explanations tailored to your learning level.",
  },
  {
    icon: LuBookOpen,
    title: "Study Assistance",
    description:
      "Get help with notes, summaries, examples, revision questions, and the topics you're currently studying.",
  },
  {
    icon: LuSparkles,
    title: "Personalized Learning",
    description:
      "Lumi adapts the experience around you so your study sessions feel more natural, focused, and useful.",
  },
];

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article className="feature-card">
      <div className="feature-icon">
        <Icon />
      </div>

      <div className="feature-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <span className="feature-arrow">↗</span>
    </article>
  );
}

export { FeatureCard, features };