import { useState, useEffect } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { GlassLoader } from '../../components/GlassLoader';

interface Repayment {
    id: string;
    loan_id: string;
    amount: number;
    due_date: string;
    status: 'PENDING' | 'PAID' | 'BOUNCED';
}

export default function Repayments() {
    const navigate = useNavigate();
    const [repayments, setRepayments] = useState<Repayment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRepayments() {
            try {
                const { data } = await api.get('/loans/user/repayments');
                setRepayments(data.repayments || []);
            } catch (error) {
                console.error("Failed to fetch repayments:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRepayments();
    }, []);


    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'BOUNCED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full pb-12">

            {/* Floating Minimalist Header Area */}
            <div className="px-6 pt-12 pb-8 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100/50 active:scale-95 transition-all">
                    <ArrowLeft size={24} strokeWidth={3} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tighter">Activity</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div> Payment Timeline
                    </p>
                </div>
            </div>

            {loading ? (
                <GlassLoader />
            ) : repayments.length === 0 ? (
                <div className="text-center py-16 text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-sm px-6 mx-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                        <FileText size={28} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-800">No history yet</p>
                    <p className="text-xs mt-1 text-slate-400">Your EMI payments will appear here.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 px-4">
                    {repayments.map((emi, idx) => (
                        <div key={emi.id} style={{ animationDelay: `${idx * 80}ms` }} className="glass-card p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${emi.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                                        emi.status === 'BOUNCED' ? 'bg-red-50 text-red-600 border-red-100/50' : 'bg-amber-50 text-amber-600 border-amber-100/50'
                                        }`}>
                                        <FileText size={18} />
                                    </div>
                                    <span className="font-bold text-[14px] text-slate-800 block leading-tight">EMI Payment</span>
                                </div>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider border ${getStatusStyle(emi.status)}`}>
                                    {emi.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Amount Paid</p>
                                    <span className="font-black text-xl text-slate-800 tracking-tighter">₹{emi.amount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Due Date</p>
                                    <span className="font-black text-slate-700 text-[13px] tracking-tight">{new Date(emi.due_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
