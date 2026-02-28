import { useState, useEffect } from 'react';
import { User, LogOut, FileText, ChevronRight, Activity, Bell, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BusinessService } from '../../services/business.service';

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        BusinessService.getProfile().then(setProfile).catch(console.error);
    }, []);

    const handleLogout = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate('/login');
        }, 800);
    };

    return (
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full pb-12">
            {/* Floating Minimalist Header Area */}
            <div className="px-6 pt-12 pb-8 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100/50 active:scale-95 transition-all">
                    <ChevronRight className="rotate-180" size={24} strokeWidth={3} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tighter">Account</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span> Merchant Profile
                    </p>
                </div>
            </div>

            {/* User Info Card */}
            <div className="px-6">
                <div className="glass-card p-8 flex flex-col items-center bg-white shadow-xl shadow-emerald-900/5 border-emerald-50/50">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-primary-color mb-6 shadow-inner border border-emerald-100/50 relative">
                        <User size={40} className="text-emerald-600" />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                            <ShieldCheck size={16} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Verified Business</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">GSTIN: {profile?.gst_number || 'Loading...'}</p>
                    <div className="mt-6 px-4 py-2 bg-slate-50 text-slate-500 text-[10px] font-black rounded-xl uppercase tracking-widest border border-slate-100 shadow-sm">
                        PAN: {profile?.pan_number || 'Loading...'}
                    </div>
                </div>
            </div>

            {/* Settings Menu */}
            <div className="px-6 mt-10">
                <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
                    <div onClick={() => navigate('/repayments')} className="flex items-center justify-between p-5 border-b border-slate-50 hover:bg-emerald-50/30 transition cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50 transition-transform group-hover:scale-105">
                                <FileText size={20} />
                            </div>
                            <span className="font-black text-slate-700 text-[15px] tracking-tight">Repayment History</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 mr-2" />
                    </div>

                    <div onClick={() => navigate('/credit-score')} className="flex items-center justify-between p-5 border-b border-slate-50 hover:bg-emerald-50/30 transition cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50 transition-transform group-hover:scale-105">
                                <Activity size={20} />
                            </div>
                            <span className="font-black text-slate-700 text-[15px] tracking-tight">Credit Score Details</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 mr-2" />
                    </div>

                    <div onClick={() => alert('All notifications are currently routed to your verified email address.')} className="flex items-center justify-between p-5 hover:bg-emerald-50/30 transition cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50 transition-transform group-hover:scale-105">
                                <Bell size={20} />
                            </div>
                            <span className="font-black text-slate-700 text-[15px] tracking-tight">Notifications</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 mr-2" />
                    </div>
                </div>
            </div>

            {/* Logout */}
            <div className="px-6 mt-10">
                <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full bg-slate-50 p-5 flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-50 transition border border-red-100/20 rounded-[2rem] shadow-inner"
                >
                    {loading ? 'Logging out...' : (
                        <>
                            <LogOut size={20} strokeWidth={3} /> Logout Account
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
