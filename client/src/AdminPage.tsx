import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken, clearToken, getToken } from "./api";
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

const generateSHA256 = async (input: string) => {
    const utf8 = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [form, setForm] = useState({ title: "", author: "", description: "", date: "", links: [{ label: "", url: "" }] });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [news, setNews] = useState<NewsEntry[]>([]);
  const [newsForm, setNewsForm] = useState({ date: "", title: "", tag: "", tagColor: "#000000" });
  const [newsEditingId, setNewsEditingId] = useState<string | null>(null);

  const [resumeFilename, setResumeFilename] = useState("");
  const [resumeHasPdf, setResumeHasPdf] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeSaved, setResumeSaved] = useState(false);

  const [description, setDescription] = useState("");
  const [descriptionSaved, setDescriptionSaved] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setCheckingAuth(false);
      return;
    }
    api(`/auth/me`).then(r => {
      if (r.ok) {
        setAuthenticated(true);
        loadData();
      } else {
        clearToken();
      }
    }).finally(() => setCheckingAuth(false));
  }, []);

  const loadData = () => {
    api(`/resume`).then(r => r.json()).then(data => {
      setResumeHasPdf(data.hasPdf || false);
      setResumeFilename(data.filename || "");
    }).catch(() => {});
    api(`/projects`).then(r => r.json()).then(setProjects).catch(() => {});
    api(`/news`).then(r => r.json()).then(setNews).catch(() => {});
    api(`/config`).then(r => r.json()).then(data => {
      if (data.description) setDescription(data.description);
    }).catch(() => {});
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeError("");
    if (file.type !== "application/pdf") {
      setResumeError("Only PDF files are accepted.");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setResumeError("File must be under 10 MB.");
      e.target.value = "";
      return;
    }
    setResumeUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      const res = await api(`/resume/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, filename: file.name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Upload failed");
      }
      const result = await res.json();
      setResumeHasPdf(true);
      setResumeFilename(result.filename || file.name);
      setResumeSaved(true);
      setTimeout(() => setResumeSaved(false), 2000);
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : "Failed to upload resume.");
    } finally {
      setResumeUploading(false);
      e.target.value = "";
    }
  };

  const deleteResume = async () => {
    try {
      const res = await api(`/resume`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Delete failed");
      }
      setResumeHasPdf(false);
      setResumeFilename("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete resume.");
    }
  };

  const saveDescription = async () => {
    try {
      const res = await api(`/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "description", value: description }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Save failed");
      }
      setDescriptionSaved(true);
      setTimeout(() => setDescriptionSaved(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save description.");
    }
  };

  const handleLogin = async () => {
    setError("");
    const hash = await generateSHA256(password);
    try {
      const res = await api(`/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", passwordHash: hash }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Login failed");
        return;
      }
      const { token } = await res.json();
      setToken(token);
      setAuthenticated(true);
      loadData();
    } catch {
      setError("Could not reach server. Please try again.");
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
        const res = await api(`/projects/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, links }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Update failed");
        }
        setProjects(projects.map(p => p.id === editingId ? { ...p, ...form, links } : p));
        setEditingId(null);
      } else {
        const id = crypto.randomUUID();
        const res = await api(`/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...form, links }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Save failed");
        }
        setProjects([...projects, { id, ...form, links }]);
      }
      setForm({ title: "", author: "", description: "", date: "", links: [{ label: "", url: "" }] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save project.");
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
      const res = await api(`/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Delete failed");
      }
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete project.");
    }
  };

  const moveProject = async (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= projects.length) return;
    const updated = [...projects];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setProjects(updated);
    try {
      const results = await Promise.all(updated.map((p, i) =>
        api(`/projects/reorder/${p.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: i }),
        })
      ));
      const failed = results.find(r => !r.ok);
      if (failed) {
        const data = await failed.json().catch(() => null);
        throw new Error(data?.error || "Reorder failed");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reorder.");
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
        const res = await api(`/news/${newsEditingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newsForm),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Update failed");
        }
        setNews(news.map(n => n.id === newsEditingId ? { ...n, ...newsForm } : n));
        setNewsEditingId(null);
      } else {
        const id = crypto.randomUUID();
        const res = await api(`/news`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...newsForm }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Save failed");
        }
        setNews([...news, { id, ...newsForm }]);
      }
      setNewsForm({ date: "", title: "", tag: "", tagColor: "#000000" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save news entry.");
    }
  };

  const deleteNews = async (id: string) => {
    try {
      const res = await api(`/news/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Delete failed");
      }
      setNews(news.filter(n => n.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete news.");
    }
  };

  if (checkingAuth) {
    return (
      <div className="admin-login">
        <div className="admin-login-box">
          <h1>Admin Panel</h1>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

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

  const handleLogout = async () => {
    await api(`/auth/logout`, { method: "POST" });
    clearToken();
    setAuthenticated(false);
    setPassword("");
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div>
          <button onClick={() => navigate("/")}>Back to site</button>
          <button onClick={handleLogout} style={{ marginLeft: 8 }}>Logout</button>
        </div>
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
        <label className="admin-upload-label">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleResumeUpload}
            disabled={resumeUploading}
            style={{ display: "none" }}
            id="resume-file-input"
          />
          <span className="admin-upload-btn" style={{ opacity: resumeUploading ? 0.6 : 1 }}>
            {resumeUploading ? "Uploading..." : resumeHasPdf ? "Replace PDF" : "Upload PDF"}
          </span>
        </label>
        {resumeError && <p className="admin-error">{resumeError}</p>}
        {resumeSaved && <p style={{ color: "#2d7d46", margin: "4px 0" }}>Resume saved!</p>}
        {resumeHasPdf && (
          <div className="admin-resume-info">
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              Current: <strong>{resumeFilename}</strong>
            </span>
            <button className="admin-cancel" onClick={deleteResume}>Remove</button>
          </div>
        )}
        {!resumeHasPdf && !resumeUploading && (
          <p style={{ color: "#888", fontSize: "0.9em", marginTop: 4 }}>No resume uploaded yet.</p>
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
