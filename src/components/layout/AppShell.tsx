import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SimulationController } from './SimulationController';

import { LandingPage } from '../landing/LandingPage';
import { LoginView } from '../auth/LoginView';
import { RoleSelectionView } from '../auth/RoleSelectionView';
import { CommandCenter } from '../dashboard/CommandCenter';
import { GISMap } from '../map/GISMap';
import { EvidenceFusionView } from '../evidence/EvidenceFusionView';
import { EdgeVisionSimulator } from '../vision/EdgeVisionSimulator';
import { RoadConditionView } from '../road/RoadConditionView';
import { TrafficIntelligenceView } from '../traffic/TrafficIntelligenceView';
import { CongestionHotspotsView } from '../hotspots/CongestionHotspotsView';
import { FleetMonitoringView } from '../fleet/FleetMonitoringView';
import { IncidentCenterView } from '../incidents/IncidentCenterView';
import { ActionCenterView } from '../actions/ActionCenterView';
import { FieldOfficerWorkflowView } from '../field/FieldOfficerWorkflowView';
import { MobilityAnalyticsView } from '../analytics/MobilityAnalyticsView';
import { ReportsView } from '../reports/ReportsView';
import { AIArchitectureView } from '../architecture/AIArchitectureView';
import { SettingsView } from '../system/SettingsView';
import { UserProfileView } from '../profile/UserProfileView';
import { Loader2 } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { activeTab } = useApp();
  const { user, loading, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // 1. Show loading state while Firebase authentication state is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center space-y-4 font-sans select-none">
        <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center font-bold text-white text-base font-mono shadow-md animate-pulse">
          UP
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
          <span>VERIFYING URBANPULSE FIREBASE AUTHENTICATION...</span>
        </div>
      </div>
    );
  }

  // 2. Make Authentication the First Experience: if user is NOT logged in, show Login/Signup (or Landing if chosen)
  if (!user && !isAuthenticated) {
    if (activeTab === 'landing') {
      return <LandingPage />;
    }
    if (activeTab === 'signup') {
      return <LoginView initialMode="SIGNUP" />;
    }
    if (activeTab === 'forgot_password') {
      return <LoginView initialMode="FORGOT_PASSWORD" />;
    }
    return <LoginView initialMode="LOGIN" />;
  }

  // Standalone full-screen pages for authenticated user
  if (activeTab === 'landing') {
    return <LandingPage />;
  }

  if (activeTab === 'login') {
    return <LoginView initialMode="LOGIN" />;
  }

  if (activeTab === 'signup') {
    return <LoginView initialMode="SIGNUP" />;
  }

  if (activeTab === 'forgot_password') {
    return <LoginView initialMode="FORGOT_PASSWORD" />;
  }

  if (activeTab === 'role_selection') {
    return <RoleSelectionView />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'command_center':
        return <CommandCenter />;
      case 'profile':
        return <UserProfileView />;
      case 'map':
        return <GISMap />;
      case 'fusion':
        return <EvidenceFusionView />;
      case 'vision':
      case 'events':
        return <EdgeVisionSimulator />;
      case 'road':
        return <RoadConditionView />;
      case 'traffic':
        return <TrafficIntelligenceView />;
      case 'hotspots':
        return <CongestionHotspotsView />;
      case 'fleet':
        return <FleetMonitoringView />;
      case 'incidents':
        return <IncidentCenterView />;
      case 'actions':
        return <ActionCenterView />;
      case 'field_officer':
        return <FieldOfficerWorkflowView />;
      case 'analytics':
        return <MobilityAnalyticsView />;
      case 'reports':
        return <ReportsView />;
      case 'architecture':
        return <AIArchitectureView />;
      case 'privacy':
      case 'settings':
        return <SettingsView />;
      default:
        return <CommandCenter />;
    }
  };

  const isMapTab = activeTab === 'map';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] font-sans select-none">
      <Header 
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className={`flex-1 flex relative ${isMapTab ? 'h-[calc(100vh-64px)] overflow-hidden' : 'min-h-[calc(100vh-64px)]'}`}>
        <Sidebar 
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className={`flex-1 bg-[#F7F8FA] relative w-full ${isMapTab ? 'h-full overflow-hidden' : 'overflow-y-auto min-h-full pb-16'}`}>
          {renderTabContent()}
        </main>
      </div>

      <SimulationController />
    </div>
  );
};
