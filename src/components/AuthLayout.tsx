import { ReactNode } from 'react';
import { Wallet, ShieldCheck, Zap, Cpu } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-pulse [animation-duration:10s]" />
      <div className="absolute bottom-[-10%] right-[30%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none animate-pulse [animation-duration:8s]" />

      {/* Left side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10 w-full lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">FinTrac</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {/* Card */}
          <div className="glass-effect rounded-[24px] p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-white/10 dark:border-white/5 bg-card/80 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Hero/Info (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-muted/30 relative border-l border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Subtle pattern or grid background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="max-w-lg z-10 p-12">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border shadow-sm text-sm font-medium mb-8 animate-fade-in">
             <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Excellent Platform
           </div>

           <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
             Join the modern way to manage money.
           </h2>
           <p className="text-lg text-muted-foreground mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
             Thousands of users are already using FinTrac to stay on top of their budgets, track expenses, and reach their financial goals faster than ever before.
           </p>

           <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
             <div className="flex items-start gap-4">
               <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm">
                 <ShieldCheck className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <h4 className="font-semibold text-lg mb-1">Bank-grade Security</h4>
                 <p className="text-muted-foreground text-sm leading-relaxed">Your data is encrypted using top-tier security standards, ensuring completely private tracking.</p>
               </div>
             </div>
             
             <div className="flex items-start gap-4">
               <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 border border-accent/20 shadow-sm">
                 <Zap className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <h4 className="font-semibold text-lg mb-1">Lightning Fast Performance</h4>
                 <p className="text-muted-foreground text-sm leading-relaxed">Optimized infrastructure guarantees instant loading and real-time syncing across all your devices.</p>
               </div>
             </div>
             
             <div className="flex items-start gap-4">
               <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm">
                 <Cpu className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <h4 className="font-semibold text-lg mb-1">AI Bank Statement Analysis</h4>
                 <p className="text-muted-foreground text-sm leading-relaxed">No more manual entry. Let our advanced and secure AI automatically analyze your bank statements and effortlessly categorize your transactions.</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
