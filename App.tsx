
import React, { useState, useMemo, useEffect } from 'react';
import { 
  UserRole, 
  DashboardTab, 
  ProjectCategory, 
  Project, 
  DashboardStats,
  SidebarView
} from './types';
import { MOCK_PROJECTS } from './mockData';
import { getProjectInsights } from './geminiService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

// UI Components
// Added optional children to Card props to fix TS compilation error (Property 'children' is missing)
const Card = ({ children, className = "", style = {} }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
  <div 
    style={style}
    className={`bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 transition-all hover:shadow-xl ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'In Progress': 'bg-indigo-500 text-white shadow-indigo-200',
    'Completed': 'bg-emerald-500 text-white shadow-emerald-200',
    'Delayed': 'bg-rose-500 text-white shadow-rose-200',
    'Planning': 'bg-amber-500 text-white shadow-amber-200'
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${colors[status] || 'bg-gray-500'}`}>
      {status}
    </span>
  );
};

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.CHAIRMAN);
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.TOTAL_PROJECTS);
  const [sidebarView, setSidebarView] = useState<SidebarView>(SidebarView.OVERALL);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Filter projects based on sidebar view AND active KPI tab
  const filteredProjects = useMemo(() => {
    let base = MOCK_PROJECTS;
    
    // 1. Sidebar Category Filter
    if (sidebarView !== SidebarView.OVERALL) {
      const categoryMap: Record<SidebarView, ProjectCategory | null> = {
        [SidebarView.OVERALL]: null,
        [SidebarView.LAUNCH_VEHICLES]: ProjectCategory.LAUNCH_VEHICLE,
        [SidebarView.SATELLITE_INFRA]: ProjectCategory.SATELLITE_INFRA,
        [SidebarView.USER_FUNDED]: ProjectCategory.USER_FUNDED,
      };
      base = base.filter(p => p.category === categoryMap[sidebarView]);
    }

    // 2. KPI Tab Filter (Dynamic behavior requested)
    // If "Expenditure" is clicked, maybe we show projects with high burn rates or major spending
    // If "Approved Budget" is clicked, we might sort or filter by scale
    if (activeTab === DashboardTab.EXPENDITURE) {
      // Show projects that have significant spending (> 50% budget spent)
      return [...base].sort((a, b) => (b.spentBudget / b.totalBudget) - (a.spentBudget / a.totalBudget));
    } else if (activeTab === DashboardTab.APPROVED_BUDGET) {
      // Show high budget projects first
      return [...base].sort((a, b) => b.totalBudget - a.totalBudget);
    }

    return base;
  }, [sidebarView, activeTab]);

  // Global Agency Stats
  const globalStats: DashboardStats = useMemo(() => {
    return {
      totalProjects: MOCK_PROJECTS.length,
      approvedBudget: MOCK_PROJECTS.reduce((acc, p) => acc + p.totalBudget, 0),
      totalExpenditure: MOCK_PROJECTS.reduce((acc, p) => acc + p.spentBudget, 0),
      activeMissions: MOCK_PROJECTS.filter(p => p.status === 'In Progress').length
    };
  }, []);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoadingInsights(true);
      const insights = await getProjectInsights(filteredProjects);
      setAiInsights(insights);
      setIsLoadingInsights(false);
    };
    fetchInsights();
  }, [sidebarView]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const barChartData = useMemo(() => {
    return filteredProjects.map(p => ({
      name: p.name.length > 12 ? p.name.substring(0, 10) + '..' : p.name,
      budget: p.totalBudget,
      spent: p.spentBudget,
    }));
  }, [filteredProjects]);

  const completionData = useMemo(() => {
    const data = filteredProjects.map(p => ({
      name: p.name,
      progress: p.progress
    }));
    return data;
  }, [filteredProjects]);

  const VIBRANT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex text-slate-900 font-sans">
      {/* Dynamic Vibrant Sidebar */}
      <aside className="w-80 bg-slate-950 border-r border-slate-800 hidden lg:flex flex-col sticky top-0 h-screen z-40 overflow-hidden">
        {/* Animated Glow in Sidebar */}
        <div className="absolute top-0 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="p-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-400 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 rotate-6 transform hover:rotate-12 transition-transform cursor-pointer">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white leading-none">ASTRA</h1>
              <span className="text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase">Mission Command</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 py-6 space-y-3 relative z-10">
          <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 opacity-50">Operational Layers</p>
          
          {[
            { id: SidebarView.OVERALL, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
            { id: SidebarView.LAUNCH_VEHICLES, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /> },
            { id: SidebarView.SATELLITE_INFRA, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 012.5 2.5V14M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
            { id: SidebarView.USER_FUNDED, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSidebarView(item.id as SidebarView)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-black transition-all group ${
                sidebarView === item.id 
                ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <svg className={`w-5 h-5 transition-transform group-hover:scale-110 ${sidebarView === item.id ? 'text-white' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {item.icon}
              </svg>
              {item.id}
            </button>
          ))}
        </nav>

        <div className="p-8 relative z-10">
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-[2rem] p-6">
            <p className="text-[10px] font-black text-indigo-400 mb-4 uppercase tracking-[0.2em]">Authorized Access</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-black">
                {role[0]}
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-xs text-white truncate">{role}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">L-9 Clearance</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/70 backdrop-blur-3xl border-b border-slate-100 sticky top-0 z-30 px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
              {sidebarView}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 ml-5">Agency Performance Telemetry</p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
              {Object.values(UserRole).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    role === r 
                    ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="p-12 space-y-12 max-w-[1800px] mx-auto w-full">
          {/* KPI Cards - The Clickable Triggers */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <button 
              onClick={() => setActiveTab(DashboardTab.TOTAL_PROJECTS)}
              className={`text-left group transition-all duration-500 outline-none ${activeTab === DashboardTab.TOTAL_PROJECTS ? 'scale-105' : 'hover:translate-y-[-5px]'}`}
            >
              <Card className={`border-none ${activeTab === DashboardTab.TOTAL_PROJECTS ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-indigo-200' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-6">
                  <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-colors ${activeTab === DashboardTab.TOTAL_PROJECTS ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  {activeTab === DashboardTab.TOTAL_PROJECTS && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                </div>
                <h3 className={`text-4xl font-black tracking-tighter mb-1`}>{globalStats.totalProjects}</h3>
                <p className={`text-[10px] font-black uppercase tracking-widest ${activeTab === DashboardTab.TOTAL_PROJECTS ? 'text-indigo-200' : 'text-slate-400'}`}>Active Initiatives</p>
              </Card>
            </button>

            <button 
              onClick={() => setActiveTab(DashboardTab.APPROVED_BUDGET)}
              className={`text-left group transition-all duration-500 outline-none ${activeTab === DashboardTab.APPROVED_BUDGET ? 'scale-105' : 'hover:translate-y-[-5px]'}`}
            >
              <Card className={`border-none ${activeTab === DashboardTab.APPROVED_BUDGET ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-200' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-6">
                  <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-colors ${activeTab === DashboardTab.APPROVED_BUDGET ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  {activeTab === DashboardTab.APPROVED_BUDGET && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                </div>
                <h3 className={`text-4xl font-black tracking-tighter mb-1`}>{formatCurrency(globalStats.approvedBudget)}</h3>
                <p className={`text-[10px] font-black uppercase tracking-widest ${activeTab === DashboardTab.APPROVED_BUDGET ? 'text-emerald-100' : 'text-slate-400'}`}>Total Valuation</p>
              </Card>
            </button>

            <button 
              onClick={() => setActiveTab(DashboardTab.EXPENDITURE)}
              className={`text-left group transition-all duration-500 outline-none ${activeTab === DashboardTab.EXPENDITURE ? 'scale-105' : 'hover:translate-y-[-5px]'}`}
            >
              <Card className={`border-none ${activeTab === DashboardTab.EXPENDITURE ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-200' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-6">
                  <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-colors ${activeTab === DashboardTab.EXPENDITURE ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'}`}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  {activeTab === DashboardTab.EXPENDITURE && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                </div>
                <h3 className={`text-4xl font-black tracking-tighter mb-1`}>{formatCurrency(globalStats.totalExpenditure)}</h3>
                <p className={`text-[10px] font-black uppercase tracking-widest ${activeTab === DashboardTab.EXPENDITURE ? 'text-rose-100' : 'text-slate-400'}`}>Funds Consumed</p>
              </Card>
            </button>

            <Card className="border-none bg-gradient-to-br from-slate-800 to-slate-950 text-white">
              <div className="flex justify-between items-center mb-6">
                <div className="w-14 h-14 rounded-[1.25rem] bg-white/10 flex items-center justify-center text-white">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live
                </span>
              </div>
              <h3 className="text-4xl font-black tracking-tighter mb-1">{globalStats.activeMissions}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mission-In-Progress</p>
            </Card>
          </div>

          {/* Visualization Layer */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <div>
                   <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Resource Dynamics</h4>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Allocation vs. Actuals</p>
                </div>
                <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-slate-500">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-md bg-indigo-600"></div> Approved</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-md bg-emerald-500"></div> Spent</div>
                </div>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} barGap={15}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 900, textTransform: 'uppercase'}} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000000}M`} tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '24px' }}
                      itemStyle={{fontSize: '11px', fontWeight: 900, textTransform: 'uppercase'}}
                    />
                    <Bar dataKey="budget" name="Approved" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                    <Bar dataKey="spent" name="Spent" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="overflow-hidden">
               <div className="flex items-center justify-between mb-10">
                <div>
                   <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Mission Readiness</h4>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Readiness Percentage by Initiative</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={completionData}>
                    <defs>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" hide />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} unit="%" />
                    <Tooltip 
                       contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '24px' }}
                    />
                    <Area type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorProgress)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Dynamic Records View - Updates on Tab/Sidebar change */}
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Registry Logs</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Viewing projects related to {activeTab}</p>
              </div>
              <div className="bg-white border border-slate-100 p-2 rounded-2xl flex items-center gap-3">
                 <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h13M3 12h10" /></svg>
                 </button>
                 <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200">
                    Export Registry
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {filteredProjects.map((project, idx) => (
                <div 
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white rounded-[3rem] border border-slate-100 p-10 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-3 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full"
                >
                  {/* Category Accent Decoration */}
                  <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-[4rem] group-hover:opacity-20 transition-all ${
                    project.category === ProjectCategory.LAUNCH_VEHICLE ? 'bg-indigo-600' :
                    project.category === ProjectCategory.SATELLITE_INFRA ? 'bg-emerald-600' :
                    'bg-amber-600'
                  }`}></div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-10">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 ${
                        project.category === ProjectCategory.LAUNCH_VEHICLE ? 'bg-indigo-50 text-indigo-600 shadow-indigo-100' :
                        project.category === ProjectCategory.SATELLITE_INFRA ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100' :
                        'bg-amber-50 text-amber-600 shadow-amber-100'
                      } shadow-lg`}>
                         {project.category === ProjectCategory.LAUNCH_VEHICLE && <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                         {project.category === ProjectCategory.SATELLITE_INFRA && <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 012.5 2.5V14M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                         {project.category === ProjectCategory.USER_FUNDED && <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      </div>
                      <Badge status={project.status} />
                    </div>
                    
                    <div className="mb-10 flex-1">
                      <h5 className="font-black text-slate-800 text-3xl group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tighter mb-2">{project.name}</h5>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{project.id}</p>
                    </div>

                    <div className="space-y-4 mb-10">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                        <span>Readiness</span>
                        <span className="text-slate-900">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-50">
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.1em] mb-2 ${activeTab === DashboardTab.EXPENDITURE ? 'text-rose-500' : 'text-slate-400'}`}>Funds Spent</p>
                        <p className="font-black text-slate-900 text-xl tracking-tighter">{formatCurrency(project.spentBudget)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-black uppercase tracking-[0.1em] mb-2 ${activeTab === DashboardTab.APPROVED_BUDGET ? 'text-indigo-600' : 'text-slate-400'}`}>Budget Cap</p>
                        <p className="font-black text-slate-900 text-xl tracking-tighter">{formatCurrency(project.totalBudget)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/60 backdrop-blur-2xl transition-all">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-modal">
            <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-indigo-600 border border-slate-100 shadow-sm">
                   <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">{selectedProject.name}</h3>
                  <div className="flex items-center gap-4 text-xs font-black text-slate-400">
                    <span className="uppercase tracking-[0.3em]">{selectedProject.id}</span>
                    <div className="h-4 w-px bg-slate-200"></div>
                    <span className="text-indigo-600 uppercase tracking-widest">{selectedProject.category}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="w-16 h-16 flex items-center justify-center hover:bg-slate-50 rounded-full text-slate-200 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 active:scale-90"
              >
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 space-y-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-12">
                  <div>
                    <h4 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-6">Mission Objective</h4>
                    <p className="text-slate-600 leading-relaxed text-xl font-medium">{selectedProject.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Division Chief</p>
                      <p className="text-sm font-black text-slate-900 uppercase">{selectedProject.director}</p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Inception</p>
                      <p className="text-sm font-black text-slate-900 uppercase">{selectedProject.startDate}</p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Projection</p>
                      <p className="text-sm font-black text-slate-900 uppercase">{selectedProject.endDate}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-950 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-3xl">
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                     <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="relative w-48 h-48 mb-10">
                       <svg className="w-full h-full rotate-[-90deg]">
                          <circle cx="96" cy="96" r="88" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
                          <circle 
                            cx="96" cy="96" r="88" fill="none" stroke="#6366f1" strokeWidth="16" 
                            strokeDasharray={552} 
                            strokeDashoffset={552 * (1 - selectedProject.progress / 100)}
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                          />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black">{selectedProject.progress}%</span>
                       </div>
                    </div>
                    <h4 className="font-black text-[12px] mb-2 uppercase tracking-[0.3em] text-indigo-400">Current Phase</h4>
                    <p className="text-sm text-slate-400 font-bold mb-10">System Synchronicity: Active</p>
                    <Badge status={selectedProject.status} />
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em]">Audit Ledger</h4>
                  <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2 text-emerald-500">
                       <div className="w-3 h-3 rounded-md bg-emerald-500 shadow-lg shadow-emerald-200"></div> Nominal
                    </div>
                    <div className="flex items-center gap-2 text-rose-500">
                       <div className="w-3 h-3 rounded-md bg-rose-500 shadow-lg shadow-rose-200"></div> Critical
                    </div>
                  </div>
                </div>
                <div className="border border-slate-100 rounded-[3rem] overflow-hidden bg-white shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-12 py-8 text-[12px] font-black text-slate-500 uppercase tracking-widest">Component</th>
                        <th className="px-12 py-8 text-[12px] font-black text-slate-500 uppercase tracking-widest text-right">Allocation</th>
                        <th className="px-12 py-8 text-[12px] font-black text-slate-500 uppercase tracking-widest text-right">Consumed</th>
                        <th className="px-12 py-8 text-[12px] font-black text-slate-500 uppercase tracking-widest text-center">Efficiency Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedProject.breakup.map((item, idx) => {
                        const usagePerc = (item.spent / item.allocated) * 100;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-12 py-8">
                              <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{item.category}</p>
                            </td>
                            <td className="px-12 py-8 text-sm text-right font-black text-slate-900">{formatCurrency(item.allocated)}</td>
                            <td className="px-12 py-8 text-sm text-right font-black text-indigo-600">{formatCurrency(item.spent)}</td>
                            <td className="px-12 py-8">
                              <div className="flex items-center justify-center gap-6 max-w-[250px] mx-auto">
                                <div className="flex-1 bg-slate-100 rounded-full h-3">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${usagePerc > 90 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} 
                                    style={{ width: `${Math.min(usagePerc, 100)}%` }}
                                  ></div>
                                </div>
                                <span className={`text-[12px] font-black w-10 ${usagePerc > 90 ? 'text-rose-600' : 'text-slate-500'}`}>{Math.round(usagePerc)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="px-12 py-10 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-8">
              <button 
                onClick={() => setSelectedProject(null)}
                className="px-12 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
              >
                Exit Command
              </button>
              <button className="px-12 py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95">
                Dispatch Status Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Meta */}
      <div className="fixed bottom-8 right-12 z-20 pointer-events-none">
        <div className="bg-slate-950 text-white px-8 py-4 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5 flex items-center gap-4">
           <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
           <p className="text-[11px] font-black uppercase tracking-[0.3em]">Command Terminal V.2.5.0 • ENCRYPTED</p>
        </div>
      </div>

      <style>{`
        @keyframes modal {
          from { opacity: 0; transform: scale(0.9) translateY(40px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal {
          animation: modal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default App;
