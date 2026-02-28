import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Phone, Clock, ArrowRight, Zap } from 'lucide-react';
import { AuthService } from '../../services/auth.service';

type LoginStep = 'phone' | 'otp';

export default function Login() {
    const [step, setStep] = useState<LoginStep>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digit OTP

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(59);
    const navigate = useNavigate();

    // Focus management for OTP inputs
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        // Handle paste of multiple characters
        if (value.length > 1) {
            const pastedData = value.substring(0, 6).split('');
            for (let i = 0; i < pastedData.length; i++) {
                if (index + i < 6) newOtp[index + i] = pastedData[i];
            }
            setOtp(newOtp);
            // Focus last filled input or next empty
            const nextIndex = Math.min(index + pastedData.length, 5);
            document.getElementById(`otp-${nextIndex}`)?.focus();
            return;
        }

        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleSendOTP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await AuthService.sendOTP(phone);
            setStep('otp');
            setTimer(59); // Start timer
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            const message = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail[0]?.msg : 'Failed to send OTP');
            setError(message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length < 6) return; // Wait for full OTP

        setLoading(true);
        setError('');
        try {
            const data = await AuthService.verifyOTP(phone, otpString);
            localStorage.setItem('access_token', data.access_token);
            if (data.is_onboarded) {
                navigate('/dashboard');
            } else {
                navigate('/onboarding');
            }
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            const message = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail[0]?.msg : 'Invalid OTP');
            setError(message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen animate-in fade-in duration-1000 bg-slate-50 relative overflow-hidden font-body">
            {/* Decorative Background Elements */}
            <div className="bg-blob blob-1 opacity-40"></div>
            <div className="bg-blob blob-2 opacity-20"></div>

            {/* Header Area */}
            <div className="phonepe-gradient pt-16 pb-24 px-8 rounded-b-[3.5rem] relative overflow-hidden shadow-2xl shadow-slate-900/10">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-slate-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-emerald-900/10 rounded-full blur-2xl"></div>

                <div className="flex items-center gap-6 mb-4 relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center text-white backdrop-blur-md border border-white/10 shadow-xl">
                        <Zap fill="white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-100 tracking-tight leading-none font-heading uppercase">G-Discount</h1>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-800 rounded-full"></span> Institutional Finance
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Area - Silent */}
            <div className="px-10 -mt-6 relative z-20 flex gap-3">
                <div className="h-1 bg-white rounded-full flex-[2] shadow-sm"></div>
                <div className="h-1 bg-white/20 rounded-full flex-1"></div>
            </div>

            <div className="px-10 pt-16 flex flex-col relative z-10">
                <div className="mb-12">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-tight mb-2 font-heading">Secure Portal</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Access your corporate discounting line</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center gap-3">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span> {error}
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] p-8 mb-10 border border-slate-50 shadow-2xl shadow-emerald-900/5">
                    <form onSubmit={step === 'phone' ? handleSendOTP : handleVerifyOTP} className="flex flex-col gap-8">
                        {/* Always show phone input, but style it as static if in OTP step */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mobile Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-emerald-600 transition-colors group-focus-within:text-emerald-500">
                                    <Phone size={22} strokeWidth={3} />
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        if (step === 'phone') setPhone(e.target.value.replace(/\D/g, ''));
                                    }}
                                    readOnly={step === 'otp'}
                                    className={`w-full pl-14 p-5 rounded-[1.5rem] border-2 transition-all text-xl font-black tracking-tight outline-none ${step === 'otp'
                                        ? 'bg-slate-50 border-slate-50 text-slate-400 cursor-not-allowed'
                                        : 'border-slate-50 focus:border-emerald-500 focus:bg-white bg-slate-50 text-slate-800'
                                        }`}
                                    placeholder="98765 43210"
                                    maxLength={10}
                                    required
                                />
                                {step === 'otp' && (
                                    <button
                                        type="button"
                                        onClick={() => setStep('phone')}
                                        className="absolute inset-y-0 right-5 flex items-center text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>

                        {step === 'otp' && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4 pt-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">6-Digit Verification</label>
                                <div className="flex gap-3 justify-between">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-[14%] aspect-square rounded-2xl border-2 border-slate-50 text-center text-2xl font-black text-emerald-600 focus:border-emerald-500 outline-none transition-all bg-slate-50 focus:bg-white shadow-inner"
                                            maxLength={6} // Allow pasting
                                        />
                                    ))}
                                </div>

                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-4">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={16} />
                                        {timer > 0 ? (
                                            <span>Resend in {timer}s</span>
                                        ) : (
                                            <button type="button" onClick={() => handleSendOTP()} className="text-emerald-600 hover:underline">Resend OTP</button>
                                        )}
                                    </div>
                                    <button type="button" className="text-slate-400 hover:text-slate-600">Need Help?</button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="px-2">
                    <button
                        onClick={step === 'phone' ? handleSendOTP : handleVerifyOTP}
                        disabled={step === 'phone' ? (loading || phone.length < 10) : (loading || otp.join('').length < 6)}
                        className={`w-full flex justify-center items-center gap-4 text-white p-6 rounded-[2rem] font-black shadow-2xl transition-all text-sm uppercase tracking-[0.2em] relative overflow-hidden group ${step === 'phone' && phone.length < 10
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-none'
                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20 active:scale-95'
                            }`}
                    >
                        {!loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}

                        {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                        {step === 'phone' ? 'Send OTP' : 'Verify & Launch'}
                        {!loading && <ArrowRight size={20} strokeWidth={4} className="group-hover:translate-x-1 transition-transform" />}
                    </button>

                    {/* Footer Area */}
                    <div className="mt-12 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose mb-10 max-w-[280px] mx-auto">
                            By continuing, you agree to our <br />
                            <a href="#" className="text-emerald-600 underline">Terms</a> & <a href="#" className="text-emerald-600 underline">Privacy Policy</a>
                        </p>

                        <div className="flex flex-col items-center gap-4 opacity-40">
                            <div className="flex items-center gap-2 grayscale brightness-150">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-black text-[10px]">PCI</div>
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-black text-[10px]">ISO</div>
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-black text-[10px]">AES</div>
                            </div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Banking Grade Security</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
