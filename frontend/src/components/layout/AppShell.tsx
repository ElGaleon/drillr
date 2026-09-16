import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { CaretLeft, CaretRight, ChartLineUp, GearSix, List, UsersThree, X } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useWorkspace } from "../../workspace/WorkspaceContext";

const navItems = [{ to: "/dashboard", label: "Panoramica", icon: ChartLineUp }, { to: "/players", label: "Giocatori", icon: UsersThree }, { to: "/settings", label: "Impostazioni", icon: GearSix }];

export function AppShell() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("drillr.sidebar") === "collapsed");
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { teams, selectedTeam, selectTeam, openCreateTeam } = useWorkspace();

  useEffect(() => { localStorage.setItem("drillr.sidebar", collapsed ? "collapsed" : "expanded"); }, [collapsed]);
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return <div className="app-shell">
    <div className={cn("mobile-bar", mobileOpen && "mobile-bar-open")}><button className="icon-button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}>{mobileOpen ? <X size={21} /> : <List size={21} />}</button><span className="font-display text-lg font-bold">drillr<span className="text-[var(--accent)]">.</span></span><div className="mobile-bar-spacer" /></div>
    <aside className={cn("sidebar", collapsed && "sidebar-collapsed", mobileOpen && "sidebar-mobile-open")}>
      <div className="sidebar-brand"><div className="brand-mark">d<span>.</span></div><span className="brand-word">drillr</span><button className="sidebar-toggle" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Espandi sidebar" : "Comprimi sidebar"}>{collapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}</button></div>
      <div className="team-switcher-wrap"><label className="sidebar-caption">Workspace</label><select className="team-select" value={selectedTeam?.id ?? ""} onChange={(event) => selectTeam(event.target.value)} aria-label="Seleziona team">{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select><button className="team-add" onClick={openCreateTeam} aria-label="Crea nuovo team">+</button></div>
      <nav className="sidebar-nav" aria-label="Navigazione principale">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => cn("sidebar-link", isActive && "sidebar-link-active")} title={collapsed ? label : undefined}><Icon size={19} weight="duotone" /><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-footer"><div className="sidebar-footnote"><span className="status-dot" />{!collapsed && <span>Stagione {selectedTeam?.season ?? "—"}</span>}</div><div className="sidebar-user"><div className="user-avatar">AG</div>{!collapsed && <div><strong>Coach</strong><span>Account personale</span></div>}</div></div>
    </aside>
    <main className="main-content"><Outlet /></main>
  </div>;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</header>;
}
