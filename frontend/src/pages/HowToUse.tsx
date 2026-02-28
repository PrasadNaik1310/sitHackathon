import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Zap, FileText, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HowToUse() {
    const navigate = useNavigate();

    const steps = [
        {
            title: "Connect Business",
            desc: "Securely link your business profile. We use institutional sandboxes to verify your GST and identity without manual paperwork.",
            icon: <ShieldCheck size={28} />,
            color: "bg-emerald-50 text-emerald-800"
        },
        {
            title: "Select Invoices",
            desc: "Select the pending B2B invoices you'd like to discount. Our system automatically validates invoice details against GST records.",
            icon: <FileText size={28} />,
            color: "bg-slate-50 text-slate-800"
        },
        {
            title: "Generate Offers",
            desc: "Our automated risk engine analyzes your parameters and generates instant discounting offers with flat transparent fees.",
            icon: <Zap size={28} />,
            color: "bg-emerald-50 text-emerald-800"
        },
        {
            title: "Digital Signature",
            desc: "Review the agreement terms and sign digitally. No physical documents required for the entire disbursement cycle.",
            icon: <CheckCircle2 size={28} />,
            color: "bg-slate-50 text-slate-800"
        },
        {
            title: "Instant Liquidity",
            desc: "Funds are disbursed directly to your verified business bank account within minutes of the final approval.",
            icon: <ArrowRight size={28} />,
            color: "bg-emerald-800 text-white shadow-xl shadow-emerald-900/10"
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
                        <h1 className="text-3xl font-black text-white tracking-tighter font-heading leading-none uppercase">Execution Guide</h1>
                        <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.4em] mt-3">The G-Discount Protocol</p>
                    </div>
                </div>

                <div className="max-w-xl">
                    <h2 className="text-5xl font-black text-white tracking-tighter leading-[0.95] mb-10 font-heading uppercase">
                        Zero Friction. <br />
                        <span className="text-emerald-500">Total Integrity.</span>
                    </h2>
                    <p className="text-slate-400 font-bold leading-relaxed text-lg">
                        Follow our guided institutional workflow to access credit lines against your verified invoices. Designed for speed, built on trust.
                    </p>
                </div>
            </header>

            {/* Steps Timeline */}
            <main className="px-8 relative z-10 max-w-3xl mx-auto">
                <div className="space-y-16">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex gap-10 group"
                        >
                            <div className="flex flex-col items-center">
                                <div className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center border border-white/10 backdrop-blur-3xl shadow-3xl transition-all group-hover:scale-110 group-hover:bg-emerald-500/10 ${i === steps.length - 1 ? 'bg-emerald-600 text-white border-emerald-500/50' : 'bg-white/5 text-slate-400'}`}>
                                    {step.icon}
                                </div>
                                {i !== steps.length - 1 && (
                                    <div className="w-[1px] h-full bg-gradient-to-b from-emerald-500/30 to-transparent mt-6 rounded-full"></div>
                                )}
                            </div>

                            <div className="pt-4 pb-12">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-4 block opacity-60">Phase 0{i + 1}</span>
                                <h3 className="text-3xl font-black text-white tracking-tight mb-5 font-heading uppercase leading-none">{step.title}</h3>
                                <p className="text-slate-500 font-bold leading-relaxed max-w-md">
                                    {step.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Ready CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="mt-32 p-14 bg-white/[0.03] backdrop-blur-3xl rounded-[4rem] border border-white/5 shadow-4xl text-center relative overflow-hidden"
                >
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
                    <h4 className="text-3xl font-black text-white mb-6 font-heading tracking-tight uppercase">Strategic Onboarding</h4>
                    <p className="text-slate-500 font-bold mb-12 max-w-sm mx-auto">Join the new standard of institutional business liquidity.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-7 bg-emerald-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-600 shadow-3xl shadow-emerald-900/40 transition-all active:scale-95"
                    >
                        Initialize Onboarding
                    </button>
                </motion.div>
            </main>
        </div>
    );
}
