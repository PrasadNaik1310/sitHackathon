import { useState, useEffect } from 'react';
import { ArrowLeft, BrainCircuit, ShieldCheck, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { GlassLoader } from '../../components/GlassLoader';

interface ScoreData {
    score: number;
    grade: string;
    suggestions: string[];
}

export default function CreditScorePage() {
    const navigate = useNavigate();
    const [data, setData] = useState<ScoreData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchScore() {
            try {
                const response = await api.get('/businesses/me/credit-score/suggestions');
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch score data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchScore();
    }, []);

    const score = data?.score || 0;
    const scorePercentage = (score / 900) * 100;

    const getGradeColor = (grade: string) => {
        if (grade === 'A') return 'text-emerald-500';
        if (grade === 'B') return 'text-blue-500';
        return 'text-amber-500';
    };

    return (
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full pb-12">

            {/* Floating Minimalist Header Area */}
            <div className="px-6 pt-12 pb-8 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100/50 active:scale-95 transition-all">
                    <ArrowLeft size={24} strokeWidth={3} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tighter">Insights</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div> Business Credit AI
                    </p>
                </div>
            </div>

            {loading ? (
                <GlassLoader message="Analyzing Profile" submessage="Our AI engine is generating tailored suggestions..." />
            ) : !data ? (
                <div className="text-center py-16 text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-sm px-6 mx-4">
                    <AlertTriangle size={32} className="text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800">Unable to Load</h3>
                    <p className="text-sm mt-1 text-slate-400">Could not fetch your score data right now.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6 px-4">

                    {/* Score Chart Card */}
                    <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="flex justify-between w-full mb-2 items-start relative z-10">
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Bureau Live Score</p>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded font-black text-[9px] uppercase tracking-wider border border-emerald-100/50">
                                <ShieldCheck size={12} /> Verified
                            </div>
                        </div>

                        {/* Large Semicircle SVG Chart */}
                        <div className="relative w-64 h-32 mt-6 overflow-hidden flex justify-center z-10">
                            <svg className="absolute w-64 h-64 -bottom-32 transform" viewBox="0 0 100 100">
                                {/* Background track */}
                                <path
                                    d="M 10 50 A 40 40 0 0 1 90 50"
                                    fill="none"
                                    stroke="#f1f5f9"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                />
                                {/* Dynamic score track */}
                                <path
                                    d="M 10 50 A 40 40 0 0 1 90 50"
                                    fill="none"
                                    className={getGradeColor(data.grade)}
                                    stroke="currentColor"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(scorePercentage / 100) * 125.6} 125.6`}
                                    style={{
                                        transition: "stroke-dasharray 1.5s ease-out"
                                    }}
                                />
                            </svg>
                            <div className="absolute bottom-2 flex flex-col items-center">
                                <span className={`text-6xl font-black tracking-tighter ${getGradeColor(data.grade)}`}>
                                    {score}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 tracking-widest mt-1 uppercase">Max 900</span>
                            </div>
                        </div>

                        <div className="w-full flex justify-between mt-8 pt-6 border-t border-slate-50">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Risk Grade</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className={`text-2xl font-black ${getGradeColor(data.grade)}`}>{data.grade}</p>
                                    <span className="px-1.5 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider">Premium</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">History</p>
                                <p className="text-emerald-500 text-xl font-black mt-1 flex items-center gap-1 justify-end tracking-tight"><TrendingUp size={18} /> +12</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Suggestions Card */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50">
                                <BrainCircuit size={22} />
                            </div>
                            <div>
                                <h3 className="font-black text-[15px] text-slate-800 tracking-tight">AI Credit Insights</h3>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Growth Recommendations</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {data.suggestions.map((suggestion, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/50">
                                    <div className="mt-0.5 text-emerald-600">
                                        <Lightbulb size={20} />
                                    </div>
                                    <p className="text-[13px] text-slate-700 leading-relaxed font-bold">
                                        {suggestion}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
