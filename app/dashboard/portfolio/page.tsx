"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Save,
  ExternalLink,
  User,
  Link as LinkIcon,
  Palette,
  Globe,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../../lib/api";

type Portfolio = {
  id: string;
  name: string;
  headline: string;
  bio: string;
  slug: string;
  profileImage?: string | null;
  location?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  websiteUrl?: string | null;
  resumeUrl?: string | null;
  template: string;
  theme: string;
  published: boolean;
};

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    try {
      const data = await api("/api/portfolio");
      setPortfolio(data);
    } catch (err: any) {
      setError(err.message || "Unable to load portfolio");
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof Portfolio, value: any) {
    setPortfolio((current) =>
      current ? { ...current, [field]: value } : current
    );
  }

  async function savePortfolio(e: React.FormEvent) {
    e.preventDefault();

    if (!portfolio) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updated = await api("/api/portfolio", {
        method: "PUT",
        body: JSON.stringify(portfolio),
      });

      setPortfolio(updated);
      setMessage("Portfolio saved successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to save portfolio");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished() {
    if (!portfolio) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updated = await api("/api/portfolio", {
        method: "PUT",
        body: JSON.stringify({
          ...portfolio,
          published: !portfolio.published,
        }),
      });

      setPortfolio(updated);
      setMessage(
        updated.published
          ? "Portfolio published successfully."
          : "Portfolio unpublished."
      );
    } catch (err: any) {
      setError(err.message || "Failed to update publishing status");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner" />
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="portfolio-error-page">
        <AlertCircle size={30} />
        <h2>Portfolio not found</h2>
        <p>{error || "Unable to load your portfolio."}</p>
        <Link href="/dashboard" className="dashboard-secondary-button">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      {/* Header */}
      <div className="portfolio-page-header">
        <div>
          <p className="eyebrow">Portfolio Builder</p>
          <h1>Edit your portfolio</h1>
          <p className="portfolio-page-subtitle">
            Create and customize your professional developer profile.
          </p>
        </div>

        <div className="portfolio-header-actions">
          <button
            type="button"
            className={`publish-button ${
              portfolio.published ? "published" : ""
            }`}
            onClick={togglePublished}
            disabled={saving}
          >
            <Globe size={16} />
            {portfolio.published ? "Published" : "Publish"}
          </button>

          <Link
            href={`/p/${portfolio.slug}`}
            target="_blank"
            className="dashboard-secondary-button"
          >
            <ExternalLink size={16} />
            View portfolio
          </Link>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="portfolio-message success">
          <CheckCircle2 size={17} />
          {message}
        </div>
      )}

      {error && (
        <div className="portfolio-message error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <form onSubmit={savePortfolio}>
        <div className="portfolio-layout">
          {/* Main */}
          <div className="portfolio-main">
            {/* Personal */}
            <section className="portfolio-panel">
              <div className="panel-heading">
                <div className="panel-icon">
                  <User size={19} />
                </div>

                <div>
                  <h2>Personal information</h2>
                  <p>Tell visitors who you are.</p>
                </div>
              </div>

              <div className="portfolio-form-grid">
                <div className="portfolio-field full">
                  <label>Name</label>
                  <input
                    value={portfolio.name || ""}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Sanket Jadhav"
                    required
                  />
                </div>

                <div className="portfolio-field full">
                  <label>Professional headline</label>
                  <input
                    value={portfolio.headline || ""}
                    onChange={(e) => update("headline", e.target.value)}
                    placeholder="AI & ML Developer"
                    maxLength={120}
                    required
                  />
                </div>

                <div className="portfolio-field">
                  <label>Location</label>
                  <input
                    value={portfolio.location || ""}
                    onChange={(e) => update("location", e.target.value)}
                    placeholder="Bengaluru, India"
                  />
                </div>

                <div className="portfolio-field">
                  <label>Contact email</label>
                  <input
                    value={portfolio.contactEmail || ""}
                    onChange={(e) =>
                      update("contactEmail", e.target.value)
                    }
                    type="email"
                    placeholder="hello@example.com"
                  />
                </div>

                <div className="portfolio-field full">
                  <label>Bio</label>
                  <textarea
                    value={portfolio.bio || ""}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="Write a short introduction about yourself..."
                    rows={6}
                  />
                </div>

                <div className="portfolio-field full">
                  <label>Profile image URL</label>
                  <input
                    value={portfolio.profileImage || ""}
                    onChange={(e) =>
                      update("profileImage", e.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            </section>

            {/* Social */}
            <section className="portfolio-panel">
              <div className="panel-heading">
                <div className="panel-icon">
                  <LinkIcon size={19} />
                </div>

                <div>
                  <h2>Social links</h2>
                  <p>Connect visitors with your professional profiles.</p>
                </div>
              </div>

              <div className="portfolio-form-grid">
                <div className="portfolio-field">
                  <label>GitHub</label>
                  <input
                    value={portfolio.githubUrl || ""}
                    onChange={(e) =>
                      update("githubUrl", e.target.value)
                    }
                    placeholder="https://github.com/username"
                  />
                </div>

                <div className="portfolio-field">
                  <label>LinkedIn</label>
                  <input
                    value={portfolio.linkedinUrl || ""}
                    onChange={(e) =>
                      update("linkedinUrl", e.target.value)
                    }
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="portfolio-field">
                  <label>Twitter / X</label>
                  <input
                    value={portfolio.twitterUrl || ""}
                    onChange={(e) =>
                      update("twitterUrl", e.target.value)
                    }
                    placeholder="https://x.com/username"
                  />
                </div>

                <div className="portfolio-field">
                  <label>Personal website</label>
                  <input
                    value={portfolio.websiteUrl || ""}
                    onChange={(e) =>
                      update("websiteUrl", e.target.value)
                    }
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="portfolio-field full">
                  <label>Resume URL</label>
                  <input
                    value={portfolio.resumeUrl || ""}
                    onChange={(e) =>
                      update("resumeUrl", e.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            </section>

            {/* Save */}
            <div className="portfolio-save-bar">
              <div>
                <strong>Save changes</strong>
                <span>Your changes are stored in the database.</span>
              </div>

              <button
                type="submit"
                className="dashboard-primary-button"
                disabled={saving}
              >
                <Save size={17} />
                {saving ? "Saving..." : "Save portfolio"}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="portfolio-settings">
            <section className="portfolio-panel">
              <div className="panel-heading">
                <div className="panel-icon">
                  <Globe size={19} />
                </div>

                <div>
                  <h2>Public URL</h2>
                  <p>Share your portfolio.</p>
                </div>
              </div>

              <div className="url-preview">
                <span>/p/</span>
                <strong>{portfolio.slug}</strong>
              </div>

              <div className="portfolio-field">
                <label>Slug</label>
                <input
                  value={portfolio.slug || ""}
                  onChange={(e) =>
                    update(
                      "slug",
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                    )
                  }
                  pattern="[a-z0-9-]+"
                  required
                />
              </div>

              <p className="field-help">
                Use lowercase letters, numbers and hyphens.
              </p>
            </section>

            <section className="portfolio-panel">
              <div className="panel-heading">
                <div className="panel-icon">
                  <Palette size={19} />
                </div>

                <div>
                  <h2>Appearance</h2>
                  <p>Customize your portfolio style.</p>
                </div>
              </div>

              <div className="appearance-option">
                <label>Template</label>

                <div className="template-grid">
                  <button
                    type="button"
                    className={`template-option ${
                      portfolio.template === "modern" ? "selected" : ""
                    }`}
                    onClick={() => update("template", "modern")}
                  >
                    <div className="template-preview modern-preview">
                      <div />
                      <div />
                      <div />
                    </div>

                    <span>Modern</span>
                  </button>

                  <button
                    type="button"
                    className={`template-option ${
                      portfolio.template === "creative" ? "selected" : ""
                    }`}
                    onClick={() => update("template", "creative")}
                  >
                    <div className="template-preview creative-preview">
                      <div />
                      <div />
                      <div />
                    </div>

                    <span>Creative</span>
                  </button>
                </div>
              </div>

              <div className="portfolio-field">
                <label>Theme</label>

                <select
                  value={portfolio.theme || "dark"}
                  onChange={(e) => update("theme", e.target.value)}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>
            </section>
          </aside>
        </div>
      </form>
    </div>
  );
}