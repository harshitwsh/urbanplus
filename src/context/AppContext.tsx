import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  NavigationTab, 
  UserRole, 
  Bus, 
  RoadDefect, 
  Incident, 
  ActionItem,
  TrafficHotspot,
  AlertNotification
} from '../types/urbanpulse';
import { 
  PRIMARY_FUSED_DEFECT,
  DEMO_PRESENTATION_STEPS
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { seedFirestoreIfEmpty } from '../services/seedDatabase';
import { FleetSimulationEngine } from '../services/FleetSimulationEngine';

export interface AIDetection {
  id: string;
  busId: string;
  routeId: string;
  type: string;
  confidence: number;
  lat: number;
  lng: number;
  timestamp: string;
  verified: boolean;
}

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
  vehicles: Bus[];
  roadDefects: RoadDefect[];
  incidents: Incident[];
  actionItems: ActionItem[];
  trafficHotspots: TrafficHotspot[];
  alerts: AlertNotification[];
  aiDetections: AIDetection[];
  demoStep: number;
  setDemoStep: (step: number) => void;
  isDemoRunning: boolean;
  setIsDemoRunning: (running: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  isFirestoreLive: boolean;
  
  // Real-time Backend Actions
  verifyIncident: (id: string, action: 'VERIFIED' | 'DISMISSED' | 'ESCALATED') => Promise<void>;
  updateActionStatus: (id: string, newStatus: ActionItem['status']) => Promise<void>;
  advanceDemoStep: () => void;
  resetDemo: () => void;
  addSyntheticDefect: (defect: Partial<RoadDefect>) => Promise<void>;
  updateBusCoordinates: (busId: string, lat: number, lng: number, speed?: number, heading?: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<NavigationTab>('command_center');
  const [userRole, setUserRoleState] = useState<UserRole>('transport_authority');
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedDefect, setSelectedDefect] = useState<RoadDefect | null>(PRIMARY_FUSED_DEFECT);
  
  // Real Firestore Data States
  const [buses, setBuses] = useState<Bus[]>([]);
  const [roadDefects, setRoadDefects] = useState<RoadDefect[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [trafficHotspots, setTrafficHotspots] = useState<TrafficHotspot[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [aiDetections, setAIDetections] = useState<AIDetection[]>([]);
  const [isFirestoreLive, setIsFirestoreLive] = useState<boolean>(false);

  const [demoStep, setDemoStep] = useState<number>(1);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Boolean(user));

  const fleetEngineRef = useRef<FleetSimulationEngine | null>(null);

  // Sync user role and login state from AuthContext
  useEffect(() => {
    setIsLoggedIn(Boolean(user));
    if (userProfile?.role) {
      const lower = userProfile.role.toLowerCase();
      if (lower.includes('admin')) setUserRoleState('administrator');
      else if (lower.includes('municipal')) setUserRoleState('municipal_authority');
      else if (lower.includes('field')) setUserRoleState('field_officer');
      else if (lower.includes('transport')) setUserRoleState('transport_authority');
      else setUserRoleState('operator');
    }
  }, [user, userProfile]);

  const setUserRole = async (role: UserRole) => {
    setUserRoleState(role);
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          role,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Could not persist role change to Firestore user doc:', err);
      }
    }
  };

  // Route Protection Guard
  useEffect(() => {
    const publicTabs: NavigationTab[] = ['landing', 'login', 'signup', 'forgot_password'];

    if (!user && !isAuthenticated && !publicTabs.includes(activeTab)) {
      setActiveTab('login');
    }
  }, [activeTab, user, isAuthenticated]);

  // Seed Firestore on startup if empty
  useEffect(() => {
    seedFirestoreIfEmpty().then((res) => {
      if (res.seeded) {
        console.log('✓ UrbanPulse Firestore dataset populated.');
      }
    }).catch(err => {
      console.warn('Seed initialization note:', err);
    });
  }, []);

  // 1. Real-time Firestore Listener: /vehicles and /buses
  useEffect(() => {
    const unsubVehicles = onSnapshot(
      collection(db, 'vehicles'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Bus[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) } as Bus);
          });
          setBuses(list);
          setIsFirestoreLive(true);
          if (!selectedBus && list.length > 0) {
            setSelectedBus(list[0]);
          }
          if (!fleetEngineRef.current && list.length > 0) {
            fleetEngineRef.current = new FleetSimulationEngine(list);
          }
        } else {
          // Fallback to /buses
          onSnapshot(collection(db, 'buses'), (busSnap) => {
            if (!busSnap.empty) {
              const list: Bus[] = [];
              busSnap.forEach((docSnap) => {
                list.push({ id: docSnap.id, ...(docSnap.data() as any) } as Bus);
              });
              setBuses(list);
              setIsFirestoreLive(true);
              if (!selectedBus && list.length > 0) {
                setSelectedBus(list[0]);
              }
              if (!fleetEngineRef.current && list.length > 0) {
                fleetEngineRef.current = new FleetSimulationEngine(list);
              }
            }
          });
        }
      },
      (error) => {
        console.warn('Firestore vehicles onSnapshot error:', error);
      }
    );

    return () => unsubVehicles();
  }, [selectedBus]);

  // 2. Real-time Firestore Listener: /roadDefects and /events
  useEffect(() => {
    const unsubRoadDefects = onSnapshot(
      collection(db, 'roadDefects'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: RoadDefect[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) } as RoadDefect);
          });
          setRoadDefects(list);
          if (!selectedDefect && list.length > 0) {
            setSelectedDefect(list[0]);
          }
        } else {
          onSnapshot(collection(db, 'events'), (evSnapshot) => {
            if (!evSnapshot.empty) {
              const list: RoadDefect[] = [];
              evSnapshot.forEach((docSnap) => {
                list.push({ id: docSnap.id, ...(docSnap.data() as any) } as RoadDefect);
              });
              setRoadDefects(list);
              if (!selectedDefect && list.length > 0) {
                setSelectedDefect(list[0]);
              }
            }
          });
        }
      },
      (error) => {
        console.warn('Firestore roadDefects onSnapshot error:', error);
      }
    );

    return () => unsubRoadDefects();
  }, [selectedDefect]);

  // 3. Real-time Firestore Listener: /incidents
  useEffect(() => {
    const unsubIncidents = onSnapshot(
      collection(db, 'incidents'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Incident[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) } as Incident);
          });
          setIncidents(list);
        }
      },
      (error) => {
        console.warn('Firestore incidents onSnapshot error:', error);
      }
    );

    return () => unsubIncidents();
  }, []);

  // 4. Real-time Firestore Listener: /trafficEvents and /trafficHotspots
  useEffect(() => {
    const unsubTraffic = onSnapshot(
      collection(db, 'trafficEvents'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: TrafficHotspot[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) } as TrafficHotspot);
          });
          setTrafficHotspots(list);
        } else {
          onSnapshot(collection(db, 'trafficHotspots'), (thSnapshot) => {
            if (!thSnapshot.empty) {
              const list: TrafficHotspot[] = [];
              thSnapshot.forEach((docSnap) => {
                list.push({ id: docSnap.id, ...(docSnap.data() as any) } as TrafficHotspot);
              });
              setTrafficHotspots(list);
            }
          });
        }
      },
      (error) => {
        console.warn('Firestore trafficEvents onSnapshot error:', error);
      }
    );

    return () => unsubTraffic();
  }, []);

  // 5. Real-time Firestore Listener: /alerts
  useEffect(() => {
    const unsubAlerts = onSnapshot(
      collection(db, 'alerts'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: AlertNotification[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) } as AlertNotification);
          });
          setAlerts(list);
        }
      },
      (error) => {
        console.warn('Firestore alerts onSnapshot error:', error);
      }
    );

    return () => unsubAlerts();
  }, []);

  // 6. Real-time Firestore Listener: /actions and /workOrders
  useEffect(() => {
    const unsubActions = onSnapshot(
      collection(db, 'actions'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ActionItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) } as ActionItem);
          });
          setActionItems(list);
        } else {
          onSnapshot(collection(db, 'workOrders'), (woSnapshot) => {
            if (!woSnapshot.empty) {
              const list: ActionItem[] = [];
              woSnapshot.forEach((docSnap) => {
                list.push({ id: docSnap.id, ...(docSnap.data() as any) } as ActionItem);
              });
              setActionItems(list);
            }
          });
        }
      },
      (error) => {
        console.warn('Firestore actions onSnapshot error:', error);
      }
    );

    return () => unsubActions();
  }, []);

  // Real-time Fleet Edge Motion Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (fleetEngineRef.current) {
        const updatedBuses = fleetEngineRef.current.stepSimulation();
        setBuses([...updatedBuses]);
      }
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

  // Real-time backend Incident Verification
  const verifyIncident = async (id: string, action: 'VERIFIED' | 'DISMISSED' | 'ESCALATED') => {
    const verifiedBy = `Operator (${userRole.replace('_', ' ').toUpperCase()})`;
    const actionTaken = action === 'VERIFIED' ? 'Dispatched PCR Unit' : action === 'ESCALATED' ? 'Escalated to Cyber Cell' : 'Dismissed False Positive';

    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return { ...inc, status: action, verifiedBy, actionTaken };
      }
      return inc;
    }));

    try {
      const incRef = doc(db, 'incidents', id);
      await updateDoc(incRef, {
        status: action,
        verifiedBy,
        actionTaken,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn(`Firestore incident ${id} update error:`, err);
    }
  };

  // Real-time backend Work Order status update
  const updateActionStatus = async (id: string, newStatus: ActionItem['status']) => {
    const timestamp = new Date().toISOString();

    setActionItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus, updatedAt: timestamp };
      }
      return item;
    }));

    setRoadDefects(defs => defs.map(def => {
      const matchedItem = actionItems.find(i => i.id === id);
      if (matchedItem && (def.code === matchedItem.code || def.id === matchedItem.defectId)) {
        return {
          ...def,
          status: newStatus === 'RESOLVED' ? 'RESOLVED' : newStatus === 'INSPECTION' || newStatus === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'VERIFIED'
        };
      }
      return def;
    }));

    try {
      const actionRef = doc(db, 'actions', id);
      await updateDoc(actionRef, {
        status: newStatus,
        updatedAt: timestamp
      }).catch(async () => {
        const woRef = doc(db, 'workOrders', id);
        await updateDoc(woRef, {
          status: newStatus,
          updatedAt: timestamp
        });
      });

      const targetItem = actionItems.find(i => i.id === id);
      if (targetItem?.defectId) {
        const defRef = doc(db, 'roadDefects', targetItem.defectId);
        await updateDoc(defRef, {
          status: newStatus === 'RESOLVED' ? 'RESOLVED' : newStatus === 'INSPECTION' ? 'IN_PROGRESS' : 'VERIFIED',
          updatedAt: timestamp
        }).catch(async () => {
          const evRef = doc(db, 'events', targetItem.defectId);
          await updateDoc(evRef, {
            status: newStatus === 'RESOLVED' ? 'RESOLVED' : newStatus === 'INSPECTION' ? 'IN_PROGRESS' : 'VERIFIED',
            updatedAt: timestamp
          }).catch(() => {});
        });
      }
    } catch (err) {
      console.warn(`Firestore action ${id} update error:`, err);
    }
  };

  // Real-time backend Bus Coordinates Update
  const updateBusCoordinates = async (busId: string, lat: number, lng: number, speed?: number, heading?: number) => {
    setBuses(prev => prev.map(b => {
      if (b.id === busId) {
        return {
          ...b,
          lat,
          lng,
          speed: speed !== undefined ? speed : b.speed,
          heading: heading !== undefined ? heading : b.heading,
          lastSync: 'Just now'
        };
      }
      return b;
    }));

    try {
      const vehicleRef = doc(db, 'vehicles', busId);
      const busRef = doc(db, 'buses', busId);
      const payload = {
        lat,
        lng,
        ...(speed !== undefined ? { speed } : {}),
        ...(heading !== undefined ? { heading } : {}),
        lastSync: 'Just now',
        updatedAt: new Date().toISOString()
      };
      await updateDoc(vehicleRef, payload).catch(() => updateDoc(busRef, payload));
    } catch (err) {
      console.warn(`Firestore bus ${busId} coordinate update error:`, err);
    }
  };

  // Real-time backend Synthetic Defect / Event Insertion
  const addSyntheticDefect = async (newDef: Partial<RoadDefect>) => {
    const id = `DEF-${Math.floor(10000 + Math.random() * 90000)}`;
    const fullDefect: RoadDefect = {
      id,
      code: `UP-${Math.floor(10000 + Math.random() * 90000)}`,
      type: newDef.type || 'pothole',
      title: newDef.title || 'New Edge Detected Hazard',
      description: newDef.description || 'Automatically captured by mobile bus camera node.',
      address: newDef.address || 'MG Road Urban Corridor, Gurugram',
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
      imageUrl: newDef.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      assignedDept: 'Road Maintenance Dept',
      slaHours: 24
    };

    setRoadDefects(prev => [fullDefect, ...prev]);
    setSelectedDefect(fullDefect);

    try {
      await setDoc(doc(db, 'roadDefects', id), fullDefect);
      await setDoc(doc(db, 'events', id), fullDefect).catch(() => {});
    } catch (err) {
      console.warn(`Firestore defect creation error for ${id}:`, err);
    }
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
        vehicles: buses,
        roadDefects,
        incidents,
        actionItems,
        trafficHotspots,
        alerts,
        aiDetections,
        demoStep,
        setDemoStep,
        isDemoRunning,
        setIsDemoRunning,
        isLoggedIn,
        setIsLoggedIn,
        isFirestoreLive,
        verifyIncident,
        updateActionStatus,
        advanceDemoStep,
        resetDemo,
        addSyntheticDefect,
        updateBusCoordinates
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
