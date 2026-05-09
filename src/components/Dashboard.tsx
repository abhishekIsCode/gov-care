/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Activity, 
  Settings, 
  LogOut, 
  Search, 
  Plus, 
  Bell,
  Clock,
  ChevronRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './FirebaseProvider';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'appointments'>('overview');
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const patientsQuery = query(collection(db, 'patients'), limit(10));
    const unsubPatients = onSnapshot(patientsQuery, (snapshot) => {
      setPatientsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'patients');
    });

    const appointmentsQuery = query(collection(db, 'appointments'), orderBy('appointmentTime', 'asc'), limit(5));
    const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      setAppointmentsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'appointments');
    });

    return () => {
      unsubPatients();
      unsubAppointments();
    };
  }, [user]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Use real data if available, fallback to mock for demo feel if empty
  const displayPatients = patientsList.length > 0 ? patientsList : [
    { id: '1', name: 'Alice Freeman', age: 28, condition: 'General Checkup', status: 'In Queue', time: '09:00 AM' },
    { id: '2', name: 'Robert Fox', age: 45, condition: 'Hypertension', status: 'In Progress', time: '09:30 AM' },
    { id: '3', name: 'Jane Cooper', age: 34, condition: 'Diabetes Type 2', status: 'Scheduled', time: '11:00 AM' },
    { id: '4', name: 'Wade Warren', age: 52, condition: 'Post-op Recovery', status: 'Scheduled', time: '01:30 PM' },
  ];

  const stats = [
    { label: 'Total Patients', value: patientsList.length > 0 ? patientsList.length : '1,240', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Appointments Today', value: appointmentsList.length > 0 ? appointmentsList.length : '42', change: '+5%', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg. Consultation', value: '18m', change: '-2m', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Health Score', value: '94%', change: '+1%', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-right border-slate-200 flex flex-col z-30">
        <div className="p-6 flex items-center gap-3">
          <Activity className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
          <div>
            <h1 className="font-serif text-xl font-bold text-slate-800 leading-none">GovCare</h1>
            <p className="text-[10px] text-emerald-800/60 font-bold tracking-widest uppercase mt-1">Provider Edition</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavItem 
            icon={Activity} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <NavItem 
            icon={Users} 
            label="Patients" 
            active={activeTab === 'patients'} 
            onClick={() => setActiveTab('patients')} 
          />
          <NavItem 
            icon={Calendar} 
            label="Appointments" 
            active={activeTab === 'appointments'} 
            onClick={() => setActiveTab('appointments')} 
          />
          <NavItem 
            icon={Stethoscope} 
            label="Medical Reports" 
          />
          <NavItem 
            icon={Settings} 
            label="Settings" 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-20">
          <div className="relative w-96">
            <Search className="absolute left-3 inset-y-0 my-auto text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search patients, records..." 
              className="w-full bg-slate-50 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800/10 transition-all border border-slate-200/50"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-600 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{profile?.name || user?.displayName || 'Dr. Smith'}</p>
                <p className="text-xs text-slate-500 font-medium">{profile?.specialty || 'General Practice'}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} alt="Avatar" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-800">Welcome Back, {profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Doctor'}</h2>
              <p className="text-slate-500 text-sm mt-1">You have {appointmentsList.length || 12} appointments remaining today.</p>
            </div>
            <button className="bg-emerald-800 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-800/20 flex items-center gap-2 font-bold text-sm tracking-wide hover:bg-emerald-900 transition-all">
              <Plus className="w-5 h-5" />
              NEW APPOINTMENT
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-2xl", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-lg", 
                    stat.change.startsWith('+') ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  )}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Patients */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-bold text-slate-800">Todays Patients</h3>
                <button className="text-emerald-800 text-sm font-bold flex items-center gap-1 hover:underline">
                  View Schedule <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-white rounded-[32px] border border-slate-200/60 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-bottom border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Condition</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {displayPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-50/80 transition-all cursor-pointer">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500 text-xs">
                              {patient.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                              <p className="text-xs text-slate-500">{patient.age} years</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-600 font-medium">{patient.condition}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-600 font-medium">{patient.time || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            (patient.status === 'In Queue' || patient.status === 'scheduled') && "bg-amber-50 text-amber-600",
                            (patient.status === 'In Progress' || patient.status === 'in-progress') && "bg-emerald-50 text-emerald-600",
                            (patient.status === 'Scheduled' || patient.status === 'completed') && "bg-blue-50 text-blue-600",
                          )}>
                            {patient.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <button className="text-slate-400 hover:text-emerald-800">
                            <Search className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calendar / Notifications */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold text-slate-800">Upcoming Events</h3>
              <div className="bg-emerald-900 rounded-[32px] p-6 text-white overflow-hidden relative shadow-xl shadow-emerald-900/40">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Medical Conference</p>
                  <h4 className="text-2xl font-serif font-bold mt-2">Cardiovascular Summit 2024</h4>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 text-center min-w-[60px]">
                      <p className="text-xl font-bold leading-none">12</p>
                      <p className="text-[10px] uppercase font-bold mt-1 opacity-80">May</p>
                    </div>
                    <p className="text-sm font-medium leading-tight">Join top specialists for a 3-day deep dive into modern surgery techniques.</p>
                  </div>
                  <button className="w-full bg-white text-emerald-900 font-bold py-3 rounded-xl mt-8 text-sm tracking-wide">
                    VIEW DETAILS
                  </button>
                </div>
                {/* Decorative svg patterns */}
                <svg className="absolute bottom-0 right-0 w-48 h-48 opacity-10 translate-x-10 translate-y-10" viewBox="0 0 100 100" fill="currentColor">
                  <circle cx="50" cy="50" r="50" />
                </svg>
              </div>

              <div className="bg-white rounded-[32px] p-6 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-slate-800">Quick Tools</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ToolButton icon={ShieldCheck} label="Verify ID" />
                  <ToolButton icon={Users} label="Refer Patient" />
                  <ToolButton icon={Calendar} label="Update Slot" />
                  <ToolButton icon={ Bell } label="Send Alert" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm",
        active 
          ? "bg-emerald-800 text-white shadow-lg shadow-emerald-800/20" 
          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
      )}
    >
      <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
      {label}
    </button>
  );
}

function ToolButton({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 hover:text-emerald-800 transition-all border border-transparent hover:border-emerald-200 gap-2">
      <Icon className="w-5 h-5 opacity-60" />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
