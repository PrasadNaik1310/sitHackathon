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
            title: "Upload Invoices",
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
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter font-heading leading-none uppercase">Guide</h1>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-60">How G-Discount Works</p>
                    </div>
                </div>

                <div className="max-w-xl">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-[1.1] mb-6 font-heading">
                        Zero paperwork. <br />
                        <span className="text-emerald-800">Total transparency.</span>
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Follow our guided institutional workflow to access credit lines against your verified invoices. Designed for speed, built on trust.
                    </p>
                </div>
            </header>

            {/* Steps Timeline */}
            <main className="px-8 relative z-10 max-w-2xl mx-auto">
                <div className="space-y-12">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex gap-8 group"
                        >
                            <div className="flex flex-col items-center">
                                <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center border border-white/50 shadow-sm transition-transform group-hover:scale-110 ${step.color}`}>
                                    {step.icon}
                                </div>
                                {i !== steps.length - 1 && (
                                    <div className="w-0.5 h-full bg-slate-200 mt-4 rounded-full opacity-50"></div>
                                )}
                            </div>

                            <div className="pt-2 pb-8">
                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.3em] mb-3 block opacity-60">Step 0{i + 1}</span>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3 font-heading leading-none">{step.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed text-sm">
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
                    className="mt-20 p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-900/5 text-center"
                >
                    <h4 className="text-2xl font-black text-slate-800 mb-4 font-heading tracking-tight">Ready to begin?</h4>
                    <p className="text-slate-400 text-sm font-medium mb-8">Join hundreds of businesses optimizing their cash flow with us.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-5 bg-emerald-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-900 transition-all active:scale-95"
                    >
                        Access Portal Now
                    </button>
                </motion.div>
            </main>
        </div>
    );
}
