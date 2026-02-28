import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Phone, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { AuthService } from '../../services/auth.service';

type LoginStep = 'phone' | 'otp';

export default function Login() {
    const [step, setStep] = useState<LoginStep>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(0);
    const navigate = useNavigate();

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        if (value.length > 1) {
            const pastedData = value.substring(0, 6).split('');
            for (let i = 0; i < pastedData.length; i++) {
                if (index + i < 6) newOtp[index + i] = pastedData[i];
            }
            setOtp(newOtp);
            const nextIndex = Math.min(index + pastedData.length, 5);
            document.getElementById(`otp-${nextIndex}`)?.focus();
            return;
        }
        newOtp[index] = value;
        setOtp(newOtp);
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
            setTimer(59);
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
            setError(err.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length < 6) return;
        setLoading(true);
        setError('');
        try {
            const data = await AuthService.verifyOTP(phone, otpString);
            localStorage.setItem('access_token', data.access_token);
            navigate(data.is_onboarded ? '/app/dashboard' : '/onboarding');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-6 relative overflow-hidden font-body">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-900/20 rounded-full blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Branding Above Card */}
                <div className="flex flex-col items-center mb-10">
                    <motion.div
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-900/20 mb-6 border border-emerald-700/50"
                    >
                        <Zap size={32} fill="white" />
                    </motion.div>
                    <h1 className="text-3xl font-black text-white tracking-tighter font-heading uppercase">G-Discount</h1>
                    <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Institutional Gateway</p>
                </div>

                {/* Main Glass Card */}
                <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] border border-white/10 p-10 shadow-3xl shadow-black/50">
                    <AnimatePresence mode="wait">
                        {step === 'phone' ? (
                            <motion.div
                                key="phone"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="text-center mb-10">
                                    <h2 className="text-2xl font-black text-white tracking-tight font-heading leading-none mb-3">Identity Access</h2>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Enter your registered business <br />mobile number to proceed</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-emerald-800 group-focus-within:text-emerald-500 transition-colors">
                                            <Phone size={20} strokeWidth={3} />
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-white/[0.02] border border-white/5 pl-16 pr-6 py-5 rounded-2xl text-xl font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.04] transition-all tracking-tight"
                                            placeholder="Mobile Number"
                                            maxLength={10}
                                        />
                                    </div>
                                    {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}
                                </div>

                                <button
                                    onClick={handleSendOTP}
                                    disabled={loading || phone.length < 10}
                                    className="w-full py-5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-900 disabled:text-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Authorized Entrance</span>}
                                    {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center mb-10">
                                    <h2 className="text-2xl font-black text-white tracking-tight font-heading leading-none mb-3">Verification</h2>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Enter the 6-digit code sent <br />to <span className="text-emerald-500/80">+{phone}</span></p>
                                </div>

                                <div className="grid grid-cols-6 gap-3">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-full aspect-square bg-white/[0.02] border border-white/5 rounded-xl text-center text-xl font-black text-emerald-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.04] transition-all"
                                            maxLength={1}
                                        />
                                    ))}
                                </div>

                                {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}

                                <div className="space-y-4">
                                    <button
                                        onClick={handleVerifyOTP}
                                        disabled={loading || otp.join('').length < 6}
                                        className="w-full py-5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-900 disabled:text-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Verify Security</span>}
                                    </button>

                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                                        <button onClick={() => setStep('phone')} className="hover:text-white transition-colors">Edit Number</button>
                                        {timer > 0 ? (
                                            <span>Resend in {timer}s</span>
                                        ) : (
                                            <button onClick={handleSendOTP} className="text-emerald-500 hover:text-emerald-400 transition-colors">Resend Code</button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Info */}
                <div className="mt-12 flex flex-col items-center gap-6 opacity-40 grayscale">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-white" />
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">AES-256 SECURED</span>
                        </div>
                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">PCI COMPLIANT</span>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-[9px] font-black text-white uppercase tracking-[0.3em] hover:opacity-100 transition-opacity"
                    >
                        Return to Landing
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
