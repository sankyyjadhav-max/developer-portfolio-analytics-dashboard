"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FolderKanban,
  Globe,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-brand">
        <div className="dashboard-logo">
          Dev<span>Pulse</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <Link
          href="/dashboard"
          className={`nav-item ${
            isActive("/dashboard") ? "active" : ""
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/dashboard/portfolio"
          className={`nav-item ${
            isActive("/dashboard/portfolio") ? "active" : ""
          }`}
        >
          <UserRound size={18} />
          <span>Portfolio</span>
        </Link>

        <Link
          href="/dashboard/projects"
          className={`nav-item ${
            isActive("/dashboard/projects") ? "active" : ""
          }`}
        >
          <FolderKanban size={18} />
          <span>Projects</span>
        </Link>

        <Link
          href="/dashboard/analytics"
          className={`nav-item ${
            isActive("/dashboard/analytics") ? "active" : ""
          }`}
        >
          <BarChart3 size={18} />
          <span>Analytics</span>
        </Link>

        <Link
          href="/dashboard/reports"
          className={`nav-item ${
            isActive("/dashboard/reports") ? "active" : ""
          }`}
        >
          <Globe size={18} />
          <span>Reports</span>
        </Link>

        <Link
          href="/dashboard/settings"
          className={`nav-item ${
            isActive("/dashboard/settings") ? "active" : ""
          }`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* Bottom actions */}
      <div className="sidebar-bottom">
        <button
          type="button"
          onClick={handleLogout}
          className="logout-button"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}