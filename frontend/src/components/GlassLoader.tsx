import { Loader2 } from 'lucide-react';
import { cn } from '../utils';

interface GlassLoaderProps {
    message?: string;
    submessage?: string;
    className?: string;
    fullScreen?: boolean;
}

export function GlassLoader({ message, submessage, className, fullScreen = false }: GlassLoaderProps) {
    const loaderContent = (
        <div className={cn(
            "flex flex-col items-center justify-center p-8 rounded-[2rem]",
            className
        )}>
            {/* Pulsing glow behind the loader */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500 rounded-full mix-blend-screen filter blur-[30px] opacity-10 animate-pulse"></div>

                <div className="relative w-20 h-20 bg-white/5 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10 z-10">
                    <Loader2 className="animate-spin text-emerald-500" size={32} strokeWidth={3} />
                </div>
            </div>

            {(message || submessage) && (
                <div className="text-center relative z-10 max-w-[280px]">
                    {message && <h3 className="text-2xl font-extrabold text-white tracking-tight mb-2 uppercase">{message}</h3>}
                    {submessage && <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest leading-relaxed opacity-60">{submessage}</p>}
                </div>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f0d]/90 backdrop-blur-3xl transition-all duration-500 animate-in fade-in">
                {loaderContent}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full h-full py-12 animate-in fade-in duration-500">
            {loaderContent}
        </div>
    );
}
