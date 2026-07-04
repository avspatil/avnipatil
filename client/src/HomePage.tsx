import { useEffect, useState } from "react";
import "./App.css";

interface ProjectLink {
  label: string;
  url: string;
}

interface ResearchProject {
  id: string;
  title: string;
  author: string;
  description: string;
  date: string;
  links: ProjectLink[];
}

interface NewsEntry {
  id: string;
  date: string;
  title: string;
  tag: string;
  tagColor: string;
}

function loadProjects(): ResearchProject[] {
  const saved = localStorage.getItem("research-projects");
  return saved ? JSON.parse(saved) : [];
}

function loadNews(): NewsEntry[] {
  const saved = localStorage.getItem("personal-news");
  return saved ? JSON.parse(saved) : [];
}

const API = "http://localhost:3001";

const HomePage: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [projects, setProjects] = useState<ResearchProject[]>(loadProjects);
  const [news, setNews] = useState<NewsEntry[]>(loadNews);
  const [resumePdf, setResumePdf] = useState<string | null>(null);

  useEffect(() => {
    const onStorage = () => {
      setProjects(loadProjects());
      setNews(loadNews());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    fetch(`${API}/resume`)
      .then((r) => r.json())
      .then((data) => {
        if (data.pdf) setResumePdf(data.pdf);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;
    const drift = (phase: number, speed: number, amp: number, center: number) =>
      center + Math.sin(performance.now() / 1000 * speed + phase) * amp;

    const smoothVars = () => {
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      document.documentElement.style.setProperty("--mouse-x", `${currentX}vw`);
      document.documentElement.style.setProperty("--mouse-y", `${currentY}vh`);
      document.documentElement.style.setProperty("--blob-1-x", `${drift(0, 0.15, 5, 20)}%`);
      document.documentElement.style.setProperty("--blob-1-y", `${drift(1.2, 0.12, 4, 25)}%`);
      document.documentElement.style.setProperty("--blob-2-x", `${drift(2.5, 0.1, 4, 80)}%`);
      document.documentElement.style.setProperty("--blob-2-y", `${drift(0.8, 0.14, 5, 30)}%`);
      document.documentElement.style.setProperty("--blob-3-x", `${drift(1.8, 0.11, 5, 60)}%`);
      document.documentElement.style.setProperty("--blob-3-y", `${drift(3.0, 0.09, 4, 80)}%`);
      document.documentElement.style.setProperty("--blob-4-x", `${drift(0.5, 0.13, 5, 30)}%`);
      document.documentElement.style.setProperty("--blob-4-y", `${drift(2.2, 0.1, 4, 70)}%`);
      document.documentElement.style.setProperty("--blob-5-x", `${drift(3.5, 0.08, 4, 70)}%`);
      document.documentElement.style.setProperty("--blob-5-y", `${drift(1.0, 0.12, 5, 40)}%`);
      raf = requestAnimationFrame(smoothVars);
    };

    let raf = requestAnimationFrame(smoothVars);

    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      targetX = (e.clientX / window.innerWidth) * 100;
      targetY = (e.clientY / window.innerHeight) * 100;
    };

    window.addEventListener("mousemove", moveCursor);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="app">
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

          <button
            className="resume-btn"
            onClick={() => {
              if (!resumePdf) return;
              const byteString = atob(resumePdf.split(",")[1]);
              const mime = resumePdf.split(",")[0].split(":")[1].split(";")[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              const blob = new Blob([ab], { type: mime });
              const url = URL.createObjectURL(blob);
              window.open(url, "_blank");
            }}
          >
            Resume
          </button>
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
                <h3 className="project-title">{p.title}</h3>
                <p className="project-meta">{p.author} &middot; {p.date}</p>
                <p className="project-desc">{p.description}</p>
                {p.links && p.links.length > 0 && (
                  <div className="project-links">
                    {p.links.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" className="project-link">
                        {link.label || `Link ${i + 1}`}
                      </a>
                    ))}
                  </div>
                )}
                <hr className="project-hr" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NEWS */}
      <section id="news" className="section">
        <h2>Personal News</h2>
        <hr className="section-hr" />

        {news.length === 0 ? (
          <p className="empty-state">No news yet.</p>
        ) : (
          <div className="news-list">
            {news.map((n) => (
              <div key={n.id} className="news-row">
                <span className="news-date">{n.date}</span>
                <span className="news-title">{n.title}</span>
                <span className="news-tag" style={{ color: n.tagColor }}>
                  {n.tag}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
