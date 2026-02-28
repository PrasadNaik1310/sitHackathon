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
            fullScreen ? "" : "glass-card bg-white/70 backdrop-blur-2xl border border-white/60 shadow-xl",
            className
        )}>
            {/* Pulsing glow behind the loader */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[30px] opacity-20 animate-pulse"></div>
                <div className="absolute -inset-4 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[40px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg border border-emerald-50 z-10">
                    <Loader2 className="animate-spin text-emerald-600" size={32} strokeWidth={3} />
                </div>
            </div>

            {(message || submessage) && (
                <div className="text-center relative z-10 max-w-[280px]">
                    {message && <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">{message}</h3>}
                    {submessage && <p className="text-slate-500 font-medium text-sm leading-relaxed">{submessage}</p>}
                </div>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-xl transition-all duration-500 animate-in fade-in">
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
