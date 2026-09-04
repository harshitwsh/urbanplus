import React from 'react';
import { useApp } from '../../context/AppContext';
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

export const AppShell: React.FC = () => {
  const { activeTab, isLoggedIn } = useApp();

  // Standalone full-screen pages
  if (activeTab === 'landing') {
    return <LandingPage />;
  }

  if (activeTab === 'login') {
    return <LoginView />;
  }

  if (activeTab === 'role_selection') {
    return <RoleSelectionView />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'command_center':
        return <CommandCenter />;
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

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F7F8FA] overflow-hidden font-sans select-none">
      <Header />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#F7F8FA] relative">
          {renderTabContent()}
        </main>
      </div>
      <SimulationController />
    </div>
  );
};
