import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import { FeatureCard, features } from "./components/FeatureCard";
import QuestionForm from "./components/QuestionForm";
import AIResponseCard from "./components/AIResponseCard";
import AIImageGenerator from "./components/AIImageGenerator";
import About from "./components/About";
import { LuSparkles } from "react-icons/lu";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <section className="features-section" id="features">
          <div className="features-heading">
            <div className="features-label">
              <LuSparkles />
              <span>Why LumiAI</span>
            </div>

            <h2>
              Everything you need to
              <br />
              <span>learn with confidence.</span>
            </h2>

            <p>
              From breaking down difficult concepts to creating personalized
              study support, LumiAI is designed to make learning feel easier.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>

        <QuestionForm />

        <AIResponseCard />

        <AIImageGenerator />

        <About />
      </main>
    </>
  );
}

export default App;