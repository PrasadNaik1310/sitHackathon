import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ShieldCheck,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    Zap,
    Clock
} from 'lucide-react';
import { LoanService } from '../../services/loan.service';
import { GlassLoader } from '../../components/GlassLoader';

type LoanStep = 'review' | 'kyc_confirm' | 'sign' | 'success';

interface Offer {
    id: string;
    invoice_id: string;
    business_id: string;
    amount: number;
    interest_rate: number;
    tenure_days: number;
    platform_fee: number;
    status: string;
}

interface Loan {
    id: string;
    amount: number;
    status: string;
    created_at: string;
}

export default function Loans() {
    const [searchParams] = useSearchParams();
    const invoiceId = searchParams.get('invoice_id');
    const navigate = useNavigate();

    const [step, setStep] = useState<LoanStep>('review');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [offer, setOffer] = useState<Offer | null>(null);
    const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
    const [activeOffers, setActiveOffers] = useState<Offer[]>([]);

    useEffect(() => {
        async function fetchInitialData() {
            try {
                if (invoiceId) {
                    const offerData = await LoanService.getOfferForInvoice(invoiceId);
                    setOffer(offerData);
                } else {
                    const [loansData, offersData] = await Promise.all([
                        LoanService.getMyLoans(),
                        LoanService.getMyOffers()
                    ]);
                    setActiveLoans(loansData);
                    setActiveOffers(offersData);
                }
            } catch (err: any) {
                console.error("Failed to load loan data:", err);
                setError(err.response?.data?.detail || "Failed to load loan details.");
            } finally {
                setInitialLoading(false);
            }
        }

        fetchInitialData();
    }, [invoiceId]);

    const handleNext = async (next: LoanStep) => {
        setLoading(true);
        setError('');
        try {
            if (next === 'success' && offer?.id) {
                await LoanService.acceptOffer(offer.id);
            }
            if (next !== 'success') {
                await new Promise(r => setTimeout(r, 1200));
            }
            setStep(next);
            if (next === 'success') {
                setTimeout(() => navigate('/dashboard'), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "An error occurred during processing.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-[#0a0f0d] items-center justify-center">
                <GlassLoader />
                <p className="mt-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] animate-pulse">Initializing Credit Portal</p>
            </div>
        );
    }

    // LIST VIEW
    if (!invoiceId) {
        return (
            <div className="flex flex-col min-h-screen bg-transparent relative overflow-hidden font-body animate-in fade-in duration-1000 pb-32">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="px-8 pt-12 pb-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-3xl bg-black/20 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 active:scale-95 transition-all shadow-2xl">
                            <ArrowLeft size={22} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tighter font-heading leading-none uppercase">Credit</h1>
                            <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Capital Management</p>
                        </div>
                    </div>
                </div>

                <div className="px-8 mt-10 relative z-10">
                    <div className="mb-12">
                        <h2 className="text-3xl font-black text-white tracking-tighter leading-tight font-heading mb-3">Sanctioned <span className="text-emerald-500">Funds</span></h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Active and pending credit facilities</p>
                    </div>

                    <div className="space-y-6">
                        {activeOffers.map((off) => (
                            <div key={off.id} onClick={() => navigate(`/app/loans?invoice_id=${off.invoice_id}`)} className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.8rem] border border-white/5 shadow-2xl hover:bg-white/[0.05] transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-lg tracking-tight mb-1 leading-none uppercase">Offer Active</h4>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none">Invoice #{off.invoice_id.substring(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-500/20">Action Required</div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Approved</p>
                                    <p className="text-2xl font-black text-emerald-500 tracking-tighter leading-none">₹{off.amount.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}

                        {activeLoans.map((loan) => (
                            <div key={loan.id} className="bg-white/[0.02] p-8 rounded-[2.8rem] border border-white/5 shadow-2xl">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-500 flex items-center justify-center border border-white/5">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-400 text-lg tracking-tight mb-1 leading-none uppercase">Sanctioned</h4>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none">ID #{loan.id.substring(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1.5 bg-white/5 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/5">{loan.status}</div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Disbursed</p>
                                    <p className="text-2xl font-black text-white tracking-tighter leading-none">₹{loan.amount.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}

                        {activeLoans.length === 0 && activeOffers.length === 0 && (
                            <div className="py-24 text-center bg-white/[0.02] rounded-[3rem] border border-white/5 shadow-2xl">
                                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                                    <Clock size={32} className="text-slate-700" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2 font-heading tracking-tight uppercase">No Active Sanctions</h3>
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest max-w-[200px] mx-auto">Select an invoice to generate a new offer.</p>
                                <button onClick={() => navigate('/app/invoices')} className="mt-8 h-12 px-8 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5">Browse Bills</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !offer) {
        return (
            <div className="flex flex-col min-h-screen bg-[#0a0f0d] items-center justify-center px-8 text-center animate-in fade-in">
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-4 uppercase">Portal Error</h3>
                <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 max-w-xs">{error || 'Could not access the specific credit offer. Please return to invoices.'}</p>
                <button onClick={() => navigate('/app/invoices')} className="h-14 px-10 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5">Return to Invoices</button>
            </div>
        );
    }

    // --- FLOW STEPS ---

    const processingFee = offer.platform_fee;
    const gstOnFee = processingFee * 0.18;
    const disbursalAmount = offer.amount - processingFee - gstOnFee;

    const renderStepContent = () => {
        switch (step) {
            case 'review':
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-500">
                        <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900/20 backdrop-blur-3xl rounded-[3rem] p-10 text-white border border-white/10 shadow-3xl relative overflow-hidden group">
                            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
                            <div className="relative z-10">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Approved Sanction</p>
                                <div className="flex items-end gap-3 mb-10">
                                    <h1 className="text-5xl font-black tracking-tighter leading-none text-white">₹{offer.amount.toLocaleString('en-IN')}</h1>
                                    <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 leading-none">Merchant Exclusive</span>
                                </div>
                                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                                    <div>
                                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none mb-3">Effective Rate</p>
                                        <p className="text-xl font-black tracking-tight text-white">{(offer.interest_rate * 100).toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none mb-3">Tenure (Days)</p>
                                        <p className="text-xl font-black tracking-tight text-white">{offer.tenure_days}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.8rem] border border-white/5 shadow-2xl space-y-6">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Settlement Breakdown</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-bold">Protocol Ops Fee</span>
                                    <span className="font-black text-white">-₹{processingFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-bold">Institutional Tax</span>
                                    <span className="font-black text-white">-₹{gstOnFee.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Final Disbursal</p>
                                    <p className="text-3xl font-black text-emerald-500 tracking-tighter">₹{disbursalAmount.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => handleNext('kyc_confirm')} disabled={loading} className="w-full h-16 bg-emerald-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-3xl shadow-emerald-900/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Accept Capital Offer'}
                        </button>
                    </div>
                );
            case 'kyc_confirm':
                return (
                    <div className="flex flex-col items-center py-12 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-white/5 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight mb-4 uppercase">Compliance Verification</h2>
                        <p className="text-slate-500 text-[10px] font-black leading-relaxed text-center mb-12 max-w-[240px] tracking-widest">PERFORMING FINAL INSTITUTIONAL RISK ASSESSMENT AND ANTI-FRAUD VERIFICATION.</p>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-12 max-w-[200px] border border-white/5">
                            <div className="h-full bg-emerald-500 w-3/4 animate-pulse"></div>
                        </div>
                        <button onClick={() => handleNext('sign')} className="w-full h-16 bg-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] border border-white/5">Execute Documents</button>
                    </div>
                );
            case 'sign':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.8rem] border border-white/5 shadow-3xl">
                            <h3 className="text-xl font-black text-white tracking-tight mb-6 uppercase border-b border-white/5 pb-4">Digital Sanction Contract</h3>
                            <div className="h-72 overflow-y-auto pr-4 text-[10px] font-black text-slate-500 leading-loose mb-8 no-scrollbar uppercase tracking-widest">
                                <p className="mb-4">This master facility instrument governs the credit sanction of <span className="text-white">₹{offer.amount.toLocaleString('en-IN')}</span> against verified invoice asset #{offer.invoice_id.substring(0, 8).toUpperCase()}.</p>
                                <p className="mb-4 text-emerald-500 opacity-60">Clause 1: Disbursal Mechanics</p>
                                <p className="mb-4">The protocol agrees to disburse the net liquidity of ₹{disbursalAmount.toFixed(2)} to the authorized merchant account within 4-12 operational hours post-execution.</p>
                                <p className="mb-4 text-emerald-500 opacity-60">Clause 2: Repayment Obligations</p>
                                <p className="mb-4">The merchant participant acknowledges an absolute obligation to repay the principal and accrued interest totaling ₹{(offer.amount * (1 + (offer.interest_rate * (offer.tenure_days / 30)))).toFixed(2)} on the specified maturity date.</p>
                                <p className="mb-4">By clicking 'Execute', you provide an irrevocable digital signature under the Information Technology Act (Institutional Framework).</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl flex items-start gap-4 mb-8 border border-white/5">
                                <input type="checkbox" className="mt-1 w-5 h-5 accent-emerald-500" id="agree" />
                                <label htmlFor="agree" className="text-[9px] font-black text-slate-400 leading-tight cursor-pointer uppercase tracking-widest">I certify that all provided asset data is authentic and I accept all institutional terms.</label>
                            </div>
                            <button onClick={() => handleNext('success')} disabled={loading} className="w-full h-16 bg-emerald-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all">
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Execute & Disburse'}
                            </button>
                        </div>
                    </div>
                );
            case 'success':
                return (
                    <div className="flex flex-col items-center py-12 animate-in fade-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-8 border border-emerald-500/20 shadow-4xl animate-bounce">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase">Capital Released</h2>
                        <p className="text-slate-500 text-[10px] font-black leading-relaxed text-center mb-12 max-w-[200px] tracking-widest">LIQUIDITY OF ₹{disbursalAmount.toLocaleString('en-IN')} IS BEING TRANSMITTED VIA SECURE CHANNELS.</p>
                        <button onClick={() => navigate('/app/dashboard')} className="w-full h-16 bg-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] border border-white/5">Return to Command Center</button>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-transparent relative overflow-hidden font-body animate-in fade-in duration-1000 pb-32">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="px-8 pt-12 pb-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-3xl bg-black/20 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 active:scale-95 transition-all shadow-2xl">
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tighter font-heading leading-none uppercase">Credit Portal</h1>
                        <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Capital Disbursal</p>
                    </div>
                </div>
            </div>

            <div className="px-8 mt-12 relative z-10">
                {renderStepContent()}
            </div>
        </div>
    );
}

import { AlertCircle } from 'lucide-react';
