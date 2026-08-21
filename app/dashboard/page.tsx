"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Briefcase,
  Eye,
  FolderKanban,
  Globe2,
  Plus,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { api } from "../../lib/api";

type Portfolio = {
  id?: string;
  name?: string;
  title?: string;
  slug?: string;
  bio?: string;
  published?: boolean;
  projects?: Array<{
    id?: string;
    title?: string;
  }>;
  views?: number;
  visitors?: number;
};

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const data = await api("/api/portfolio");
        setPortfolio(data?.portfolio || data || null);
      } catch (error) {
        console.error("Failed to load portfolio:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, []);

  const projectCount = portfolio?.projects?.length || 0;
  const portfolioName =
    portfolio?.name ||
    portfolio?.title ||
    "Your Developer Portfolio";

  const publicUrl = portfolio?.slug
    ? `/p/${portfolio.slug}`
    : "/dashboard/portfolio";

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage your portfolio and track your developer presence.
          </p>
        </div>

        <div className="dashboard-actions">
          <Link href="/dashboard/portfolio" className="dashboard-secondary-btn">
            <Settings size={16} />
            Customize
          </Link>

          <Link href="/dashboard/projects" className="dashboard-primary-btn">
            <Plus size={17} />
            Add Project
          </Link>
        </div>
      </div>

      <section className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Eye size={19} />
          </div>

          <div>
            <span className="stat-label">Portfolio Views</span>
            <strong>{portfolio?.views ?? 0}</strong>
            <small>
              <TrendingUp size={13} />
              Traffic overview
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={19} />
          </div>

          <div>
            <span className="stat-label">Visitors</span>
            <strong>{portfolio?.visitors ?? 0}</strong>
            <small>
              <TrendingUp size={13} />
              Unique visitors
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FolderKanban size={19} />
          </div>

          <div>
            <span className="stat-label">Projects</span>
            <strong>{projectCount}</strong>
            <small>
              <FolderKanban size={13} />
              Portfolio projects
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Globe2 size={19} />
          </div>

          <div>
            <span className="stat-label">Status</span>
            <strong>{portfolio?.published ? "Live" : "Draft"}</strong>
            <small>
              <Globe2 size={13} />
              {portfolio?.published
                ? "Portfolio published"
                : "Ready to publish"}
            </small>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card portfolio-overview">
          <div className="card-header">
            <div>
              <p className="card-eyebrow">PORTFOLIO</p>
              <h2>Portfolio Overview</h2>
            </div>

            <Link href="/dashboard/portfolio" className="card-link">
              Manage
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="dashboard-loading">
              Loading your portfolio...
            </div>
          ) : (
            <div className="portfolio-preview">
              <div className="portfolio-avatar">
                {(portfolioName?.charAt(0) || "D").toUpperCase()}
              </div>

              <div className="portfolio-info">
                <h3>{portfolioName}</h3>

                <p>
                  {portfolio?.bio ||
                    "Build your developer portfolio, showcase your projects and share your work."}
                </p>

                <div className="portfolio-meta">
                  <span
                    className={`status-badge ${
                      portfolio?.published ? "published" : "draft"
                    }`}
                  >
                    <span className="status-dot" />
                    {portfolio?.published ? "Published" : "Draft"}
                  </span>

                  {portfolio?.slug && (
                    <span className="slug-text">
                      /p/{portfolio.slug}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="overview-footer">
            <Link href="/dashboard/portfolio" className="overview-action">
              <Briefcase size={17} />
              Edit Portfolio
              <ArrowUpRight size={14} />
            </Link>

            {portfolio?.slug && (
              <Link
                href={publicUrl}
                target="_blank"
                className="overview-action"
              >
                <Globe2 size={17} />
                View Public Portfolio
                <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
        </div>

        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <div>
              <p className="card-eyebrow">QUICK ACTIONS</p>
              <h2>Get Started</h2>
            </div>
          </div>

          <div className="quick-action-list">
            <Link href="/dashboard/projects" className="quick-action">
              <span className="quick-action-icon">
                <FolderKanban size={18} />
              </span>

              <span>
                <strong>Add a project</strong>
                <small>Showcase your strongest work</small>
              </span>

              <ArrowUpRight size={16} />
            </Link>

            <Link href="/dashboard/portfolio" className="quick-action">
              <span className="quick-action-icon">
                <Briefcase size={18} />
              </span>

              <span>
                <strong>Customize portfolio</strong>
                <small>Update your profile and appearance</small>
              </span>

              <ArrowUpRight size={16} />
            </Link>

            <Link href="/dashboard/analytics" className="quick-action">
              <span className="quick-action-icon">
                <TrendingUp size={18} />
              </span>

              <span>
                <strong>View analytics</strong>
                <small>Track your portfolio performance</small>
              </span>

              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="dashboard-card projects-overview">
        <div className="card-header">
          <div>
            <p className="card-eyebrow">YOUR WORK</p>
            <h2>Recent Projects</h2>
          </div>

          <Link href="/dashboard/projects" className="card-link">
            View all
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            Loading projects...
          </div>
        ) : projectCount > 0 ? (
          <div className="project-list">
            {portfolio?.projects?.slice(0, 4).map((project, index) => (
              <div className="project-row" key={project.id || index}>
                <div className="project-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="project-row-info">
                  <strong>{project.title || "Untitled Project"}</strong>
                  <span>Portfolio project</span>
                </div>

                <Link
                  href="/dashboard/projects"
                  className="project-arrow"
                >
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-projects">
            <div className="empty-icon">
              <FolderKanban size={22} />
            </div>

            <div>
              <h3>No projects yet</h3>
              <p>
                Add your first project to start building your portfolio.
              </p>
            </div>

            <Link href="/dashboard/projects" className="dashboard-primary-btn">
              <Plus size={16} />
              Add Project
            </Link>
          </div>
        )}
      </section>

      <style jsx>{`
        .dashboard-page {
          min-height: 100%;
          padding: 42px 46px 60px;
          color: #f4f1f8;
        }

        .dashboard-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 34px;
        }

        .dashboard-eyebrow,
        .card-eyebrow {
          margin: 0 0 8px;
          color: #8d83a8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 34px;
          line-height: 1.1;
          font-weight: 650;
          letter-spacing: -0.03em;
        }

        .dashboard-subtitle {
          margin: 10px 0 0;
          color: #85818e;
          font-size: 14px;
        }

        .dashboard-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        .dashboard-primary-btn,
        .dashboard-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 15px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .dashboard-primary-btn {
          color: #fff;
          background: linear-gradient(135deg, #7956d8, #6343b9);
          box-shadow: 0 8px 25px rgba(103, 72, 183, 0.2);
        }

        .dashboard-primary-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        .dashboard-secondary-btn {
          color: #c7c1d2;
          border: 1px solid #292733;
          background: #111116;
        }

        .dashboard-secondary-btn:hover {
          background: #17161d;
          border-color: #3b3746;
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .stat-card,
        .dashboard-card {
          border: 1px solid #24232c;
          background: #0e0e13;
          border-radius: 12px;
        }

        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px;
        }

        .stat-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #9a7be5;
          border: 1px solid #302841;
          border-radius: 9px;
          background: #171320;
        }

        .stat-label {
          display: block;
          margin-bottom: 6px;
          color: #8a8691;
          font-size: 11px;
        }

        .stat-card strong {
          display: block;
          font-size: 23px;
          font-weight: 650;
          letter-spacing: -0.02em;
        }

        .stat-card small {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 5px;
          color: #6f6b77;
          font-size: 10px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.8fr);
          gap: 18px;
          margin-bottom: 18px;
        }

        .dashboard-card {
          padding: 24px;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .card-header h2 {
          margin: 0;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .card-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #9b82d7;
          font-size: 12px;
          text-decoration: none;
        }

        .card-link:hover {
          color: #b49ce8;
        }

        .portfolio-preview {
          display: flex;
          gap: 18px;
          padding: 20px;
          border: 1px solid #22212a;
          border-radius: 10px;
          background: #111116;
        }

        .portfolio-avatar {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 12px;
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #7654d0, #4d3b8a);
        }

        .portfolio-info h3 {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 600;
        }

        .portfolio-info p {
          margin: 0;
          max-width: 650px;
          color: #85818c;
          font-size: 12px;
          line-height: 1.6;
        }

        .portfolio-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 13px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 600;
        }

        .status-badge.published {
          color: #91d5ae;
          background: rgba(62, 156, 98, 0.1);
          border: 1px solid rgba(62, 156, 98, 0.18);
        }

        .status-badge.draft {
          color: #c4a36b;
          background: rgba(196, 163, 107, 0.08);
          border: 1px solid rgba(196, 163, 107, 0.16);
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .slug-text {
          color: #696570;
          font-size: 11px;
        }

        .overview-footer {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        .overview-action {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 11px;
          color: #aaa4b5;
          border: 1px solid #25242d;
          border-radius: 8px;
          background: #111116;
          font-size: 11px;
          text-decoration: none;
        }

        .overview-action:hover {
          color: #fff;
          border-color: #3b3746;
        }

        .quick-action-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .quick-action {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px;
          color: inherit;
          border: 1px solid transparent;
          border-radius: 9px;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .quick-action:hover {
          border-color: #272631;
          background: #121217;
        }

        .quick-action-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #9a7be5;
          border-radius: 8px;
          background: #181420;
        }

        .quick-action span:nth-child(2) {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }

        .quick-action strong {
          color: #d9d5df;
          font-size: 12px;
          font-weight: 600;
        }

        .quick-action small {
          margin-top: 3px;
          color: #716d78;
          font-size: 10px;
        }

        .quick-action > svg {
          color: #625d68;
        }

        .projects-overview {
          margin-bottom: 20px;
        }

        .project-list {
          display: flex;
          flex-direction: column;
        }

        .project-row {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px 4px;
          border-top: 1px solid #202027;
        }

        .project-number {
          width: 32px;
          color: #625d68;
          font-size: 10px;
          font-family: monospace;
        }

        .project-row-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .project-row-info strong {
          color: #d9d5df;
          font-size: 13px;
          font-weight: 600;
        }

        .project-row-info span {
          color: #6f6a75;
          font-size: 10px;
        }

        .project-arrow {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          color: #77717f;
          border: 1px solid #272631;
          border-radius: 7px;
          text-decoration: none;
        }

        .project-arrow:hover {
          color: #b79de8;
          border-color: #413753;
        }

        .empty-projects {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px;
          border: 1px dashed #292731;
          border-radius: 10px;
        }

        .empty-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #8e75c8;
          border-radius: 9px;
          background: #17131f;
        }

        .empty-projects > div:nth-child(2) {
          flex: 1;
        }

        .empty-projects h3 {
          margin: 0 0 4px;
          font-size: 13px;
          font-weight: 600;
        }

        .empty-projects p {
          margin: 0;
          color: #716d78;
          font-size: 11px;
        }

        .dashboard-loading {
          padding: 35px 10px;
          color: #77727d;
          font-size: 12px;
          text-align: center;
        }

        @media (max-width: 1100px) {
          .dashboard-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .dashboard-page {
            padding: 28px 20px 45px;
          }

          .dashboard-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .dashboard-actions {
            width: 100%;
          }

          .dashboard-actions a {
            flex: 1;
          }

          .dashboard-stats {
            grid-template-columns: 1fr;
          }

          .overview-footer {
            flex-direction: column;
          }

          .portfolio-preview {
            flex-direction: column;
          }

          .empty-projects {
            align-items: flex-start;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}