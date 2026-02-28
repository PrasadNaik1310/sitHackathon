import { ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, User, Bell, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BusinessService } from '../../services/business.service';
import { useApp } from '../../context/AppContext';
import { GlassLoader } from '../../components/GlassLoader';

interface ActivityItem {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    amount: number;
    date: string;
}

interface DashboardData {
    available_limit: number;
    credit_score: number;
    risk_grade: string;
    active_loans_total: number;
    next_emi_amount: number | null;
    next_emi_date: string | null;
    recent_activity: ActivityItem[];
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { profile } = useApp();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const dashboardData = await BusinessService.getDashboard();
                setData(dashboardData);
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        }
        loadDashboard();
    }, []);

    const creditScore = data?.credit_score || 0;
    const availableLimit = data?.available_limit || 0;
    const nextEmiAmount = data?.next_emi_amount;

    if (loading && !data) {
        return (
            <div className="flex flex-col min-h-screen bg-[#0a0f0d] items-center justify-center">
                <GlassLoader />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-transparent relative overflow-hidden font-body animate-in fade-in duration-1000 pb-32">
            {/* Ambient Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-slate-900/20 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Dashboard Container */}
            <div className="flex flex-col relative z-10 w-full max-w-lg mx-auto">

                {/* Minimalist Identity Bar */}
                <div className="px-8 pt-12 pb-6 flex justify-between items-center bg-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/5 flex items-center justify-center text-slate-400 shadow-2xl">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-2">Verified Merchant</p>
                            <h2 className="text-2xl font-black text-white tracking-tight leading-none font-heading">{profile?.business_name || 'Corporate Account'}</h2>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/5 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-white/10 transition-colors shadow-2xl">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0a0f0d]"></span>
                        </div>
                    </div>
                </div>

                {/* Integrated Stats Area - Dark Glass */}
                <div className="px-8 mb-10">
                    <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900/20 backdrop-blur-3xl rounded-[3.5rem] p-10 text-white border border-white/10 shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>

                        <div className="relative z-10">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Available Credit</p>
                            <div className="flex items-end gap-3 mb-10">
                                <h1 className="text-5xl font-black tracking-tighter leading-none text-white">₹{availableLimit.toLocaleString('en-IN')}</h1>
                                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Active</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                                <div className="p-6 bg-white/[0.03] rounded-[2rem] border border-white/5">
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none mb-3">Trust Score</p>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                        <p className="text-xl font-black tracking-tight text-white">{creditScore}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-white/[0.03] rounded-[2rem] border border-white/5">
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none mb-3">Utilized</p>
                                    <div className="flex items-center gap-2.5">
                                        <ArrowUpRight size={18} className="text-emerald-500/50" />
                                        <p className="text-xl font-black tracking-tight text-white">₹{data?.active_loans_total.toLocaleString('en-IN') || '0'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Management Section */}
                <div className="px-8 space-y-10">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-heading mb-6">Strategic Hub</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => navigate('/app/invoices')}
                                className="bg-white/[0.03] backdrop-blur-xl p-7 rounded-[2.5rem] border border-white/5 shadow-2xl hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white/5 text-slate-300 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                    <Zap size={24} />
                                </div>
                                <h4 className="font-black text-white text-lg tracking-tight leading-tight mb-1">Discount</h4>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Invoices</p>
                            </div>

                            <div
                                onClick={() => navigate('/app/loans')}
                                className="bg-white/[0.03] backdrop-blur-xl p-7 rounded-[2.5rem] border border-white/5 shadow-2xl hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white/5 text-slate-300 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                    <ShieldCheck size={24} />
                                </div>
                                <h4 className="font-black text-white text-lg tracking-tight leading-tight mb-1">Sanction</h4>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Credit Line</p>
                            </div>
                        </div>
                    </div>

                    {/* EMI Alert */}
                    {nextEmiAmount && (
                        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-7 border border-white/5 shadow-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Next Settlement</p>
                                    <h4 className="text-xl font-black text-white tracking-tight leading-none">₹{nextEmiAmount.toLocaleString('en-IN')}</h4>
                                </div>
                            </div>
                            <button className="h-12 px-6 bg-emerald-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95">PAY NOW</button>
                        </div>
                    )}

                    {/* History */}
                    <div>
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-heading">Ledger History</h3>
                            <button onClick={() => navigate('/app/repayments')} className="text-emerald-500 font-black text-[9px] uppercase tracking-widest hover:text-emerald-400 transition-colors">View All</button>
                        </div>
                        <div className="space-y-4">
                            {data?.recent_activity?.length === 0 ? (
                                <div className="p-12 text-center bg-white/[0.02] rounded-[2.5rem] border border-white/5">
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">No ledger entries</p>
                                </div>
                            ) : (
                                data?.recent_activity.slice(0, 3).map((activity) => (
                                    <div key={activity.id} className="bg-white/[0.02] p-6 rounded-[2.5rem] border border-white/5 shadow-sm flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner ${activity.type === 'LOAN_DISBURSED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>
                                                {activity.type === 'LOAN_DISBURSED' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                            </div>
                                            <div>
                                                <h5 className="font-black text-white text-[15px] tracking-tight leading-none mb-1.5">{activity.title}</h5>
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{new Date(activity.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className={`font-black tracking-tighter text-lg ${activity.type === 'LOAN_DISBURSED' ? 'text-emerald-500' : 'text-white'}`}>
                                            {activity.type === 'LOAN_DISBURSED' ? '+' : '-'}₹{activity.amount.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
