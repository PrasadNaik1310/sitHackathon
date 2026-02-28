import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, CheckCircle2, Factory, Loader2 } from 'lucide-react';
import { cn } from '../../utils';
import { KycService } from '../../services/kyc.service';

type OnboardingStep = 'aadhaar' | 'pan' | 'business' | 'success';

export default function Onboarding() {
    const [step, setStep] = useState<OnboardingStep>('aadhaar');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Form inputs
    const [aadhaar, setAadhaar] = useState('');
    const [pan, setPan] = useState('');
    const [gst, setGst] = useState('');

    const handleNextStep = async (next: OnboardingStep) => {
        setLoading(true);
        setError('');

        try {
            // Validation step
            if (next === 'pan' && aadhaar.length < 12) throw new Error("Aadhaar requires 12 digits");
            if (next === 'business' && pan.length < 10) throw new Error("PAN requires 10 characters");

            // Final Step: Connect Business / Call Onboard API
            if (next === 'success') {
                if (gst.length < 15) throw new Error("GSTIN requires 15 characters");

                // Call the real API
                await KycService.onboard(aadhaar, pan, gst);
            }

            // Success Transition
            setStep(next);
            if (next === 'success') {
                setTimeout(() => navigate('/dashboard'), 2500);
            }
        } catch (err: any) {
            setError(err.message || err.response?.data?.detail || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const renderStepIcon = () => {
        switch (step) {
            case 'aadhaar': return <ShieldCheck className="w-12 h-12 text-primary" style={{ color: 'var(--primary-color)' }} />;
            case 'pan': return <Upload className="w-12 h-12 text-primary" style={{ color: 'var(--primary-color)' }} />;
            case 'business': return <Factory className="w-12 h-12 text-primary" style={{ color: 'var(--primary-color)' }} />;
            case 'success': return <CheckCircle2 className="w-16 h-16 text-emerald-500" />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen animate-in fade-in duration-700 bg-slate-50 pb-12">
            {/* Header Area */}
            <div className="phonepe-gradient pt-12 pb-16 px-6 rounded-b-[2.5rem] relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border border-white/20 shadow-xl">
                        {renderStepIcon()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Setup Account</h1>
                        <p className="text-purple-100/70 text-sm font-bold uppercase tracking-widest whitespace-nowrap">Business Verification</p>
                    </div>
                </div>
            </div>

            {/* Progress Area */}
            {step !== 'success' && (
                <div className="px-6 -mt-6 relative z-10 flex gap-2">
                    <div className={cn("h-1.5 rounded-full shadow-sm", step === 'aadhaar' ? "bg-white flex-[1.5]" : (step === 'pan' || step === 'business' ? "bg-white flex-1" : "bg-white/30 flex-1"))}></div>
                    <div className={cn("h-1.5 rounded-full shadow-sm", step === 'pan' ? "bg-white flex-[1.5]" : (step === 'business' ? "bg-white flex-1" : "bg-white/30 flex-1"))}></div>
                    <div className={cn("h-1.5 rounded-full shadow-sm", step === 'business' ? "bg-white flex-[1.5]" : "bg-white/30 flex-1")}></div>
                </div>
            )}

            <div className="px-6 flex-1 w-full flex flex-col pb-8">
                {error && (
                    <div className="mb-6 w-full p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="flex-1 flex flex-col">
                    {/* Stepper Logic */}
                    {step === 'aadhaar' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col pt-10">
                            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Identity Check</h2>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-8">Official Aadhaar Verification</p>

                            <div className="glass-card p-6 mb-8 border-none shadow-xl shadow-slate-200/50">
                                <label className="text-[10px] font-black text-slate-400 mb-3 block uppercase tracking-[0.15em]">Aadhaar Number</label>
                                <input
                                    type="text"
                                    placeholder="XXXX XXXXX XXXX"
                                    value={aadhaar}
                                    onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                                    maxLength={12}
                                    className="w-full p-4 rounded-2xl border-2 border-slate-50 focus:border-primary-color transition-all outline-none tracking-[0.2em] text-center text-xl font-black text-slate-800 bg-slate-50 focus:bg-white"
                                />
                            </div>

                            <button
                                onClick={() => handleNextStep('pan')}
                                disabled={loading || aadhaar.length < 12}
                                className={`mt-4 w-full flex justify-center items-center gap-3 text-white p-5 rounded-2xl font-black shadow-lg transition-all text-base uppercase tracking-widest ${aadhaar.length < 12 ? 'bg-slate-300 opacity-80' : 'bg-primary-color hover:bg-primary-color/90 active:scale-95'
                                    }`}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                                {loading ? 'Verifying...' : 'Continue to PAN'}
                            </button>
                        </div>
                    )}

                    {step === 'pan' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col pt-10">
                            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Tax Details</h2>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-8">Permanent Account Number</p>

                            <div className="glass-card p-6 mb-8 border-none shadow-xl shadow-slate-200/50">
                                <label className="text-[10px] font-black text-slate-400 mb-3 block uppercase tracking-[0.15em]">PAN Card Number</label>
                                <input
                                    type="text"
                                    placeholder="ABCDE1234F"
                                    value={pan}
                                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                                    maxLength={10}
                                    className="w-full p-4 rounded-2xl border-2 border-slate-50 focus:border-primary-color transition-all outline-none tracking-[0.2em] text-center text-xl font-black text-slate-800 bg-slate-50 focus:bg-white uppercase"
                                />
                            </div>

                            <button
                                onClick={() => handleNextStep('business')}
                                disabled={loading || pan.length < 10}
                                className={`mt-4 w-full flex justify-center items-center gap-3 text-white p-5 rounded-2xl font-black shadow-lg transition-all text-base uppercase tracking-widest ${pan.length < 10 ? 'bg-slate-300 opacity-80' : 'bg-primary-color hover:bg-primary-color/90 active:scale-95'
                                    }`}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                                {loading ? 'Verifying...' : 'Continue to Business'}
                            </button>
                        </div>
                    )}

                    {step === 'business' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col pt-10">
                            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Business Profile</h2>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-8">Connect Goods & Services Tax ID</p>

                            <div className="glass-card p-6 mb-8 border-none shadow-xl shadow-slate-200/50">
                                <label className="text-[10px] font-black text-slate-400 mb-3 block uppercase tracking-[0.15em]">Business GSTIN</label>
                                <input
                                    type="text"
                                    placeholder="22AAAAA0000A1Z5"
                                    value={gst}
                                    onChange={(e) => setGst(e.target.value.toUpperCase())}
                                    maxLength={15}
                                    className="w-full p-4 rounded-2xl border-2 border-slate-50 focus:border-primary-color transition-all outline-none tracking-[0.1em] text-center text-lg font-black text-slate-800 bg-slate-50 focus:bg-white uppercase"
                                />
                            </div>

                            <button
                                onClick={() => handleNextStep('success')}
                                disabled={loading || gst.length < 15}
                                className={`mt-4 w-full flex justify-center items-center gap-3 text-white p-5 rounded-2xl font-black shadow-lg transition-all text-base uppercase tracking-widest ${gst.length < 15 ? 'bg-slate-300 opacity-80' : 'bg-primary-color hover:bg-primary-color/90 active:scale-95'
                                    }`}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                                {loading ? 'Onboarding...' : 'Connect Business'}
                            </button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="w-full flex-col flex items-center justify-center pt-24 animate-in zoom-in duration-700">
                            <div className="w-20 h-20 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-center text-emerald-500 mb-8 shadow-inner">
                                <CheckCircle2 size={40} strokeWidth={3} />
                            </div>
                            <h2 className="text-3xl font-black text-center tracking-tight text-slate-800 mb-2 uppercase">Verified!</h2>
                            <p className="text-slate-400 text-center text-[11px] font-bold uppercase tracking-[0.15em] px-8 leading-loose">
                                Your profile is completely configured.<br />Redirecting to dashboard...
                            </p>
                            <Loader2 className="animate-spin text-slate-300 mt-12" size={24} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
