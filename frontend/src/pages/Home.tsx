import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, ArrowRight, BookOpen, Info, ChevronRight } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-body selection:bg-emerald-100 selection:text-emerald-900">
            {/* Decorative Background */}
            <div className="bg-blob blob-1 opacity-30"></div>
            <div className="bg-blob blob-2 opacity-10"></div>

            {/* Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 px-8 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2rem] px-8 py-4 shadow-xl shadow-slate-900/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/10">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <span className="text-xl font-black text-slate-800 tracking-tighter font-heading uppercase">G-Discount</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <button onClick={() => navigate('/how-to-use')} className="hover:text-emerald-800 transition-colors">How it works</button>
                        <button onClick={() => navigate('/about')} className="hover:text-emerald-800 transition-colors">About</button>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-800 transition-all active:scale-95 flex items-center gap-2"
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100/50 rounded-full text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-8">
                            <Shield size={14} />
                            <span>Institutional Grade Liquidity</span>
                        </div>

                        <h1 className="text-7xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] font-heading mb-10">
                            Unlock your <br />
                            <span className="text-emerald-800">Business Capital</span>
                        </h1>

                        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                            The most sophisticated platform for institutional invoice discounting. Access automated credit lines with banking-grade security and silent elegance.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-10 py-6 bg-emerald-800 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/20 hover:bg-emerald-900 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                            >
                                Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => navigate('/how-to-use')}
                                className="w-full sm:w-auto px-10 py-6 bg-white text-slate-800 border border-slate-100 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:shadow-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-4"
                            >
                                View Guide <BookOpen size={18} />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Feature Grid */}
                <div className="max-w-7xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Zap className="text-emerald-600" />,
                            title: "Instant Verification",
                            desc: "Real-time GST and business identity checks via secure institutional sandboxes."
                        },
                        {
                            icon: <Shield className="text-emerald-600" />,
                            title: "Silent Security",
                            desc: "Full AES-256 encryption and PCI-compliant handling of all corporate financial data."
                        },
                        {
                            icon: <Info className="text-emerald-600" />,
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
                            className="bg-white/60 backdrop-blur-md p-10 rounded-[3rem] border border-white/80 shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 transition-all group"
                        >
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4 font-heading">{feature.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="relative z-10 py-16 px-8 border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 opacity-40 grayscale">
                        <Zap size={20} />
                        <span className="font-black text-lg tracking-tighter font-heading uppercase">G-Discount</span>
                    </div>
                    <div className="flex gap-10 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <button onClick={() => navigate('/about')} className="hover:text-slate-800 transition-colors">Project Info</button>
                        <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-slate-800 transition-colors">Privacy</a>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-60">© 2026 Institutional Finance Group</p>
                </div>
            </footer>
        </div>
    );
}
