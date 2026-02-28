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
            <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center">
                <GlassLoader />
                <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing Credit Portal</p>
            </div>
        );
    }

    // LIST VIEW (If no specific invoice selected for new loan)
    if (!invoiceId) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-hidden font-body animate-in fade-in duration-1000 pb-24">
                <div className="bg-blob blob-1 opacity-40"></div>
                <div className="bg-blob blob-2 opacity-20"></div>

                <div className="px-8 pt-12 pb-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-slate-50/50 border-b border-slate-100/50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100/50 active:scale-95 transition-all">
                            <ArrowLeft size={22} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tighter font-heading leading-none">Credit</h1>
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mt-2 opacity-60">Loan Management</p>
                        </div>
                    </div>
                </div>

                <div className="px-8 mt-10">
                    <div className="mb-12">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-tight font-heading mb-3">Sanctioned <span className="text-emerald-800">Funds</span></h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-50">Active and pending credit facilities</p>
                    </div>

                    <div className="space-y-6">
                        {activeOffers.map((off) => (
                            <div key={off.id} onClick={() => navigate(`/loans?invoice_id=${off.invoice_id}`)} className="bg-white p-8 rounded-[2.8rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100/50">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-lg tracking-tight mb-1 leading-none">Offer Active</h4>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-60">Invoice #{off.invoice_id.substring(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100/50">Action Mode</div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-40">Approved</p>
                                    <p className="text-2xl font-black text-emerald-800 tracking-tighter leading-none">₹{off.amount.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}

                        {activeLoans.map((loan) => (
                            <div key={loan.id} className="bg-white p-8 rounded-[2.8rem] border border-slate-50 shadow-sm opacity-90">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100/50">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-600 text-lg tracking-tight mb-1 leading-none">Sanctioned</h4>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-60">ID #{loan.id.substring(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100/50">{loan.status}</div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-40">Disbursed</p>
                                    <p className="text-2xl font-black text-slate-800 tracking-tighter leading-none">₹{loan.amount.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}

                        {activeLoans.length === 0 && activeOffers.length === 0 && (
                            <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-50 shadow-sm">
                                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
                                    <Clock size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-2 font-heading tracking-tight">No Active Sanctions</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest max-w-[200px] mx-auto opacity-50">Select an invoice to generate a new offer.</p>
                                <button onClick={() => navigate('/invoices')} className="mt-8 h-12 px-8 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10">Browse Bills</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !offer) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center px-8 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-800 rounded-3xl flex items-center justify-center mb-6 border border-red-100">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4 uppercase">Portal Issue</h3>
                <p className="text-slate-400 text-sm font-bold leading-relaxed mb-10 max-w-xs">{error || 'Could not access the specific credit offer. Please return to invoices.'}</p>
                <button onClick={() => navigate('/invoices')} className="h-14 px-10 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Return to Invoices</button>
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
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="phonepe-gradient rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden group">
                            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-slate-400/5 rounded-full blur-3xl"></div>
                            <div className="relative z-10">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-40">Approved Sanction</p>
                                <div className="flex items-end gap-3 mb-10">
                                    <h1 className="text-5xl font-black tracking-tighter leading-none">₹{offer.amount.toLocaleString('en-IN')}</h1>
                                    <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Verified Offer</span>
                                </div>
                                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                                    <div>
                                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none mb-3 opacity-40">Monthly Interest</p>
                                        <p className="text-xl font-black tracking-tight">{(offer.interest_rate * 100).toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none mb-3 opacity-40">Tenure (Days)</p>
                                        <p className="text-xl font-black tracking-tight">{offer.tenure_days}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.8rem] border border-slate-50 shadow-sm space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-60">Deduction Schedule</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">Platform Ops Fee</span>
                                    <span className="font-black text-slate-800">-₹{processingFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">Tax on Fee (GST)</span>
                                    <span className="font-black text-slate-800">-₹{gstOnFee.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-50 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-40 mb-1">Final Disbursal</p>
                                    <p className="text-3xl font-black text-emerald-800 tracking-tighter">₹{disbursalAmount.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => handleNext('kyc_confirm')} disabled={loading} className="w-full h-16 bg-slate-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/10 flex items-center justify-center gap-3 active:scale-95 transition-all">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Accept Sanction'}
                        </button>
                    </div>
                );
            case 'kyc_confirm':
                return (
                    <div className="flex flex-col items-center py-12 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-slate-50 text-slate-800 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100/50 shadow-inner">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-4 uppercase">Verification</h2>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed text-center mb-12 max-w-[240px]">WE ARE PERFORMING A FINAL AML & COMPLIANCE CHECK FOR THIS CREDIT LINE.</p>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-12 max-w-[200px]">
                            <div className="h-full bg-slate-800 w-3/4 animate-pulse"></div>
                        </div>
                        <button onClick={() => handleNext('sign')} className="w-full h-16 bg-slate-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em]">Continue to Sign</button>
                    </div>
                );
            case 'sign':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="bg-white p-8 rounded-[2.8rem] border border-slate-50 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6 uppercase border-b border-slate-100 pb-4">Loan Contract</h3>
                            <div className="h-64 overflow-y-auto pr-4 text-xs font-bold text-slate-500 leading-loose mb-8 custom-scrollbar">
                                <p className="mb-4">This facility agreement (the "Agreemen") governs the credit sanction of <span className="text-slate-800">₹{offer.amount.toLocaleString('en-IN')}</span> against Invoice #{offer.invoice_id.substring(0, 8).toUpperCase()}.</p>
                                <p className="mb-4 font-black text-slate-700 uppercase tracking-widest">Article 1: Disbursal</p>
                                <p className="mb-4">The Lender agrees to disburse the net amount of ₹{disbursalAmount.toFixed(2)} to the registered business account within 24 operational hours.</p>
                                <p className="mb-4 font-black text-slate-700 uppercase tracking-widest">Article 2: Repayment</p>
                                <p className="mb-4">The Borrower agrees to repay the Principal plus interest totaling ₹{(offer.amount * (1 + (offer.interest_rate * (offer.tenure_days / 30)))).toFixed(2)} at the end of {offer.tenure_days} days.</p>
                                <p className="mb-4">By clicking Approve, you execute a binding digital signature under IT Act 2000.</p>
                            </div>
                            <div className="bg-emerald-50/50 p-6 rounded-2xl flex items-start gap-4 mb-8">
                                <input type="checkbox" className="mt-1 w-5 h-5 accent-emerald-800" id="agree" />
                                <label htmlFor="agree" className="text-[10px] font-black text-slate-600 leading-tight cursor-pointer uppercase tracking-widest">I certify that all details are accurate and I accept the terms of this facility.</label>
                            </div>
                            <button onClick={() => handleNext('success')} disabled={loading} className="w-full h-16 bg-emerald-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Approve & Sign'}
                            </button>
                        </div>
                    </div>
                );
            case 'success':
                return (
                    <div className="flex flex-col items-center py-12 animate-in fade-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-800 rounded-[2.5rem] flex items-center justify-center mb-8 border border-emerald-100/50 shadow-inner">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-4 uppercase">Sanctioned</h2>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed text-center mb-12 max-w-[200px]">THE DISBURSAL OF ₹{disbursalAmount.toLocaleString('en-IN')} IS BEING PROCESSED ELECTRONICALLY.</p>
                        <button onClick={() => navigate('/dashboard')} className="w-full h-16 bg-slate-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em]">Return to Home</button>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-hidden font-body animate-in fade-in duration-1000 pb-24">
            <div className="bg-blob blob-1 opacity-40"></div>
            <div className="bg-blob blob-2 opacity-20"></div>

            <div className="px-8 pt-12 pb-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-slate-50/50 border-b border-slate-100/50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100/50 active:scale-95 transition-all">
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tighter font-heading leading-none">Credit Line</h1>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mt-2 opacity-60">Capital Disbursal</p>
                    </div>
                </div>
            </div>

            <div className="px-8 mt-12">
                {renderStepContent()}
            </div>
        </div>
    );
}

import { AlertCircle } from 'lucide-react';
