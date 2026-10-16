import { useEffect, useMemo, useState } from "react";
import {
  LuArrowLeft,
  LuArrowRight,
  LuBookOpen,
  LuCheck,
  LuCircleCheck,
  LuClock3,
  LuGraduationCap,
  LuPlus,
  LuSearch,
  LuSparkles,
  LuX,
} from "react-icons/lu";
import "./CourseHub.css";

export const COURSE_STORAGE_KEY = "lumi-course-library-v1";
export const COURSE_UPDATE_EVENT = "lumi:courses-updated";

const API = import.meta.env.DEV
  ? "http://localhost:3001/api"
  : "https://lumi-ai-mepd.onrender.com/api";
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_TOTAL_SIZE = 14 * 1024 * 1024;

const starterCourses = [
  {
    id: "starter-biology",
    title: "Biology Essentials",
    subject: "Biology",
    description: "Build a clear foundation in cells, energy, and living systems.",
    level: "Beginner",
    lessons: [
      { id: "bio-1", module: "Cells and life", title: "What makes something alive?", minutes: 8, content: "Living things are made of cells, use energy, respond to their surroundings, and grow or reproduce. A cell is the smallest unit that carries out these life processes.\n\nAs you study, compare a single-celled organism with a plant or animal. What life processes can you identify in each?" },
      { id: "bio-2", module: "Cells and life", title: "Inside a cell", minutes: 10, content: "The cell membrane controls what enters and leaves. The cytoplasm is where many reactions happen. In plant cells, chloroplasts capture light energy, while the nucleus stores instructions used by the cell.\n\nTry drawing a simple cell and labelling each part with its job." },
      { id: "bio-3", module: "Energy and ecosystems", title: "How cells use energy", minutes: 9, content: "Cells release usable energy from food through cellular respiration. Plants also capture light energy through photosynthesis, storing it in sugars. These processes connect organisms to the energy moving through an ecosystem.\n\nIn your own words, explain how sunlight can eventually power movement in an animal." },
      { id: "bio-4", module: "Energy and ecosystems", title: "Food webs and review", minutes: 8, content: "A food web maps feeding relationships. Producers such as plants make food, consumers eat other organisms, and decomposers recycle nutrients. Energy moves through the web, while matter is reused.\n\nReview: explain how a change in one population might affect two others in its food web." },
    ],
  },
  {
    id: "starter-algebra",
    title: "Algebra & Functions",
    subject: "Mathematics",
    description: "Turn expressions, equations, and graphs into tools you can use.",
    level: "Beginner",
    lessons: [
      { id: "alg-1", module: "Expressions", title: "Variables and expressions", minutes: 8, content: "A variable stands for a number that can change or is not yet known. An expression combines numbers, variables, and operations. For example, 3x + 2 means three groups of x, then two more.\n\nIf x = 4, evaluate 3x + 2. Describe each step." },
      { id: "alg-2", module: "Expressions", title: "Equivalent expressions", minutes: 10, content: "The distributive property, a(b + c) = ab + ac, lets you expand or factor expressions. Combining like terms is another way to rewrite an expression without changing its value.\n\nTry simplifying 2(x + 3) + x. Check your answer with a value for x." },
      { id: "alg-3", module: "Equations and graphs", title: "Solving one-step equations", minutes: 9, content: "An equation is a balance. Whatever operation you perform on one side, perform on the other. To solve x + 5 = 12, subtract 5 from both sides to isolate x.\n\nSolve 4y = 20, then substitute your result back into the original equation." },
      { id: "alg-4", module: "Equations and graphs", title: "Functions as input and output", minutes: 9, content: "A function maps each allowed input to exactly one output. You can describe a function with a rule, a table, a graph, or a real-world relationship.\n\nFor f(x) = 2x + 1, find f(3). What does the graph do when x increases by one?" },
    ],
  },
  {
    id: "starter-web",
    title: "Web Development Basics",
    subject: "Technology",
    description: "Understand how HTML, CSS, and JavaScript work together.",
    level: "Beginner",
    lessons: [
      { id: "web-1", module: "The building blocks", title: "HTML gives a page structure", minutes: 8, content: "HTML describes the meaning and structure of page content. Headings, paragraphs, links, buttons, and forms are represented by elements. Semantic elements make pages easier to navigate and understand.\n\nSketch a simple page and label its heading, main content, and actions." },
      { id: "web-2", module: "The building blocks", title: "CSS shapes the experience", minutes: 9, content: "CSS controls presentation: color, spacing, layout, and responsive behavior. A good design system uses a small set of consistent sizes, colors, and patterns.\n\nChoose one element from your sketch and describe how it should change on a narrow phone screen." },
      { id: "web-3", module: "Making pages interactive", title: "JavaScript responds to people", minutes: 10, content: "JavaScript lets a page react to events such as clicks, typing, and form submission. State represents the information an interface needs to remember and display.\n\nPlan a button interaction. What changes on screen after a person clicks it?" },
      { id: "web-4", module: "Making pages interactive", title: "Bring a small page together", minutes: 10, content: "A useful web page combines structure, visual design, and behavior. Start with a clear purpose, build the content, style it for different screens, then test the important actions.\n\nWrite down one feature you would build and the smallest version you could test first." },
    ],
  },
];

function readCourses() {
  try {
    const stored = JSON.parse(localStorage.getItem(COURSE_STORAGE_KEY) || "null");
    return Array.isArray(stored) ? stored : starterCourses;
  } catch {
    return starterCourses;
  }
}

function progressOf(course) {
  const lessons = course.lessons || [];
  if (!lessons.length) return 0;
  return Math.round((lessons.filter((lesson) => lesson.completed).length / lessons.length) * 100);
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      name: file.name,
      type: (file.type || "application/octet-stream").split(";")[0],
      data: String(reader.result).split(",")[1],
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function cleanPlan(answer) {
  const json = answer.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("Lumi returned an outline in an unexpected format. Try again or create the course manually.");
  const plan = JSON.parse(json);
  if (!Array.isArray(plan.lessons) || plan.lessons.length < 2) {
    throw new Error("Lumi's outline needs at least two lessons. Try again or create the course manually.");
  }
  return plan.lessons.slice(0, 12).map((lesson, index) => ({
    id: `lesson-${Date.now()}-${index}`,
    module: String(lesson.module || "Course lessons").slice(0, 80),
    title: String(lesson.title || `Lesson ${index + 1}`).slice(0, 120),
    minutes: Math.min(60, Math.max(5, Number(lesson.minutes) || 10)),
    content: String(lesson.content || "Use this lesson to review the key ideas and write down any questions.").slice(0, 5000),
    completed: false,
    notes: "",
  }));
}

function CourseHub() {
  const [courses, setCourses] = useState(readCourses);
  const [filter, setFilter] = useState("All courses");
  const [query, setQuery] = useState("");
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState("");
  const [lessonTitles, setLessonTitles] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courses));
    window.dispatchEvent(new Event(COURSE_UPDATE_EVENT));
  }, [courses]);

  const activeCourse = courses.find((course) => course.id === activeCourseId);
  const activeLesson = activeCourse?.lessons.find((lesson) => lesson.id === activeLessonId);
  const groupedLessons = useMemo(() => {
    if (!activeCourse) return [];
    const groups = new Map();
    activeCourse.lessons.forEach((lesson) => {
      const group = lesson.module || "Lessons";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(lesson);
    });
    return [...groups.entries()];
  }, [activeCourse]);

  const visibleCourses = courses.filter((course) => {
    const matchesQuery = `${course.title} ${course.subject} ${course.description}`.toLowerCase().includes(query.toLowerCase());
    const progress = progressOf(course);
    const matchesFilter = filter === "All courses"
      || (filter === "In progress" && progress > 0 && progress < 100)
      || (filter === "Not started" && progress === 0)
      || (filter === "Completed" && progress === 100);
    return matchesQuery && matchesFilter;
  });

  const totalCompleted = courses.reduce((sum, course) => sum + course.lessons.filter((lesson) => lesson.completed).length, 0);
  const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);
  const inProgressCount = courses.filter((course) => progressOf(course) > 0 && progressOf(course) < 100).length;

  const resetCreateForm = () => {
    setTitle(""); setSubject(""); setGoal(""); setLessonTitles(""); setFiles([]); setError("");
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    const tooLarge = incoming.find((file) => file.size > MAX_FILE_SIZE);
    if (tooLarge) { setError(`${tooLarge.name} is larger than 12 MB.`); return; }
    const next = [...files, ...incoming].slice(0, 5);
    if (next.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_SIZE) {
      setError("Keep the combined source files under 14 MB."); return;
    }
    setFiles(next); setError("");
  };

  const saveCourse = (course) => {
    setCourses((current) => [course, ...current]);
    setCreateOpen(false);
    resetCreateForm();
    setActiveCourseId(course.id);
    setActiveLessonId(course.lessons[0]?.id || null);
  };

  const createManual = () => {
    if (!title.trim() || !subject.trim()) { setError("Add a course title and subject first."); return; }
    if (files.length) { setError("Your source files are used when you choose Generate with Lumi. Remove them to create a manual course."); return; }
    const lessonList = lessonTitles.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    if (lessonList.length < 2) { setError("Add at least two lesson titles, one per line."); return; }
    const lessons = lessonList.slice(0, 12).map((lessonTitle, index) => ({
      id: `lesson-${Date.now()}-${index}`,
      module: "Your learning path",
      title: lessonTitle,
      minutes: 10,
      content: `Learning goal: ${goal.trim() || `Build your understanding of ${subject.trim()}.`}\n\nUse this lesson to review your course materials, capture the main ideas in your own words, and add any questions to your notes.`,
      completed: false,
      notes: "",
    }));
    saveCourse({
      id: `course-${Date.now()}`,
      title: title.trim(), subject: subject.trim(),
      description: goal.trim() || `A personal course about ${subject.trim()}.`,
      level: "My course", lessons, custom: true,
    });
  };

  const generateCourse = async () => {
    if (!title.trim() || !subject.trim()) { setError("Add a course title and subject first."); return; }
    if (!goal.trim() && files.length === 0) { setError("Add a learning goal or attach source material for Lumi."); return; }
    setCreating(true); setError("");
    try {
      const attachments = await Promise.all(files.map(toBase64));
      const prompt = `Design a useful self-paced course. Course title: ${title.trim()}. Subject: ${subject.trim()}. Learner goal: ${goal.trim() || "Build a strong foundation from the attached material."}. Use the attached source material when present. Return ONLY valid JSON with this exact shape: {"description":"one concise sentence","level":"Beginner, Intermediate, or Advanced","lessons":[{"module":"module name","title":"lesson title","minutes":10,"content":"a clear, accurate 2-4 sentence lesson with a short study prompt"}]}. Create 6 to 8 lessons grouped into 2 or 3 modules. No markdown fences.`;
      const response = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, attachments }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lumi couldn't create the course outline right now.");
      const lessons = cleanPlan(data.answer || "");
      saveCourse({
        id: `course-${Date.now()}`,
        title: title.trim(), subject: subject.trim(),
        description: goal.trim() || "A personalized course created from your learning materials.",
        level: "Personalized", lessons, custom: true,
      });
    } catch (requestError) {
      setError(requestError.message || "Lumi couldn't create the outline. You can still build this course manually below.");
    } finally { setCreating(false); }
  };

  const openCourse = (course) => {
    setActiveCourseId(course.id);
    setActiveLessonId(course.lessons.find((lesson) => !lesson.completed)?.id || course.lessons[0]?.id || null);
  };

  const toggleLesson = (lessonId) => {
    setCourses((current) => current.map((course) => course.id !== activeCourseId ? course : {
      ...course,
      lessons: course.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, completed: !lesson.completed } : lesson),
    }));
  };

  const saveNotes = (lessonId, notes) => {
    setCourses((current) => current.map((course) => course.id !== activeCourseId ? course : {
      ...course,
      lessons: course.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, notes } : lesson),
    }));
  };

  const moveLesson = (direction) => {
    const index = activeCourse.lessons.findIndex((lesson) => lesson.id === activeLessonId);
    const next = activeCourse.lessons[index + direction];
    if (next) setActiveLessonId(next.id);
  };

  return (
    <section className="course-section" id="courses">
      <div className="course-shell">
        {!activeCourse ? <>
          <div className="course-heading-row">
            <div className="course-heading">
              <div className="course-eyebrow"><LuGraduationCap /><span>Lumi learning studio</span></div>
              <h2>Your next chapter <span>starts here.</span></h2>
              <p>Explore a starter course or build a learning path from the topics and materials that matter to you.</p>
            </div>
            <button className="course-create-button" type="button" onClick={() => { resetCreateForm(); setCreateOpen(true); }}><LuPlus /> Create a course</button>
          </div>

          <div className="course-stats" id="course-progress">
            <div className="course-stat"><span className="course-stat-icon violet"><LuBookOpen /></span><div><strong>{courses.length}</strong><span>Courses in your library</span></div></div>
            <div className="course-stat"><span className="course-stat-icon peach"><LuSparkles /></span><div><strong>{inProgressCount}</strong><span>In progress</span></div></div>
            <div className="course-stat"><span className="course-stat-icon green"><LuCircleCheck /></span><div><strong>{totalCompleted}<small>/{totalLessons}</small></strong><span>Lessons completed</span></div></div>
          </div>

          <div className="course-toolbar">
            <div className="course-filters" role="group" aria-label="Filter courses">
              {["All courses", "In progress", "Not started", "Completed"].map((item) => <button type="button" key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}
            </div>
            <label className="course-search"><LuSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a course" aria-label="Search courses" /></label>
          </div>

          <div className="course-grid">
            {visibleCourses.map((course, index) => {
              const progress = progressOf(course);
              return <article className={`course-card course-tone-${index % 3}`} key={course.id}>
                <div className="course-card-art"><span className="course-art-orbit orbit-one" /><span className="course-art-orbit orbit-two" /><span className="course-card-icon"><LuBookOpen /></span><span className="course-card-level">{course.level || "Self-paced"}</span></div>
                <div className="course-card-body"><div className="course-card-subject">{course.subject}</div><h3>{course.title}</h3><p>{course.description}</p><div className="course-card-meta"><span><LuBookOpen /> {course.lessons.length} lessons</span><span><LuClock3 /> {course.lessons.reduce((sum, lesson) => sum + (Number(lesson.minutes) || 10), 0)} min</span></div><div className="course-progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${progress}%` }} /></div><div className="course-card-progress"><span>{progress === 100 ? "Completed" : progress ? `${progress}% complete` : "Ready when you are"}</span><button type="button" onClick={() => openCourse(course)}>{progress ? "Continue" : "Start course"}<LuArrowRight /></button></div></div>
              </article>;
            })}
          </div>
          {visibleCourses.length === 0 && <div className="course-empty"><LuSearch /><strong>No matching courses</strong><span>Try another search or choose a different filter.</span></div>}
          <div className="course-create-banner"><div className="create-banner-icon"><LuSparkles /></div><div><strong>Have your own topic in mind?</strong><span>Give Lumi a goal or your class materials and get a course outline made for you.</span></div><button type="button" onClick={() => { resetCreateForm(); setCreateOpen(true); }}>Build my course <LuArrowRight /></button></div>
        </> : <div className="course-detail-view">
          <button className="course-back-button" type="button" onClick={() => { setActiveCourseId(null); setActiveLessonId(null); }}><LuArrowLeft /> All courses</button>
          <div className="course-detail-heading"><div><div className="course-eyebrow"><LuGraduationCap /><span>{activeCourse.subject} · {activeCourse.level || "Self-paced"}</span></div><h2>{activeCourse.title}</h2><p>{activeCourse.description}</p></div><div className="course-detail-progress"><strong>{progressOf(activeCourse)}%</strong><span>course complete</span><div className="course-progress-track"><span style={{ width: `${progressOf(activeCourse)}%` }} /></div></div></div>
          <div className="course-learning-layout">
            <aside className="lesson-sidebar"><div className="lesson-sidebar-title"><strong>Course outline</strong><span>{activeCourse.lessons.filter((lesson) => lesson.completed).length}/{activeCourse.lessons.length} done</span></div>{groupedLessons.map(([module, lessons]) => <div className="lesson-module" key={module}><h3>{module}</h3>{lessons.map((lesson) => <button type="button" key={lesson.id} className={`lesson-nav-item ${activeLessonId === lesson.id ? "current" : ""}`} onClick={() => setActiveLessonId(lesson.id)}><span className={`lesson-check ${lesson.completed ? "done" : ""}`}>{lesson.completed ? <LuCheck /> : null}</span><span>{lesson.title}<small><LuClock3 /> {lesson.minutes || 10} min</small></span></button>)}</div>)}</aside>
            {activeLesson && <article className="lesson-reader"><div className="lesson-reader-meta"><span>{activeLesson.module}</span><span><LuClock3 /> {activeLesson.minutes || 10} min</span></div><h3>{activeLesson.title}</h3><div className="lesson-body">{activeLesson.content?.split("\n").map((paragraph, index) => paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />)}</div><label className="lesson-notes-label" htmlFor="lesson-notes">My notes</label><textarea id="lesson-notes" key={activeLesson.id} defaultValue={activeLesson.notes || ""} placeholder="Capture a thought, example, or question from this lesson…" onBlur={(event) => saveNotes(activeLesson.id, event.target.value)} /><div className="lesson-actions"><button type="button" className={`lesson-complete-button ${activeLesson.completed ? "is-done" : ""}`} onClick={() => toggleLesson(activeLesson.id)}>{activeLesson.completed ? <><LuCheck /> Completed</> : "Mark as complete"}</button><div><button type="button" onClick={() => moveLesson(-1)} disabled={activeCourse.lessons[0]?.id === activeLesson.id} aria-label="Previous lesson"><LuArrowLeft /></button><button type="button" onClick={() => moveLesson(1)} disabled={activeCourse.lessons.at(-1)?.id === activeLesson.id} aria-label="Next lesson"><LuArrowRight /></button></div></div></article>}
          </div>
        </div>}
      </div>

      {createOpen && <div className="course-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !creating) setCreateOpen(false); }}><section className="course-modal" role="dialog" aria-modal="true" aria-labelledby="create-course-title"><header className="course-modal-header"><div><span className="course-eyebrow"><LuSparkles /> YOUR LEARNING, YOUR WAY</span><h2 id="create-course-title">Create a course</h2><p>Start with a topic and goal. Lumi can shape an outline from your materials.</p></div><button type="button" aria-label="Close course creator" onClick={() => !creating && setCreateOpen(false)}><LuX /></button></header><div className="course-form-grid"><label>Course title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Introduction to Climate Science" maxLength={90} /></label><label>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="e.g. Environmental science" maxLength={60} /></label><label className="course-form-wide">What do you want to learn?<textarea value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Describe your goal, current level, or what you want the course to focus on…" rows="3" maxLength={700} /></label><div className="course-form-wide"><span className="course-upload-label">Source material <small>Optional · PDF, images, text, or audio</small></span><label className="course-file-drop"><input type="file" hidden multiple accept="image/jpeg,image/png,image/webp,image/heic,image/heif,audio/wav,audio/mp3,audio/mpeg,audio/aiff,audio/aac,audio/ogg,audio/flac,audio/webm,audio/mp4,audio/m4a,application/pdf,text/plain,text/csv,text/markdown,.md" onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} /><LuPlus /><span>Choose source files</span><small>Up to 5 files · 12 MB each</small></label>{files.length > 0 && <div className="course-file-list">{files.map((file, index) => <span key={`${file.name}-${index}`}>{file.name}<button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}><LuX /></button></span>)}</div>}</div></div>{error && <p className="course-form-error" role="alert">{error}</p>}<div className="course-manual-fields"><label>Or outline lessons yourself <small>Enter at least two titles, one per line.</small><textarea value={lessonTitles} onChange={(event) => setLessonTitles(event.target.value)} placeholder={"A first lesson\nA second lesson\nA practice lesson (optional)"} rows="3" /></label><button type="button" className="course-manual-button" onClick={createManual} disabled={creating}>Create manually</button></div><footer className="course-modal-footer"><span>Lumi uses your existing study assistant. Usage limits may apply.</span><button type="button" className="course-create-button" onClick={generateCourse} disabled={creating}>{creating ? <><span className="course-spinner" /> Building outline…</> : <><LuSparkles /> Generate with Lumi</>}</button></footer></section></div>}
    </section>
  );
}

export default CourseHub;
