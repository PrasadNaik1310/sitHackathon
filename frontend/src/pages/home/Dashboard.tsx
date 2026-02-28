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
            <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center">
                <GlassLoader />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-hidden font-body animate-in fade-in duration-1000 pb-24">
            {/* Decorative Silent Blobs */}
            <div className="bg-blob blob-1 opacity-40"></div>
            <div className="bg-blob blob-2 opacity-20"></div>

            {/* Dashboard Container */}
            <div className="flex flex-col relative z-10 w-full max-w-lg mx-auto">

                {/* Minimalist Identity Bar */}
                <div className="px-8 pt-12 pb-6 flex justify-between items-center bg-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100/50">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-2 opacity-60">Verified Business</p>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none font-heading">{profile?.business_name || 'Corporate Account'}</h2>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100/50 cursor-pointer hover:bg-slate-50 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-800 rounded-full border-2 border-white"></span>
                        </div>
                    </div>
                </div>

                {/* Integrated Stats Area - Bento Style - Silent */}
                <div className="px-8 mb-10">
                    <div className="phonepe-gradient rounded-[3.5rem] p-10 text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden group">
                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-slate-400/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>

                        <div className="relative z-10">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-40">Total Credit Line</p>
                            <div className="flex items-end gap-3 mb-10">
                                <h1 className="text-5xl font-black tracking-tighter leading-none">₹{availableLimit.toLocaleString('en-IN')}</h1>
                                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Available</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                                <div className="p-6 bg-white/5 rounded-[2rem] backdrop-blur-md border border-white/5">
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none mb-3 opacity-40">Trust Score</p>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm animate-pulse"></div>
                                        <p className="text-xl font-black tracking-tight">{creditScore}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-white/5 rounded-[2rem] backdrop-blur-md border border-white/5">
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none mb-3 opacity-40">Utilized Assets</p>
                                    <div className="flex items-center gap-2.5">
                                        <ArrowUpRight size={18} className="text-slate-500" />
                                        <p className="text-xl font-black tracking-tight">₹{data?.active_loans_total.toLocaleString('en-IN') || '0'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Management Section - Silent Labels */}
                <div className="px-8 space-y-10">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] font-heading mb-6 opacity-50">Operational Hub</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => navigate('/invoices')}
                                className="bg-white p-7 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-800 flex items-center justify-center mb-6 group-hover:bg-emerald-50 group-hover:text-emerald-900 transition-colors">
                                    <Zap size={24} />
                                </div>
                                <h4 className="font-black text-slate-800 text-lg tracking-tight leading-tight mb-1">Discount</h4>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Invoices</p>
                            </div>

                            <div
                                onClick={() => navigate('/loans')}
                                className="bg-white p-7 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-800 flex items-center justify-center mb-6 group-hover:bg-slate-100 transition-colors">
                                    <ShieldCheck size={24} />
                                </div>
                                <h4 className="font-black text-slate-800 text-lg tracking-tight leading-tight mb-1">Sanction</h4>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Credit Line</p>
                            </div>
                        </div>
                    </div>

                    {/* EMI Alert - Professional Muted */}
                    {nextEmiAmount && (
                        <div className="bg-white rounded-[2.5rem] p-7 border border-slate-50 shadow-sm flex items-center justify-between group">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-slate-50 text-slate-700 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-900 transition-colors">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5 opacity-60">Next Payment</p>
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none">₹{nextEmiAmount.toLocaleString('en-IN')}</h4>
                                </div>
                            </div>
                            <button className="h-12 px-6 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-900 transition-all">PAY</button>
                        </div>
                    )}

                    {/* History - Simple List */}
                    <div>
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] font-heading opacity-50">Timeline</h3>
                            <button onClick={() => navigate('/repayments')} className="text-slate-800 font-black text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity">Full History</button>
                        </div>
                        <div className="space-y-4">
                            {data?.recent_activity?.length === 0 ? (
                                <div className="p-12 text-center bg-white rounded-[2.5rem] border border-slate-50">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No activity recorded</p>
                                </div>
                            ) : (
                                data?.recent_activity.slice(0, 3).map((activity) => (
                                    <div key={activity.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-50 shadow-inner ${activity.type === 'LOAN_DISBURSED' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'}`}>
                                                {activity.type === 'LOAN_DISBURSED' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-800 text-[15px] tracking-tight leading-none mb-1.5">{activity.title}</h5>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-60">{new Date(activity.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className={`font-black tracking-tighter text-lg ${activity.type === 'LOAN_DISBURSED' ? 'text-emerald-800' : 'text-slate-800'}`}>
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
