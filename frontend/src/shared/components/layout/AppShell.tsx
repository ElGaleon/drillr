import { useEffect, useState, type ReactNode } from "react";
import { Bell, CaretLeft, CaretRight, CaretUpDown, ChartLineUp, ChatCircleText, ClipboardText, CreditCard, GearSix, List, PersonSimpleRun, Plus, SignOut, Sparkle, UserCircle, UsersThree, X } from "@phosphor-icons/react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useWorkspace } from "../../../features/workspace/WorkspaceContext";
import { cn } from "../../lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { SidebarMenuButton } from "../ui/sidebar-menu-button";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: ChartLineUp },
  { to: "/players", label: "Players", icon: UsersThree },
  { to: "/assessments", label: "Assessments", icon: ClipboardText },
  { to: "/reviews", label: "Reviews", icon: ChatCircleText },
  { to: "/athletic-tests", label: "Athletic tests", icon: PersonSimpleRun },
  { to: "/settings", label: "Settings", icon: GearSix },
];

export function AppShell() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("drillr.sidebar") === "collapsed");
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { teams, selectedTeam, selectTeam, openCreateTeam } = useWorkspace();

  useEffect(() => {
    localStorage.setItem("drillr.sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className={cn("app-shell", collapsed && "app-shell-collapsed")}>
      <div className={cn("mobile-bar", mobileOpen && "mobile-bar-open")}>
        <button className="icon-button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close menu" : "Open menu"}>
          {mobileOpen ? <X size={21} /> : <List size={21} />}
        </button>
        <span className="font-display text-lg font-bold">drillr<span className="text-[var(--accent)]">.</span></span>
        <div className="mobile-bar-spacer" />
      </div>
      <aside id="primary-sidebar" className={cn("sidebar", collapsed && "sidebar-collapsed", mobileOpen && "sidebar-mobile-open")}>
        <div className="sidebar-brand">
          <div className="brand-mark">d</div>
          <span className="brand-word">drillr<span>.</span></span>
          <button className="sidebar-toggle" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} aria-controls="primary-sidebar">
            {collapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
          </button>
        </div>
        <div className="sidebar-divider" aria-hidden="true" />
        <div className="team-switcher-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="team-select" aria-label="Select team">
                {selectedTeam && <span className="team-trigger-content"><span className="team-avatar">{selectedTeam.name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase()}</span><span className="team-trigger-copy"><strong>{selectedTeam.name}</strong><small>{selectedTeam.season}</small></span></span>}
                {!selectedTeam && <span className="team-placeholder">Select team</span>}
                <CaretUpDown className="team-trigger-icon" size={16} />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="team-select-content">
              <DropdownMenuLabel className="team-menu-title">Teams</DropdownMenuLabel>
              {teams.map((team, index) => <DropdownMenuItem key={team.id} className="team-item" onSelect={() => selectTeam(team.id)}><span className="team-option-content"><span className="team-avatar">{team.name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase()}</span><span className="team-option-copy"><strong>{team.name}</strong><small>{team.season}</small></span></span><DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut></DropdownMenuItem>)}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="team-item team-create-item" onSelect={openCreateTeam}><span className="team-option-content"><span className="team-avatar team-avatar-create"><Plus size={18} /></span><span className="team-option-copy"><strong>Add team</strong></span></span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => cn("sidebar-link", isActive && "sidebar-link-active")} title={collapsed ? label : undefined}><Icon size={19} weight="duotone" /><span>{label}</span></NavLink>)}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footnote"><span className="status-dot" />{!collapsed && <span>Season {selectedTeam?.season ?? "—"}</span>}</div>
          <div className="sidebar-divider sidebar-footer-divider" aria-hidden="true" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="sidebar-user" aria-label="Open account menu">
                <div className="user-avatar">AG</div>
                {!collapsed && <div className="sidebar-user-copy"><strong>Coach</strong><span>Personal account</span></div>}
                {!collapsed && <CaretUpDown className="sidebar-user-chevron" size={15} />}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="account-menu">
              <DropdownMenuLabel className="account-menu-header"><div className="user-avatar">AG</div><div><strong>Coach</strong><span>Personal account</span></div></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="account-menu-item"><Sparkle size={16} /><span>Upgrade to Pro</span></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="account-menu-item"><UserCircle size={16} /><span>Account</span></DropdownMenuItem>
              <DropdownMenuItem className="account-menu-item"><CreditCard size={16} /><span>Billing</span></DropdownMenuItem>
              <DropdownMenuItem className="account-menu-item"><Bell size={16} /><span>Notifications</span></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="account-menu-item"><SignOut size={16} /><span>Log out</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</header>;
}
