import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

interface ResearchProject {
  id: string;
  title: string;
  author: string;
  description: string;
  date: string;
  links: string[];
}

interface NewsEntry {
  id: string;
  date: string;
  title: string;
  tag: string;
  tagColor: string;
}

const ADMIN_PASSWORD = "3724cc3ec590b6bace45c87db054f85e80c409234f5f1a2ccdd55204a9767b85";
const generateSHA256 = async (input: string) => {
    const utf8 = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem("admin-auth") === "true";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [projects, setProjects] = useState<ResearchProject[]>(() => {
    const saved = localStorage.getItem("research-projects");
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState({ title: "", author: "", description: "", date: "", links: [""] });

  const [news, setNews] = useState<NewsEntry[]>(() => {
    const saved = localStorage.getItem("personal-news");
    return saved ? JSON.parse(saved) : [];
  });
  const [newsForm, setNewsForm] = useState({ date: "", title: "", tag: "", tagColor: "#000000" });

  const handleLogin = async () => {
    const hash = await generateSHA256(password);
    if (hash === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin-auth", "true");
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const updateLink = (i: number, value: string) => {
    const links = [...form.links];
    links[i] = value;
    setForm({ ...form, links });
  };

  const addLink = () => {
    setForm({ ...form, links: [...form.links, ""] });
  };

  const removeLink = (i: number) => {
    const links = form.links.filter((_, idx) => idx !== i);
    setForm({ ...form, links });
  };

  const addProject = () => {
    if (!form.title.trim()) return;
    const project: ResearchProject = {
      id: crypto.randomUUID(),
      ...form,
      links: form.links.filter(Boolean),
    };
    const updated = [...projects, project];
    setProjects(updated);
    localStorage.setItem("research-projects", JSON.stringify(updated));
    setForm({ title: "", author: "", description: "", date: "", links: [""] });
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem("research-projects", JSON.stringify(updated));
  };

  const addNews = () => {
    if (!newsForm.title.trim()) return;
    const entry: NewsEntry = {
      id: crypto.randomUUID(),
      ...newsForm,
    };
    const updated = [...news, entry];
    setNews(updated);
    localStorage.setItem("personal-news", JSON.stringify(updated));
    setNewsForm({ date: "", title: "", tag: "", tagColor: "#000000" });
  };

  const deleteNews = (id: string) => {
    const updated = news.filter((n) => n.id !== id);
    setNews(updated);
    localStorage.setItem("personal-news", JSON.stringify(updated));
  };

  if (!authenticated) {
    return (
      <div className="admin-login">
        <div className="admin-login-box">
          <h1>Admin Login</h1>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button onClick={handleLogin}>Login</button>
          {error && <p className="admin-error">{error}</p>}
          <button className="admin-back" onClick={() => navigate("/")}>
            Back to site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={() => navigate("/")}>Back to site</button>
      </div>

      <h2>Research & Projects</h2>

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
        <div className="admin-links">
          {form.links.map((link, i) => (
            <div key={i} className="admin-link-row">
              <input
                placeholder={`Link ${i + 1} (URL)`}
                value={link}
                onChange={(e) => updateLink(i, e.target.value)}
              />
              {form.links.length > 1 && (
                <button className="remove-link" onClick={() => removeLink(i)}>
                  ×
                </button>
              )}
            </div>
          ))}
          <button className="add-link" onClick={addLink}>
            + Add another link
          </button>
        </div>
        <button onClick={addProject}>Add Project</button>
      </div>

      <div className="admin-list">
        {projects.length === 0 ? (
          <p className="empty-state">No projects yet.</p>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="admin-item">
              <span><strong>{p.title}</strong> — {p.author}</span>
              <button onClick={() => deleteProject(p.id)}>Delete</button>
            </div>
          ))
        )}
      </div>

      <hr className="admin-section-divider" />

      <h2>Personal News</h2>

      <div className="admin-form">
        <input
          placeholder="Date"
          value={newsForm.date}
          onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
        />
        <input
          placeholder="Event title"
          value={newsForm.title}
          onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
        />
        <div className="admin-news-tag-row">
          <input
            placeholder="Tag"
            value={newsForm.tag}
            onChange={(e) => setNewsForm({ ...newsForm, tag: e.target.value })}
          />
          <input
            type="color"
            value={newsForm.tagColor}
            onChange={(e) => setNewsForm({ ...newsForm, tagColor: e.target.value })}
            title="Tag color"
          />
        </div>
        <button onClick={addNews}>Add News</button>
      </div>

      <div className="admin-list">
        {news.length === 0 ? (
          <p className="empty-state">No news yet.</p>
        ) : (
          news.map((n) => (
            <div key={n.id} className="admin-item">
              <span><strong>{n.title}</strong> — {n.date}</span>
              <span style={{ color: n.tagColor, fontWeight: 600 }}>{n.tag}</span>
              <button onClick={() => deleteNews(n.id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPage;
