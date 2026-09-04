import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  NavigationTab, 
  UserRole, 
  Bus, 
  RoadDefect, 
  Incident, 
  ActionItem,
  TrafficHotspot
} from '../types/urbanpulse';
import { 
  MOCK_BUSES, 
  MOCK_ROAD_DEFECTS, 
  MOCK_INCIDENTS, 
  MOCK_ACTION_ITEMS, 
  MOCK_TRAFFIC_HOTSPOTS,
  PRIMARY_FUSED_DEFECT,
  DEMO_PRESENTATION_STEPS
} from '../data/mockData';
import { FleetSimulationEngine } from '../services/FleetSimulationEngine';
import { AuthProviderService } from '../services/AuthProvider';

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedBus: Bus | null;
  setSelectedBus: (bus: Bus | null) => void;
  selectedDefect: RoadDefect | null;
  setSelectedDefect: (defect: RoadDefect | null) => void;
  buses: Bus[];
  roadDefects: RoadDefect[];
  incidents: Incident[];
  actionItems: ActionItem[];
  trafficHotspots: TrafficHotspot[];
  demoStep: number;
  setDemoStep: (step: number) => void;
  isDemoRunning: boolean;
  setIsDemoRunning: (running: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  
  // Actions
  verifyIncident: (id: string, action: 'VERIFIED' | 'DISMISSED' | 'ESCALATED') => void;
  updateActionStatus: (id: string, newStatus: ActionItem['status']) => void;
  advanceDemoStep: () => void;
  resetDemo: () => void;
  addSyntheticDefect: (defect: Partial<RoadDefect>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('command_center');
  const [userRole, setUserRole] = useState<UserRole>('transport_authority');
  const [selectedBus, setSelectedBus] = useState<Bus | null>(MOCK_BUSES[0]);
  const [selectedDefect, setSelectedDefect] = useState<RoadDefect | null>(PRIMARY_FUSED_DEFECT);
  const [buses, setBuses] = useState<Bus[]>(MOCK_BUSES);
  const [roadDefects, setRoadDefects] = useState<RoadDefect[]>(MOCK_ROAD_DEFECTS);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [actionItems, setActionItems] = useState<ActionItem[]>(MOCK_ACTION_ITEMS);
  const [trafficHotspots] = useState<TrafficHotspot[]>(MOCK_TRAFFIC_HOTSPOTS);
  
  const [demoStep, setDemoStep] = useState<number>(1);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(AuthProviderService.getSession()));

  const fleetEngineRef = useRef<FleetSimulationEngine>(new FleetSimulationEngine(MOCK_BUSES));

  // Route Protection Guard
  useEffect(() => {
    const protectedTabs: NavigationTab[] = [
      'command_center', 'map', 'events', 'fusion', 'road', 'traffic', 
      'hotspots', 'fleet', 'incidents', 'actions', 'field_officer', 
      'analytics', 'reports', 'architecture', 'settings'
    ];

    if (!isLoggedIn && protectedTabs.includes(activeTab)) {
      setActiveTab('login');
    }
  }, [activeTab, isLoggedIn]);

  // Real Fleet Simulation Interval
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedBuses = fleetEngineRef.current.stepSimulation();
      setBuses([...updatedBuses]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance Demo Step Player
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDemoRunning) {
      timer = setInterval(() => {
        setDemoStep((prev) => {
          if (prev >= DEMO_PRESENTATION_STEPS.length) {
            setIsDemoRunning(false);
            return 1;
          }
          const nextStep = prev + 1;
          const stepConfig = DEMO_PRESENTATION_STEPS[nextStep - 1];
          if (stepConfig) {
            setActiveTab(stepConfig.targetTab);
          }
          return nextStep;
        });
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isDemoRunning]);

  const verifyIncident = (id: string, action: 'VERIFIED' | 'DISMISSED' | 'ESCALATED') => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          status: action,
          verifiedBy: `Operator (${userRole.replace('_', ' ').toUpperCase()})`,
          actionTaken: action === 'VERIFIED' ? 'Dispatched PCR Unit' : action === 'ESCALATED' ? 'Escalated to Cyber Cell' : 'Dismissed False Positive'
        };
      }
      return inc;
    }));
  };

  const updateActionStatus = (id: string, newStatus: ActionItem['status']) => {
    setActionItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = {
          ...item,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        
        // Synchronize state with central roadDefects
        setRoadDefects(defs => defs.map(def => {
          if (def.code === item.code || def.id === item.defectId) {
            return {
              ...def,
              status: newStatus === 'RESOLVED' ? 'RESOLVED' : newStatus === 'INSPECTION' || newStatus === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'VERIFIED'
            };
          }
          return def;
        }));

        return updated;
      }
      return item;
    }));
  };

  const advanceDemoStep = () => {
    setDemoStep(prev => {
      const nextStep = prev >= DEMO_PRESENTATION_STEPS.length ? 1 : prev + 1;
      const stepConfig = DEMO_PRESENTATION_STEPS[nextStep - 1];
      if (stepConfig) {
        setActiveTab(stepConfig.targetTab);
      }
      return nextStep;
    });
  };

  const resetDemo = () => {
    setDemoStep(1);
    setIsDemoRunning(false);
    setActiveTab('command_center');
  };

  const addSyntheticDefect = (newDef: Partial<RoadDefect>) => {
    const fullDefect: RoadDefect = {
      id: `DEF-${Math.floor(10000 + Math.random() * 90000)}`,
      code: `UP-${Math.floor(10000 + Math.random() * 90000)}`,
      type: newDef.type || 'pothole',
      title: newDef.title || 'New Edge Detected Hazard',
      description: newDef.description || 'Automatically captured by mobile bus camera node.',
      address: newDef.address || 'MG Road Urban Corridor',
      lat: newDef.lat || 28.4595,
      lng: newDef.lng || 77.0266,
      timestamp: new Date().toISOString(),
      firstDetectedAt: 'Just Now',
      lastVerifiedAt: 'Just Now',
      initialBusId: newDef.initialBusId || 'BUS-104',
      routeId: 'R-07',
      initialConfidence: 89.4,
      fusionConfidence: 89.4,
      severity: newDef.severity || 'HIGH',
      status: 'OPEN',
      evidenceCount: 1,
      sightings: [],
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      assignedDept: 'Road Maintenance Dept',
      slaHours: 24
    };

    setRoadDefects(prev => [fullDefect, ...prev]);
    setSelectedDefect(fullDefect);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        userRole,
        setUserRole,
        selectedBus,
        setSelectedBus,
        selectedDefect,
        setSelectedDefect,
        buses,
        roadDefects,
        incidents,
        actionItems,
        trafficHotspots,
        demoStep,
        setDemoStep,
        isDemoRunning,
        setIsDemoRunning,
        isLoggedIn,
        setIsLoggedIn,
        verifyIncident,
        updateActionStatus,
        advanceDemoStep,
        resetDemo,
        addSyntheticDefect
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
