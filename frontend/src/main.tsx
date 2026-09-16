import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { TeamDialog } from "./components/TeamDialog";
import { WorkspaceProvider } from "./workspace/WorkspaceContext";
import { DashboardPage } from "./pages/DashboardPage";
import { PlayersPage } from "./pages/PlayersPage";
import { PlayerDetailPage } from "./pages/PlayerDetailPage";
import { SettingsPage } from "./pages/SettingsPage";
import "./styles.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

function AuthGate() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  if (!isLoaded) return <div className="auth-loading">Caricamento sessione…</div>;
  if (!isSignedIn) return <div className="auth-loading"><div><p className="eyebrow">Drillr</p><h1>Accedi per entrare nel tuo workspace.</h1><p className="page-description">Configura Clerk con `VITE_CLERK_PUBLISHABLE_KEY` per attivare il flusso di autenticazione.</p></div></div>;
  return <WorkspaceProvider getToken={getToken}><RoutesContent /><TeamDialog /></WorkspaceProvider>;
}

function RoutesContent() {
  return <Routes><Route element={<AppShell />}><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="/dashboard" element={<DashboardPage />} /><Route path="/players" element={<PlayersPage />} /><Route path="/players/:playerId" element={<PlayerDetailPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Route></Routes>;
}

function DemoGate() {
  return <WorkspaceProvider getToken={async () => null}><RoutesContent /><TeamDialog /></WorkspaceProvider>;
}

function App() { return <BrowserRouter>{clerkKey ? <AuthGate /> : <DemoGate />}</BrowserRouter>; }

createRoot(document.getElementById("root")!).render(<StrictMode><QueryClientProvider client={queryClient}><App /></QueryClientProvider></StrictMode>);
