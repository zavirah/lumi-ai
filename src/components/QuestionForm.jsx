import { useEffect, useRef, useState } from "react";
import { LuArrowUp, LuBrain, LuBookOpen, LuCamera, LuFileUp, LuImage, LuMic, LuPaperclip, LuSparkles, LuX } from "react-icons/lu";
import "./QuestionForm.css";

const API = import.meta.env.DEV
  ? "http://localhost:3001/api"
  : "https://lumi-ai-mepd.onrender.com/api";
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,audio/wav,audio/mp3,audio/mpeg,audio/aiff,audio/aac,audio/ogg,audio/flac,audio/webm,audio/mp4,audio/m4a,application/pdf,text/plain,text/csv,text/markdown,.md";
const MAX_BYTES = 12 * 1024 * 1024;
const MAX_TOTAL_BYTES = 14 * 1024 * 1024;

function QuestionForm() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("chat");
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBars, setAudioBars] = useState(() => Array(20).fill(0.05));
  const inputRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const cameraDialogRef = useRef(null);
  const cameraDragRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioFrameRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (cameraOpen && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOpen]);

  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioFrameRef.current) cancelAnimationFrame(audioFrameRef.current);
    audioContextRef.current?.close().catch(() => {});
  }, []);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = window.setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraRef.current?.click();
      return;
    }
    try {
      cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setCameraOpen(true);
      setCameraOffset({ x: 0, y: 0 });
      setError("");
    } catch {
      setError("Camera access was blocked or unavailable. You can choose a photo file instead.");
    }
  };

  const closeCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    cameraDragRef.current = null;
    setCameraOpen(false);
    setCameraOffset({ x: 0, y: 0 });
  };

  const startCameraDrag = (event) => {
    if (event.target.closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    cameraDragRef.current = { pointerX: event.clientX, pointerY: event.clientY, offsetX: cameraOffset.x, offsetY: cameraOffset.y };
  };

  const moveCamera = (event) => {
    const drag = cameraDragRef.current;
    if (!drag) return;
    const bounds = cameraDialogRef.current?.getBoundingClientRect();
    const maxX = Math.max(0, (window.innerWidth - (bounds?.width || 0)) / 2 - 16);
    const maxY = Math.max(0, (window.innerHeight - (bounds?.height || 0)) / 2 - 16);
    const x = drag.offsetX + event.clientX - drag.pointerX;
    const y = drag.offsetY + event.clientY - drag.pointerY;
    setCameraOffset({ x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) });
  };

  const formatRecordingTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) {
      setError("The camera is still starting. Try again in a moment.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Lumi couldn't capture that photo. Please try again.");
        return;
      }
      addFiles([new File([blob], "camera-photo.jpg", { type: "image/jpeg" })]);
      closeCamera();
    }, "image/jpeg", 0.9);
  };

  const addFiles = (list) => {
    const incoming = Array.from(list || []);
    const tooLarge = incoming.find((file) => file.size > MAX_BYTES);
    if (tooLarge) { setError(`${tooLarge.name} is larger than 12 MB. Choose a smaller file.`); return; }
    const next = [...files, ...incoming].slice(0, 5);
    if (next.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_BYTES) {
      setError("Keep the combined attachment size under 14 MB.");
      return;
    }
    setFiles(next);
    setError("");
  };

  const toData = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: (file.type || "application/octet-stream").split(";")[0], data: String(reader.result).split(",")[1] });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const toggleRecording = async () => {
    if (recording) { recorderRef.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        addFiles([new File([blob], "voice-note.webm", { type: blob.type })]);
        stream.getTracks().forEach((track) => track.stop());
        if (audioFrameRef.current) cancelAnimationFrame(audioFrameRef.current);
        audioContextRef.current?.close().catch(() => {});
        audioContextRef.current = null;
        setAudioBars(Array(20).fill(0.05));
        setRecording(false);
      };
      recorder.start();
      setRecordingSeconds(0);
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.72;
        audioContext.createMediaStreamSource(stream).connect(analyser);
        audioContextRef.current = audioContext;
        const values = new Uint8Array(analyser.frequencyBinCount);
        let lastUpdate = 0;
        const measure = () => {
          analyser.getByteFrequencyData(values);
          const now = performance.now();
          if (now - lastUpdate > 85) {
            setAudioBars(Array.from({ length: 20 }, (_, index) => {
              const bin = values[Math.floor(index * values.length / 20)] || 0;
              return Math.max(0.05, Math.min(1, bin / 150));
            }));
            lastUpdate = now;
          }
          audioFrameRef.current = requestAnimationFrame(measure);
        };
        audioFrameRef.current = requestAnimationFrame(measure);
      }
      setRecording(true);
      setError("");
    } catch { setError("Microphone access was unavailable. You can upload an audio file instead."); }
  };

  const submit = async () => {
    if (busy || (!question.trim() && files.length === 0)) return;
    const prompt = question.trim() || (mode === "image" ? "Create an educational visual based on my attachment." : "Please help me understand this attachment.");
    const attached = files;
    const userMessage = { role: "user", text: prompt, files: attached.map((file) => ({ name: file.name, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "" })) };
    setMessages((items) => [...items, userMessage]);
    setQuestion(""); setFiles([]); setBusy(true); setError("");
    try {
      let response;
      if (mode === "image") {
        response = await fetch(`${API}/generate-image`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      } else {
        const attachments = await Promise.all(attached.map(toData));
        response = await fetch(`${API}/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: prompt, attachments }) });
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lumi couldn't complete that request.");
      const assistant = mode === "image" ? { role: "assistant", image: data.image, text: `Here’s your visual for “${prompt}”.` } : { role: "assistant", text: data.answer };
      setMessages((items) => [...items, assistant]);
    } catch (err) {
      setMessages((items) => items.filter((_, index) => index !== items.length - 1));
      setError(err.message || "Lumi couldn't respond. Please try again.");
    } finally { setBusy(false); }
  };

  return <section className="ask-section" id="ask">
    <div className="ask-intro">
      <div className="ask-label"><LuSparkles /><span>Your multimodal study companion</span></div>
      <h2>Bring your questions.<br /><span>Lumi will meet you there.</span></h2>
      <p>Chat through a tricky topic, explore a photo, make sense of a document or voice note, or create a visual to help an idea click.</p>
    </div>
    <div className="question-area">
      <div className="question-card">
        <div className="question-top"><div className="question-user"><div className="question-avatar">L</div><div><strong>Ask Lumi</strong><span>Text, images, files &amp; audio</span></div></div><div className="status-pill"><span />{busy ? "Working…" : "Ready"}</div></div>
        <div className="lumi-thread" aria-live="polite">
          {messages.length === 0 && <div className="thread-welcome"><span className="welcome-orb"><LuSparkles /></span><strong>What are you working on?</strong><p>Ask a question or add a file, photo, or voice note.</p><div className="welcome-prompts"><button onClick={() => setQuestion("Explain photosynthesis with a simple analogy")}>Explain a concept</button><button onClick={() => { setMode("image"); setQuestion("Create a clear, colorful educational diagram of the water cycle"); }}>Create a visual</button></div></div>}
          {messages.map((message, index) => <article className={`chat-message ${message.role}`} key={index}><div className="message-avatar">{message.role === "user" ? "Z" : <LuSparkles />}</div><div className="message-content"><strong>{message.role === "user" ? "You" : "Lumi"}</strong>{message.text && <p>{message.text}</p>}{message.files?.map((file, i) => <div className="attachment-chip" key={i}>{file.url && <img src={file.url} alt="" />}<span>{file.name}</span></div>)}{message.image && <img className="chat-generated-image" src={message.image} alt={message.text} />}</div></article>)}
          {busy && <article className="chat-message assistant"><div className="message-avatar"><LuSparkles /></div><div className="message-content"><strong>Lumi</strong><p className="thinking-dots">Thinking<span> · · ·</span></p></div></article>}
        </div>
        <div className="composer-mode" role="group" aria-label="Choose Lumi mode"><button className={mode === "chat" ? "active" : ""} onClick={() => setMode("chat")}><LuBrain /> Chat with Lumi</button><button className={mode === "image" ? "active" : ""} onClick={() => setMode("image")}><LuImage /> Create an image</button></div>
        {files.length > 0 && <div className="pending-files">{files.map((file, index) => <div className="pending-file" key={`${file.name}-${index}`}>{file.type.startsWith("image/") ? <img src={URL.createObjectURL(file)} alt="" /> : <LuFileUp />}<span>{file.name}</span><button aria-label={`Remove ${file.name}`} onClick={() => setFiles((items) => items.filter((_, i) => i !== index))}><LuX /></button></div>)}</div>}
        <textarea aria-label="Message Lumi" placeholder={mode === "image" ? "Describe the visual you want Lumi to create…" : "Ask a question, or tell Lumi what to look for…"} rows="3" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} />
        {error && <p className="composer-error" role="alert">{error}</p>}
        {recording && <div className="recording-panel" role="status" aria-live="polite"><div className="recording-copy"><span className="recording-pulse" /><div><strong>Recording your voice</strong><span>Speak now · {formatRecordingTime(recordingSeconds)}</span></div></div><div className="recording-meter" aria-label="Live microphone level">{audioBars.map((level, index) => <span key={index} style={{ height: `${Math.max(4, level * 30)}px` }} />)}</div></div>}
        <div className="question-footer"><div className="question-options"><input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} /><input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} /><button type="button" onClick={() => inputRef.current?.click()} title="Attach a file"><LuPaperclip /><span>Attach</span></button><button type="button" onClick={openCamera} title="Take a photo"><LuCamera /><span>Photo</span></button><button type="button" className={recording ? "recording" : ""} onClick={toggleRecording} title={recording ? "Stop recording" : "Record audio"}><LuMic /><span>{recording ? "Stop" : "Voice"}</span></button><button type="button" onClick={() => setQuestion("Summarize the key ideas and give me a quick study guide.")} title="Summarize"><LuBookOpen /><span>Study guide</span></button></div><button className="ask-button" type="button" onClick={submit} disabled={busy || (!question.trim() && files.length === 0)}><span>{busy ? "Working…" : mode === "image" ? "Create" : "Send"}</span><LuArrowUp /></button></div>
        <p className="composer-note">Up to 5 files · 12 MB each · Shift + Enter for a new line</p>
        {cameraOpen && <div className="camera-overlay" role="dialog" aria-modal="true" aria-label="Take a photo"><div ref={cameraDialogRef} className="camera-dialog" style={{ transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)` }}><div className="camera-dialog-header" onPointerDown={startCameraDrag} onPointerMove={moveCamera} onPointerUp={() => { cameraDragRef.current = null; }} onPointerCancel={() => { cameraDragRef.current = null; }}><div><span className="camera-kicker">LUMI CAMERA · DRAG TO MOVE</span><strong>Take a photo</strong></div><button type="button" onClick={closeCamera} aria-label="Close camera"><LuX /></button></div><video ref={videoRef} autoPlay playsInline muted /><p>Position your photo in the frame, then capture it.</p><div className="camera-dialog-actions"><button className="camera-cancel" type="button" onClick={closeCamera}>Cancel</button><button type="button" className="ask-button camera-capture" onClick={capturePhoto}><LuCamera /> Take photo</button></div></div></div>}
      </div>
      <div className="suggestions"><span>Quick start:</span><button onClick={() => setQuestion("Explain recursion simply")}>Explain recursion simply</button><button onClick={() => setQuestion("Give me five quiz questions about cell biology")}>Quiz me on a topic</button></div>
    </div>
  </section>;
}

export default QuestionForm;
