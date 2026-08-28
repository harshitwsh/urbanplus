import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SimulationController } from './SimulationController';
import { DemoGuideModal } from './DemoGuideModal';
import { LoginView } from '../auth/LoginView';

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
import { MobilityAnalyticsView } from '../analytics/MobilityAnalyticsView';
import { ReportsView } from '../reports/ReportsView';
import { PrivacySecurityView } from '../system/PrivacySecurityView';
import { AIArchitectureView } from '../architecture/AIArchitectureView';

export const AppShell: React.FC = () => {
  const { activeTab, isLoggedIn } = useApp();
  const [isJudgeGuideOpen, setIsJudgeGuideOpen] = useState<boolean>(false);

  if (!isLoggedIn) {
    return <LoginView />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'command_center': return <CommandCenter />;
      case 'map': return <GISMap />;
      case 'fusion': return <EvidenceFusionView />;
      case 'vision': return <EdgeVisionSimulator />;
      case 'road': return <RoadConditionView />;
      case 'traffic': return <TrafficIntelligenceView />;
      case 'hotspots': return <CongestionHotspotsView />;
      case 'fleet': return <FleetMonitoringView />;
      case 'incidents': return <IncidentCenterView />;
      case 'actions': return <ActionCenterView />;
      case 'analytics': return <MobilityAnalyticsView />;
      case 'reports': return <ReportsView />;
      case 'privacy': return <PrivacySecurityView />;
      case 'architecture': return <AIArchitectureView />;
      default: return <CommandCenter />;
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0D1117] text-[#F3F6FA] flex flex-col overflow-hidden selection:bg-[#4C7DFF] selection:text-white font-sans">
      <Header onOpenJudgeGuide={() => setIsJudgeGuideOpen(true)} />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-[#0D1117] relative z-0">
          {renderTab()}
        </main>
      </div>
      <SimulationController />
      <DemoGuideModal isOpen={isJudgeGuideOpen} onClose={() => setIsJudgeGuideOpen(false)} />
    </div>
  );
};
