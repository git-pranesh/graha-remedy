import { useEffect, useState } from "react";
import { Check, FolderOpen, Link, Lock, Save } from "lucide-react";
import type { AuthUser, ChartResult, PersonalizedResult, SavedReportMeta } from "../types";
import {
  fetchMe,
  fetchMyReports,
  login,
  logout,
  register,
  saveReport,
} from "../api/client";

interface Props {
  chartResult: ChartResult;
  personalizedResult: PersonalizedResult;
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SaveReportBox({ chartResult, personalizedResult }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [saved, setSaved] = useState<{ id: string; link: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [myReports, setMyReports] = useState<SavedReportMeta[]>([]);

  /* Restore session on mount */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      setUser(me);
      if (me) {
        try {
          const list = await fetchMyReports();
          if (!cancelled) setMyReports(list);
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const linkFor = (id: string): string =>
    `${window.location.origin}${window.location.pathname}#/r/${id}`;

  const doSave = async (): Promise<void> => {
    setSaving(true);
    setMessage(null);
    setCopied(false);
    try {
      const { id } = await saveReport(chartResult, personalizedResult);
      setSaved({ id, link: linkFor(id) });
      if (user) {
        const list = await fetchMyReports();
        setMyReports(list);
      }
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message ?? "Could not save the report" });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!saved) return;
    try {
      await navigator.clipboard.writeText(saved.link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage({ kind: "error", text: "Copy failed — please select and copy the link manually." });
    }
  };

  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const me =
        formMode === "login"
          ? await login(email.trim(), password)
          : await register(email.trim(), password);
      setUser(me);
      setEmail("");
      setPassword("");
      setShowForm(false);
      const list = await fetchMyReports();
      setMyReports(list);
      setMessage({ kind: "ok", text: `Welcome, ${me.email}! Your readings can now be saved to this account.` });
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message ?? "Something went wrong" });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      /* ignore */
    }
    setUser(null);
    setMyReports([]);
    setSaved(null);
  };

  return (
    <div className="save-report-box">
      <h3 className="srb-heading">
        <Save size={17} /> Save this reading
      </h3>
      <p className="srb-desc">
        Keep your remedies close — come back anytime, share with family, or
        download as a PDF using the “Save as PDF” button.
      </p>

      {user ? (
        <div className="srb-user">
          <span>
            Signed in as <strong>{user.email}</strong>
          </span>
          <button type="button" onClick={handleLogout}>Log out</button>
        </div>
      ) : null}

      <div className="srb-actions">
        <button
          type="button"
          className={`btn ${user ? "btn-primary" : "btn-turquoise"} btn-sm`}
          onClick={doSave}
          disabled={saving}
        >
          {saving ? "Saving…" : user ? (<><Save size={15} /> Save to my reports</>) : (<><Link size={15} /> Save & get a share link</>)}
        </button>
        {!user && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setShowForm((s) => !s);
              setMessage(null);
            }}
          >
            <Lock size={15} /> {formMode === "login" ? "Log in / Sign up" : "Cancel"}
          </button>
        )}
      </div>

      {!user && showForm && (
        <form className="srb-form" onSubmit={submitAuth}>
          <div className="srb-form-row">
            <label htmlFor="srb-email">Email</label>
            <input
              id="srb-email"
              type="email"
              required
              className="field-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="srb-form-row">
            <label htmlFor="srb-password">Password (at least 6 characters)</label>
            <input
              id="srb-password"
              type="password"
              required
              minLength={6}
              className="field-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="srb-actions">
            <button type="submit" className="btn btn-turquoise btn-sm">
              {formMode === "login" ? "Log in" : "Create free account"}
            </button>
            <button
              type="button"
              className="srb-toggle-link"
              onClick={() => {
                setFormMode(formMode === "login" ? "signup" : "login");
                setMessage(null);
              }}
            >
              {formMode === "login"
                ? "New here? Create a free account"
                : "Already have an account? Log in"}
            </button>
          </div>
        </form>
      )}

      {saved && (
        <div className="srb-link-row">
          <input
            className="srb-link-input"
            readOnly
            value={saved.link}
            onFocus={(e) => e.target.select()}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopy}>
            {copied ? (<><Check size={14} /> Copied</>) : "Copy"}
          </button>
        </div>
      )}

      {message && (
        <div className={`srb-message ${message.kind === "error" ? "error" : ""}`}>
          {message.text}
        </div>
      )}

      {user && myReports.length > 0 && (
        <div className="srb-my-reports">
          <p className="srb-my-title">
            <FolderOpen size={15} /> Your saved readings
          </p>
          {myReports.map((r) => (
            <div key={r.id} className="srb-report-item">
              <a href={`#/r/${r.id}`}>{r.title}</a>
              <span className="srb-report-date">{dateLabel(r.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {!saved && !user && (
        <p className="srb-desc" style={{ marginTop: 10, marginBottom: 0 }}>
          Saved as a guest? Keep the link private — anyone with it can view the
          reading. A free account lets you keep a personal list.
        </p>
      )}
    </div>
  );
}
