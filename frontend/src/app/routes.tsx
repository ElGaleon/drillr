import { useAuth } from "@clerk/react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "../features/dashboard/views/DashboardPage";
import { PlayerDetailPage } from "../features/players/views/PlayerDetailPage";
import { PlayerAssessmentsPage } from "../features/players/views/PlayerAssessmentsPage";
import { DevelopmentIndexPage } from "../features/players/views/DevelopmentIndexPage";
import { TeamAssessmentsPage } from "../features/players/views/TeamAssessmentsPage";
import { PlayersPage } from "../features/players/views/PlayersPage";
import { PlayerFormPage } from "../features/players/views/PlayerFormPage";
import { SettingsPage } from "../features/settings/views/SettingsPage";
import { SkillFormPage } from "../features/settings/views/SkillFormPage";
import { RoleFormPage } from "../features/settings/views/RoleFormPage";
import { TestFormPage } from "../features/settings/views/TestFormPage";
import { TeamFormPage } from "../features/workspace/TeamFormPage";
import { WorkspaceProvider } from "../features/workspace/WorkspaceContext";
import { AppShell } from "../shared/components/layout/AppShell";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

function AuthGate() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  if (!isLoaded) return <div className="auth-loading">Loading session…</div>;
  if (!isSignedIn) {
    return (
      <div className="auth-loading">
        <div>
          <p className="eyebrow">Drillr</p>
          <h1>Sign in to enter your workspace.</h1>
          <p className="page-description">Configure Clerk with VITE_CLERK_PUBLISHABLE_KEY to activate authentication.</p>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceProvider getToken={getToken}>
      <AppRoutes />
    </WorkspaceProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/assessments" element={<TeamAssessmentsPage />} />
        <Route path="/reviews" element={<DevelopmentIndexPage mode="reviews" />} />
        <Route path="/athletic-tests" element={<DevelopmentIndexPage mode="athletic-tests" />} />
        <Route path="/teams/new" element={<TeamFormPage />} />
        <Route path="/players/new" element={<PlayerFormPage />} />
        <Route path="/players/:playerId/edit" element={<PlayerFormPage />} />
        <Route path="/players/:playerId/assessments" element={<PlayerAssessmentsPage />} />
        <Route path="/players/:playerId" element={<PlayerDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/skills/new" element={<SkillFormPage />} />
        <Route path="/settings/skills/:skillId/edit" element={<SkillFormPage />} />
        <Route path="/settings/roles/new" element={<RoleFormPage />} />
        <Route path="/settings/roles/:roleId/edit" element={<RoleFormPage />} />
        <Route path="/settings/tests/new" element={<TestFormPage />} />
        <Route path="/settings/tests/:testId/edit" element={<TestFormPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function DemoGate() {
  return (
    <WorkspaceProvider getToken={async () => null}>
      <AppRoutes />
    </WorkspaceProvider>
  );
}

export function AppRouter() {
  return <BrowserRouter>{clerkKey ? <AuthGate /> : <DemoGate />}</BrowserRouter>;
}
