import { useEffect, useState } from "react";
import "./App.css";

interface ResearchProject {
  id: string;
  title: string;
  author: string;
  description: string;
  date: string;
  link: string;
}

const App: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [projects, setProjects] = useState<ResearchProject[]>(() => {
    const saved = localStorage.getItem("research-projects");
    return saved ? JSON.parse(saved) : [];
  });
  const [showAdmin, setShowAdmin] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", description: "", date: "", link: "" });

  useEffect(() => {
    localStorage.setItem("research-projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const addProject = () => {
    if (!form.title.trim()) return;
    const project: ResearchProject = {
      id: crypto.randomUUID(),
      ...form,
    };
    setProjects([...projects, project]);
    setForm({ title: "", author: "", description: "", date: "", link: "" });
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <div className="app">
      <div className="background" />

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-left">Avni Patil</div>

        <div className="nav-right">
          <button onClick={() => scrollToSection("profile")}>Profile</button>
          <button onClick={() => scrollToSection("research")}>
            Research & Projects
          </button>
          <button onClick={() => scrollToSection("news")}>
            Personal News
          </button>
        </div>
      </nav>

      {/* CURSOR */}
      <div
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          width: "12px",
          height: "12px",
          backgroundColor: "#f6e27f",
          borderRadius: "50%",
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          opacity: 0.8,
        }}
      />

      {/* PROFILE */}
      <section id="profile" className="hero">
        <div className="hero-left">
          <div className="profile-pic" />

          <h1 className="name">Avni Patil</h1>
          <p className="subtitle">
            CS + Math @ Harvey Mudd College '2030
          </p>

          <div className="icons">
            <a href="mailto:example@email.com" className="icon">✉</a>
            <a href="https://github.com/" target="_blank" className="icon">⌘</a>
          </div>
        </div>

        <div className="hero-right">
          <p className="description">
            I am a student passionate about building scalable systems...
          </p>

          <button className="resume-btn">Resume</button>
        </div>
      </section>

      {/* RESEARCH & PROJECTS */}
      <section id="research" className="section">
        <h2>Research & Projects</h2>
        <hr className="section-hr" />

        {projects.length === 0 ? (
          <p className="empty-state">No projects added yet.</p>
        ) : (
          <div className="project-list">
            {projects.map((p) => (
              <div key={p.id} className="project-row">
                <div className="project-info">
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-meta">{p.author} &middot; {p.date}</p>
                  <p className="project-desc">{p.description}</p>
                  {p.link && (
                    <a href={p.link} target="_blank" className="project-link">
                      View project
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NEWS */}
      <section id="news" className="section">
        <h2>Personal News</h2>
        <h3 className="subheader">Coming soon...</h3>
      </section>

      {/* ADMIN TOGGLE */}
      <button className="admin-toggle" onClick={() => setShowAdmin(!showAdmin)}>
        {showAdmin ? "Close Admin" : "Admin"}
      </button>

      {/* ADMIN PANEL */}
      {showAdmin && (
        <div className="admin-panel">
          <h3>Admin Panel — Research & Projects</h3>

          <div className="admin-form">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              placeholder="Author"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              placeholder="Date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <input
              placeholder="Link (URL)"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
            <button onClick={addProject}>Add Project</button>
          </div>

          <div className="admin-list">
            {projects.map((p) => (
              <div key={p.id} className="admin-item">
                <span><strong>{p.title}</strong> — {p.author}</span>
                <button onClick={() => deleteProject(p.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
