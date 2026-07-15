import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [form, setForm] = useState({ title: "", author: "", description: "", date: "", links: [{ label: "", url: "" }] });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [news, setNews] = useState<NewsEntry[]>([]);
  const [newsForm, setNewsForm] = useState({ date: "", title: "", tag: "", tagColor: "#000000" });
  const [newsEditingId, setNewsEditingId] = useState<string | null>(null);

  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeUrlInput, setResumeUrlInput] = useState("");
  const [resumeError, setResumeError] = useState("");

  const [description, setDescription] = useState("");
  const [descriptionSaved, setDescriptionSaved] = useState(false);

  useEffect(() => {
    fetch(`/resume`).then(r => r.json()).then(data => {
      if (data.url) {
        setResumeUrl(data.url);
        setResumeUrlInput(data.url);
      }
    }).catch(() => {});
    fetch(`/projects`).then(r => r.json()).then(setProjects).catch(() => {});
    fetch(`/news`).then(r => r.json()).then(setNews).catch(() => {});
    fetch(`/config`).then(r => r.json()).then(data => {
      if (data.description) setDescription(data.description);
    }).catch(() => {});
  }, []);

  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleResumeSave = async () => {
    setResumeError("");
    const trimmed = resumeUrlInput.trim();
    if (!trimmed) {
      setResumeError("Please enter a resume URL.");
      return;
    }
    if (!isValidUrl(trimmed)) {
      setResumeError("Please enter a valid URL (e.g. https://drive.google.com/...).");
      return;
    }
    try {
      const res = await fetch(`/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Save failed");
      }
      setResumeUrl(trimmed);
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : "Failed to save resume link. Check that the server is running.");
    }
  };

  const deleteResume = async () => {
    try {
      await fetch(`/resume`, { method: "DELETE" });
      setResumeUrl("");
      setResumeUrlInput("");
    } catch {
      alert("Failed to delete resume link.");
    }
  };

  const saveDescription = async () => {
    try {
      await fetch(`/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "description", value: description }),
      });
      setDescriptionSaved(true);
      setTimeout(() => setDescriptionSaved(false), 2000);
    } catch {
      alert("Failed to save description.");
    }
  };

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

  const updateLink = (i: number, field: "label" | "url", value: string) => {
    const links = [...form.links];
    links[i] = { ...links[i], [field]: value };
    setForm({ ...form, links });
  };

  const addLink = () => {
    setForm({ ...form, links: [...form.links, { label: "", url: "" }] });
  };

  const removeLink = (i: number) => {
    const links = form.links.filter((_, idx) => idx !== i);
    setForm({ ...form, links });
  };

  const addProject = async () => {
    if (!form.title.trim()) return;
    const links = form.links.filter((l) => l.url.trim());
    try {
      if (editingId) {
        await fetch(`/projects/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, links }),
        });
        setProjects(projects.map(p => p.id === editingId ? { ...p, ...form, links } : p));
        setEditingId(null);
      } else {
        const id = crypto.randomUUID();
        await fetch(`/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...form, links }),
        });
        setProjects([...projects, { id, ...form, links }]);
      }
      setForm({ title: "", author: "", description: "", date: "", links: [{ label: "", url: "" }] });
    } catch {
      alert("Failed to save project.");
    }
  };

  const editProject = (p: ResearchProject) => {
    setForm({ title: p.title, author: p.author, description: p.description, date: p.date, links: p.links.length ? p.links : [{ label: "", url: "" }] });
    setEditingId(p.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", author: "", description: "", date: "", links: [{ label: "", url: "" }] });
  };

  const deleteProject = async (id: string) => {
    try {
      await fetch(`/projects/${id}`, { method: "DELETE" });
      setProjects(projects.filter(p => p.id !== id));
    } catch {
      alert("Failed to delete project.");
    }
  };

  const moveProject = async (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= projects.length) return;
    const updated = [...projects];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setProjects(updated);
    try {
      await Promise.all(updated.map((p, i) =>
        fetch(`/projects/reorder/${p.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: i }),
        })
      ));
    } catch {
      alert("Failed to reorder.");
    }
  };

  const editNews = (n: NewsEntry) => {
    setNewsForm({ date: n.date, title: n.title, tag: n.tag, tagColor: n.tagColor });
    setNewsEditingId(n.id);
  };

  const cancelNewsEdit = () => {
    setNewsEditingId(null);
    setNewsForm({ date: "", title: "", tag: "", tagColor: "#000000" });
  };

  const addNews = async () => {
    if (!newsForm.title.trim()) return;
    try {
      if (newsEditingId) {
        await fetch(`/news/${newsEditingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newsForm),
        });
        setNews(news.map(n => n.id === newsEditingId ? { ...n, ...newsForm } : n));
        setNewsEditingId(null);
      } else {
        const id = crypto.randomUUID();
        await fetch(`/news`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...newsForm }),
        });
        setNews([...news, { id, ...newsForm }]);
      }
      setNewsForm({ date: "", title: "", tag: "", tagColor: "#000000" });
    } catch {
      alert("Failed to save news entry.");
    }
  };

  const deleteNews = async (id: string) => {
    try {
      await fetch(`/news/${id}`, { method: "DELETE" });
      setNews(news.filter(n => n.id !== id));
    } catch {
      alert("Failed to delete news.");
    }
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

      <h2>About / Description</h2>

      <div className="admin-form">
        <textarea
          placeholder="Profile description shown on the landing page"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="admin-form-actions">
          <button onClick={saveDescription}>{descriptionSaved ? "Saved!" : "Save Description"}</button>
        </div>
      </div>

      <hr className="admin-section-divider" />

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
                placeholder={`Link ${i + 1} (display text)`}
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
              />
              <input
                placeholder={`Link ${i + 1} (URL)`}
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
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
        <div className="admin-form-actions">
          <button onClick={addProject}>{editingId ? "Update Project" : "Add Project"}</button>
          {editingId && <button className="admin-cancel" onClick={cancelEdit}>Cancel</button>}
        </div>
      </div>

      <div className="admin-list">
        {projects.length === 0 ? (
          <p className="empty-state">No projects yet.</p>
        ) : (
          projects.map((p, i) => (
            <div key={p.id} className="admin-item">
              <div className="admin-item-info">
                <span><strong>{p.title}</strong> — {p.author}</span>
              </div>
              <div className="admin-item-actions">
                <button className="move-btn" onClick={() => moveProject(i, "up")} disabled={i === 0} title="Move up">↑</button>
                <button className="move-btn" onClick={() => moveProject(i, "down")} disabled={i === projects.length - 1} title="Move down">↓</button>
                <button onClick={() => editProject(p)}>Edit</button>
                <button onClick={() => deleteProject(p.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      <hr className="admin-section-divider" />

      <h2>Resume</h2>

      <div className="admin-form">
        <input
          type="url"
          placeholder="Resume Google Drive Link"
          value={resumeUrlInput}
          onChange={(e) => { setResumeUrlInput(e.target.value); setResumeError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleResumeSave()}
        />
        {resumeError && <p className="admin-error">{resumeError}</p>}
        <div className="admin-form-actions">
          <button onClick={handleResumeSave}>Save Link</button>
          {resumeUrl && <button className="admin-cancel" onClick={deleteResume}>Remove Link</button>}
        </div>
        {resumeUrl && (
          <div className="admin-resume-info">
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              Saved: <a href={resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#144188" }}>{resumeUrl}</a>
            </span>
          </div>
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
        <div className="admin-form-actions">
          <button onClick={addNews}>{newsEditingId ? "Update News" : "Add News"}</button>
          {newsEditingId && <button className="admin-cancel" onClick={cancelNewsEdit}>Cancel</button>}
        </div>
      </div>

      <div className="admin-list">
        {news.length === 0 ? (
          <p className="empty-state">No news yet.</p>
        ) : (
          news.map((n) => (
            <div key={n.id} className="admin-item">
              <div className="admin-item-info">
                <span><strong>{n.title}</strong> — {n.date}</span>
                <span style={{ color: n.tagColor, fontWeight: 600, marginLeft: 8 }}>{n.tag}</span>
              </div>
              <div className="admin-item-actions">
                <button onClick={() => editNews(n)}>Edit</button>
                <button onClick={() => deleteNews(n.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPage;
