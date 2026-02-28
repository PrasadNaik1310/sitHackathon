import { useState, useEffect } from 'react';
import {
    FileText,
    ChevronLeft,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InvoiceService } from '../../services/invoice.service';
import { GlassLoader } from '../../components/GlassLoader';

interface Invoice {
    id: string;
    invoice_number: string;
    counterparty_name: string;
    amount: number;
    due_date: string;
    status: 'PAID' | 'PENDING' | 'OVERDUE' | 'DISCOUNTED';
}

export default function Invoices() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'discounted'>('all');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInvoices = async () => {
            try {
                const data = await InvoiceService.getMyInvoices();
                const mappedData = data.map((inv: any) => ({
                    id: inv.id,
                    invoice_number: inv.invoice_number,
                    counterparty_name: inv.buyer_name || inv.counterparty_name || 'B2B Partner',
                    amount: inv.amount,
                    due_date: inv.due_date,
                    status: inv.status
                }));
                setInvoices(mappedData);
            } catch (error) {
                console.error("Failed to load invoices", error);
            } finally {
                setLoading(false);
            }
        };

        loadInvoices();
    }, []);

    const filteredInvoices = invoices.filter(invoice => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return invoice.status === 'PENDING' || invoice.status === 'OVERDUE';
        if (activeTab === 'discounted') return invoice.status === 'DISCOUNTED' || invoice.status === 'PAID';
        return true;
    });

    const handleInvoiceClick = (id: string, status: string) => {
        if (status === 'PENDING' || status === 'OVERDUE') {
            navigate(`/loans?invoice_id=${id}`);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-transparent relative overflow-hidden font-body animate-in fade-in duration-1000 pb-32">
            {/* Ambient Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[40%] bg-slate-900/20 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header Area */}
            <div className="px-8 pt-12 pb-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-3xl bg-black/20 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 active:scale-95 transition-all shadow-2xl">
                        <ChevronLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tighter font-heading leading-none uppercase">Invoices</h1>
                        <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Active Receivables</p>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 border border-white/5">
                    <FileText size={20} />
                </div>
            </div>

            <div className="px-8 mt-10 relative z-10">
                <div className="mb-12">
                    <h2 className="text-3xl font-black text-white tracking-tighter leading-tight font-heading mb-3">Convert Assets to <span className="text-emerald-500">Liquidity</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Select active bills to initiate discounting</p>
                </div>

                {/* Silent Tabs */}
                <div className="flex bg-white/5 backdrop-blur-xl p-2 rounded-[2.5rem] mb-12 border border-white/5 shadow-3xl">
                    {(['all', 'pending', 'discounted'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-[1.8rem] transition-all ${activeTab === t
                                ? 'bg-emerald-800 text-white shadow-xl shadow-emerald-900/20'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* List Container */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="py-24 flex justify-center"><GlassLoader /></div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="py-24 text-center bg-white/[0.02] rounded-[3rem] border border-white/5 shadow-2xl">
                            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-inner">
                                <FileText size={32} className="text-slate-700" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 font-heading tracking-tight">No Bills Found</h3>
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest max-w-[200px] mx-auto">Your discounting activity will appear here.</p>
                        </div>
                    ) : (
                        filteredInvoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                onClick={() => handleInvoiceClick(invoice.id, invoice.status)}
                                className="bg-white/[0.03] backdrop-blur-xl rounded-[2.8rem] p-8 border border-white/5 shadow-2xl hover:bg-white/[0.05] transition-all duration-500 cursor-pointer group animate-in zoom-in-95 duration-300"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-colors ${invoice.status === 'PENDING' || invoice.status === 'OVERDUE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-slate-600 border-white/5'}`}>
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-lg tracking-tight font-heading leading-tight mb-1">Ref #{invoice.invoice_number}</h4>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">{invoice.counterparty_name}</p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border ${invoice.status === 'PAID' || invoice.status === 'DISCOUNTED'
                                        ? 'bg-white/5 text-slate-500 border-white/5'
                                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        }`}>
                                        {invoice.status}
                                    </div>
                                </div>

                                <div className="flex justify-between items-end pt-8 border-t border-white/5">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">Invoice Amount</p>
                                        <p className="text-3xl font-black text-white tracking-tighter">₹{invoice.amount.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 text-right">
                                        {(invoice.status === 'PENDING' || invoice.status === 'OVERDUE') && (
                                            <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                                                Buy Offers <ArrowRight size={14} strokeWidth={4} />
                                            </span>
                                        )}
                                        <div className="flex flex-col items-end">
                                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest leading-none mb-1">Due Date</p>
                                            <p className="text-[11px] font-black text-slate-400 tracking-tight">{new Date(invoice.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
