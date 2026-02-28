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
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-body selection:bg-emerald-100 pb-24">
            {/* Decorative Background */}
            <div className="bg-blob blob-1 opacity-30"></div>
            <div className="bg-blob blob-2 opacity-10"></div>

            {/* Header */}
            <header className="px-8 pt-12 pb-16 flex flex-col relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate('/')} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100/50 hover:bg-slate-50 transition-colors">
                        <ChevronLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter font-heading leading-none uppercase">About</h1>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-60">The G-Discount Vision</p>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-[1.1] mb-8 font-heading">
                        Redefining institutional <br />
                        <span className="text-emerald-800">liquidity markets.</span>
                    </h2>

                    <div className="space-y-6 text-slate-500 font-medium leading-relaxed">
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
            <main className="px-8 relative z-10 max-w-4xl mx-auto mt-12">
                <div className="grid md:grid-cols-3 gap-6">
                    {values.map((value, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all text-center"
                        >
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                                {value.icon}
                            </div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-3 font-heading leading-none">{value.title}</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                {value.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Tech Stack Info */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="mt-16 p-12 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-900/5"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                            <Zap size={22} fill="white" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-800 font-heading tracking-tight leading-none uppercase">Technical Core</h4>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Frontend Stack</p>
                            <div className="flex flex-wrap gap-2">
                                {['React 19', 'Vite 7', 'Tailwind 4', 'Framer Motion'].map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 text-[10px] font-black">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Security Standards</p>
                            <div className="flex flex-wrap gap-2">
                                {['AES-256', 'PCI-DSS', 'SOC-2 Type II', 'ISO 27001'].map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-[10px] font-black">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Return CTA */}
                <div className="mt-16 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-400 hover:text-slate-800 transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
                    >
                        Back to Landing
                    </button>
                </div>
            </main>
        </div>
    );
}
