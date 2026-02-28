import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Zap, Shield, Layers, Users } from 'lucide-react';

export default function About() {
    const navigate = useNavigate();

    const values = [
        {
            icon: <Shield size={22} className="text-emerald-800" />,
            title: "Security First",
            desc: "Banking-grade encryption for all institutional data."
        },
        {
            icon: <Layers size={22} className="text-emerald-800" />,
            title: "Automated Logic",
            desc: "Smart risk modeling and automated offer generation."
        },
        {
            icon: <Users size={22} className="text-emerald-800" />,
            title: "Corporate Trust",
            desc: "Building liquid markets for the modern B2B ecosystem."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0f0d] relative overflow-hidden font-body selection:bg-emerald-500/30 pb-32">
            {/* Decorative Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <header className="px-8 pt-16 pb-20 flex flex-col relative z-10 max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-16">
                    <button onClick={() => navigate('/')} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 backdrop-blur-xl hover:bg-white/10 transition-all active:scale-95 shadow-2xl">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter font-heading leading-none uppercase">Project Analysis</h1>
                        <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.4em] mt-3">The G-Discount Vision</p>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <h2 className="text-5xl font-black text-white tracking-tighter leading-[0.95] mb-10 font-heading uppercase">
                        Redefining institutional <br />
                        <span className="text-emerald-500">liquidity markets.</span>
                    </h2>

                    <div className="space-y-8 text-slate-400 font-bold leading-relaxed text-lg">
                        <p>
                            G-Discount is a state-of-the-art Invoice Discounting Platform designed for the modern B2B ecosystem. We bridge the gap between pending invoices and immediate liquidity using advanced financial engineering and secure automation.
                        </p>
                        <p>
                            Our platform leverages high-fidelity institutional sandboxes for real-time verification, ensuring that every transaction is backed by verified GST records and corporate identities.
                        </p>
                    </div>
                </div>
            </header>

            {/* Values Grid */}
            <main className="px-8 relative z-10 max-w-5xl mx-auto mt-12">
                <div className="grid md:grid-cols-3 gap-8">
                    {values.map((value, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/5 shadow-3xl text-center group"
                        >
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 mx-auto border border-emerald-500/10 group-hover:scale-110 transition-transform">
                                {value.icon && <value.icon.type {...value.icon.props} className="text-emerald-500" />}
                                {!value.icon && <Shield size={22} className="text-emerald-500" />}
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight mb-4 font-heading leading-none uppercase">{value.title}</h3>
                            <p className="text-slate-500 text-sm font-bold leading-relaxed">
                                {value.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Tech Stack Info */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="mt-20 p-16 bg-white/[0.02] backdrop-blur-3xl rounded-[4rem] border border-white/5 shadow-4xl relative overflow-hidden"
                >
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
                    <div className="flex items-center gap-5 mb-12 relative z-10">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Zap size={24} fill="white" className="text-white" />
                        </div>
                        <h4 className="text-3xl font-black text-white font-heading tracking-tight leading-none uppercase">Technical Core</h4>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 relative z-10">
                        <div className="space-y-6">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Frontend Framework</p>
                            <div className="flex flex-wrap gap-3">
                                {['React 19', 'Vite 7', 'Tailwind 4', 'Framer Motion'].map(tag => (
                                    <span key={tag} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-[11px] font-black uppercase tracking-widest">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Security Standards</p>
                            <div className="flex flex-wrap gap-3">
                                {['AES-256', 'PCI-DSS', 'SOC-2 Type II', 'ISO 27001'].map(tag => (
                                    <span key={tag} className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[11px] font-black uppercase tracking-widest">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Return CTA */}
                <div className="mt-24 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-500 hover:text-emerald-500 transition-all text-xs font-black uppercase tracking-[0.4em] pb-2 border-b-2 border-transparent hover:border-emerald-500"
                    >
                        Return to Command Center
                    </button>
                </div>
            </main>
        </div>
    );
}
