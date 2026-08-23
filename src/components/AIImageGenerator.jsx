import { useState } from "react";
import { LuImage, LuSparkles } from "react-icons/lu";
import "./AIImageGenerator.css";

function AIImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please describe the image you want Lumi to create.");
      return;
    }

    setLoading(true);
    setImage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3001/api/generate-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Lumi couldn't generate the image."
        );
      }

      if (!data.image) {
        throw new Error("No image was returned by Lumi.");
      }

      setImage(data.image);
    } catch (error) {
      console.error("Image generation error:", error);

      setError(
        "Lumi couldn't generate the image right now. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="image-generator" id="visual-learning">
      <div className="image-generator-heading">
        <div className="image-generator-label">
          <LuSparkles />
          <span>AI Visual Learning</span>
        </div>

        <h2>
          Learn with
          <span> AI-generated visuals.</span>
        </h2>

        <p>
          Ask Lumi to create an educational image to help you understand
          difficult topics visually.
        </p>
      </div>

      <div className="image-generator-card">
        <div className="image-generator-input">
          <LuImage />

          <input
            type="text"
            placeholder="Describe an educational image..."
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                generateImage();
              }
            }}
          />

          <button
            type="button"
            onClick={generateImage}
            disabled={loading}
          >
            <LuSparkles />

            {loading ? "Creating..." : "Generate"}
          </button>
        </div>

        {loading && (
          <div className="image-loading">
            <LuSparkles />
            <p>Lumi is creating your visual...</p>
          </div>
        )}

        {error && !loading && (
          <div className="image-error">
            <p>{error}</p>
          </div>
        )}

        {image && !loading && !error && (
          <div className="generated-image">
            <img
              src={image}
              alt={prompt}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default AIImageGenerator;