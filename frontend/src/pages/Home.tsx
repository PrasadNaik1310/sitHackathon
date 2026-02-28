import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, ArrowRight, BookOpen, Info, ChevronRight } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0f0d] relative overflow-hidden font-body selection:bg-emerald-500/30 selection:text-white">
            {/* Decorative Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 px-8 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-8 py-4 shadow-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tighter font-heading uppercase">G-Discount</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <button onClick={() => navigate('/how-to-use')} className="hover:text-emerald-500 transition-colors">How it works</button>
                        <button onClick={() => navigate('/about')} className="hover:text-emerald-500 transition-colors">About</button>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="bg-white/10 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 flex items-center gap-2 border border-white/10"
                    >
                        Launch Portal <ChevronRight size={14} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-48 pb-32 px-8">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-8">
                            <Shield size={14} />
                            <span>Institutional Grade Liquidity</span>
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] font-heading mb-10 uppercase">
                            Unlock your <br />
                            <span className="text-emerald-500">Business Capital</span>
                        </h1>

                        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-bold leading-relaxed">
                            The most sophisticated platform for institutional invoice discounting. Access automated credit lines with banking-grade security and silent elegance.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-12 py-7 bg-emerald-700 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-3xl shadow-emerald-900/20 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                            >
                                Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => navigate('/how-to-use')}
                                className="w-full sm:w-auto px-12 py-7 bg-white/5 text-white border border-white/10 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-4"
                            >
                                View Guide <BookOpen size={18} />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Feature Grid */}
                <div className="max-w-7xl mx-auto mt-40 grid md:grid-cols-3 gap-8 px-4">
                    {[
                        {
                            icon: <Zap className="text-emerald-500" />,
                            title: "Instant Verification",
                            desc: "Real-time GST and business identity checks via secure institutional sandboxes."
                        },
                        {
                            icon: <Shield className="text-emerald-500" />,
                            title: "Silent Security",
                            desc: "Full AES-256 encryption and PCI-compliant handling of all corporate financial data."
                        },
                        {
                            icon: <Info className="text-emerald-500" />,
                            title: "Smart Scoring",
                            desc: "Advanced risk modeling that rewards business health with competitive discount rates."
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-white/[0.03] backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl hover:bg-white/[0.05] transition-all group"
                        >
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight mb-4 font-heading uppercase leading-none">{feature.title}</h3>
                            <p className="text-slate-500 font-bold leading-relaxed text-sm">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="relative z-10 py-20 px-8 border-t border-white/5 bg-black/20 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <div className="flex items-center gap-3 opacity-60">
                        <Zap size={20} className="text-emerald-500" />
                        <span className="font-black text-lg tracking-tighter font-heading uppercase text-white">G-Discount</span>
                    </div>
                    <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <button onClick={() => navigate('/about')} className="hover:text-emerald-500 transition-colors">Project Info</button>
                        <a href="#" className="hover:text-emerald-500 transition-colors">Terms</a>
                        <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">© 2026 Institutional Finance Group</p>
                </div>
            </footer>
        </div>
    );
}
