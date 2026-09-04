import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SimulationController } from './SimulationController';

import { LandingPage } from '../landing/LandingPage';
import { LoginView } from '../auth/LoginView';
import { EmailVerificationView } from '../auth/EmailVerificationView';
import { RoleSelectionView } from '../auth/RoleSelectionView';
import { CommandCenter } from '../dashboard/CommandCenter';
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
import { CitizenReportView } from '../citizen/CitizenReportView';
import { MyReportsView } from '../citizen/MyReportsView';
import { DashcamIntelligenceView } from '../dashcam/DashcamIntelligenceView';
import { MobileCityEyesView } from '../dashcam/MobileCityEyesView';
import { Logo } from '../common/Logo';
import { Loader2 } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { user, loading, isAuthenticated, isEmailVerified } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // If a logged-in & verified user visits login or signup, redirect directly to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && isEmailVerified) {
      if (activeTab === 'login' || activeTab === 'signup' || activeTab === 'verify_email') {
        setActiveTab('command_center');
      }
    }
  }, [loading, isAuthenticated, isEmailVerified, activeTab, setActiveTab]);

  // 1. Show authentication loading state while checking Firebase to prevent flicker
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center space-y-4 font-sans select-none">
        <Logo size="loading" clickable={false} />
        <div className="flex items-center space-x-2 text-xs font-mono text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
          <span>INITIALIZING URBANPULSE CLOUD INTELLIGENCE...</span>
        </div>
      </div>
    );
  }

  // 2. Standalone Views (Landing, Login, Signup, Forgot Password, Verification, Role Selection)
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

  if (activeTab === 'verify_email' || (user && !user.emailVerified)) {
    return <EmailVerificationView />;
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
      case 'citizen_report':
        return <CitizenReportView />;
      case 'my_reports':
        return <MyReportsView />;
      case 'dashcam':
        return <DashcamIntelligenceView />;
      case 'mobile_eyes':
        return <MobileCityEyesView />;
      default:
        return <CommandCenter />;
    }
  };

  const isMapTab = false;

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
