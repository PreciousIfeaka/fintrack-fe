import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Loader2, ArrowRight, ShieldCheck, Zap, Cpu, Calendar, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { Currency, CurrentMonthSummary, WeeklyTotal } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { MonthPicker } from '@/components/ui/month-picker';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<CurrentMonthSummary | null>(null);
  const [weeklyTotals, setWeeklyTotals] = useState<WeeklyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [summaryData, weeklyData] = await Promise.all([
        api.getCurrentMonthSummary(selectedMonth),
        api.getWeeklyTotals(selectedMonth),
      ]);
      setSummary(summaryData);
      setWeeklyTotals(weeklyData);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, selectedMonth]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background selection:bg-primary/30 flex flex-col overflow-x-hidden relative">
        {/* Animated Background Gradients & Glows */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-pulse [animation-duration:10s]" />
        <div className="absolute top-[20%] -right-[200px] w-[500px] h-[500px] rounded-full bg-accent/30 blur-[100px] pointer-events-none animate-pulse [animation-duration:8s]" />
        
        {/* Navbar */}
        <header className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">FinTrac</span>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/login')} variant="ghost" className="font-medium hover:bg-primary/10 transition-colors">Sign In</Button>
            <Button onClick={() => navigate('/register')} className="font-medium shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">Get Started</Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 w-full max-w-6xl mx-auto pt-16 pb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            v2.0 New Generation Finance
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-fade-in leading-[1.1]">
            Master your money with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent">complete clarity.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl animate-fade-in leading-relaxed">
            Track your income, manage expenses, and set powerful budgets. All your finances unified in one beautiful, intelligent dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in w-full sm:w-auto">
            <Button onClick={() => navigate('/register')} size="lg" className="h-14 px-8 text-base shadow-elevation-2 hover:shadow-elevation-3 hover:scale-105 transition-all duration-200 gap-2">
              Start for free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button onClick={() => navigate('/login')} variant="outline" size="lg" className="h-14 px-8 text-base bg-background/50 backdrop-blur-md hover:bg-accent/50 transition-all duration-200">
              Go to Dashboard
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-32 animate-fade-in">
            {[
              { title: 'Lightning Fast', icon: Zap, desc: 'Add transactions in seconds with our optimized and responsive UI.' },
              { title: 'Visual Insights', icon: TrendingUp, desc: 'Beautiful charts help you understand where exactly your money goes.' },
              { title: 'Bank-grade Security', icon: ShieldCheck, desc: 'Your financial data is completely secure, encrypted, and safe at all times.' },
              { title: 'AI Analysis', icon: Cpu, desc: 'Automatically analyse bank statements and smartly categorize transactions using secure AI.' },
            ].map((f, i) => (
              <div key={i} className="glass-effect rounded-2xl p-8 text-left hover:-translate-y-2 hover:shadow-elevation-2 transition-all duration-200 group border border-border/50">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-200 shadow-inner">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const userCurrency = (user?.currency as Currency) ?? 'NGN';
  const locale = userCurrency == 'NGN' ? 'en-NG' : 'en-US';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: userCurrency,
      currencyDisplay: 'symbol'
    }).format(amount);
  };

  const chartData = summary ? [
    { name: 'Income', amount: summary.totalIncome, fill: 'hsl(var(--success))' },
    { name: 'Expenses', amount: summary.totalExpense, fill: 'hsl(var(--destructive))' },
    { name: 'Budget', amount: summary.totalBudget, fill: 'hsl(var(--primary))' },
  ] : [];

  const [y, m] = selectedMonth.split('-').map(Number);
  const displayDate = new Date(y, m - 1);
  const formattedMonth = displayDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout 
      title={`Welcome back, ${user?.name?.split(' ')[0]}!`} 
      description={`Viewing financial data for ${formattedMonth}.`}
    >
      {loading ? (
        <div className="space-y-8 animate-fade-in w-full">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
             <Skeleton className="h-11 w-44 rounded-xl" />
             <Skeleton className="hidden lg:block h-8 w-40 rounded-full" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
             <Skeleton className="h-[188px] w-full rounded-2xl" />
             <Skeleton className="h-[188px] w-full rounded-2xl" />
             <Skeleton className="h-[188px] w-full rounded-2xl" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
             <Skeleton className="h-[400px] w-full rounded-2xl" />
             <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
        </div>

      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-xl border border-border/50 backdrop-blur-md shadow-inner">
                <MonthPicker
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  className="border-none bg-transparent shadow-none w-44"
                />
              </div>
              <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={fetchStats}
                  className="rounded-xl hover:bg-muted/50 transition-colors h-11 w-11 border border-border/50"
                  title="Refresh data"
                >
                <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-background/50 px-3 py-1.5 rounded-full border border-border/40">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Real-time Analytics
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: 'Total Budget', value: summary?.totalBudget || 0, icon: PiggyBank, color: 'text-primary', bg: 'bg-primary/10', path: '/budgets', border: 'border-primary/20', trend: summary?.budgetPercentageChange || 0 },
              { label: 'Total Income', value: summary?.totalIncome || 0, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', path: '/income', border: 'border-success/20', trend: summary?.incomePercentageChange || 0 },
              { label: 'Total Expenses', value: summary?.totalExpense || 0, icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10', path: '/expenses', border: 'border-destructive/20', trend: summary?.expensePercentageChange || 0 },
            ].map((item, i) => {
              const trendPrefix = item.trend > 0 ? '+' : '';
              const trendColor = item.label === 'Total Expenses' 
                ? (item.trend > 0 ? 'text-destructive' : 'text-success')
                : (item.trend > 0 ? 'text-success' : 'text-destructive');
              return (
              <div
                key={i}
                onClick={() => navigate(item.path)}
                className={`premium-card p-6 cursor-pointer border ${item.border} group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-sm font-semibold text-muted-foreground">{item.label}</span>
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-extrabold tracking-tight mb-1">{formatCurrency(item.value)}</h2>
                  <p className={`text-sm font-medium ${trendColor}`}>
                    {trendPrefix}{item.trend}% from last month
                  </p>
                </div>
                <div className="mt-5 h-1.5 w-full bg-secondary rounded-full overflow-hidden relative z-10">
                  <div className={`h-full ${item.bg.replace('/10', '')} w-2/3 rounded-full opacity-60 group-hover:opacity-100 transition-opacity`} />
                </div>
              </div>
            )})}
          </div>

          {/* Charts Area */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="premium-card p-6 flex flex-col h-[400px]">
               <h3 className="text-lg font-bold mb-6">Overview</h3>
               <div className="flex-1 w-full h-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} width={80} tickFormatter={(val) => new Intl.NumberFormat(locale, { notation: "compact", compactDisplay: "short" }).format(val)} />
                     <Tooltip 
                       cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
                       contentStyle={{ borderRadius: '12px', borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                       formatter={(value: number) => [formatCurrency(value), 'Amount']}
                     />
                     <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                       {chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.fill} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
            
             <div className="premium-card p-6 flex flex-col h-[400px]">
               <h3 className="text-lg font-bold mb-6">Monthly Trend</h3>
               <div className="flex-1 w-full h-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={weeklyTotals} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                     <defs>
                       <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                     <XAxis dataKey="weekName" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} width={60} tickFormatter={(val) => new Intl.NumberFormat(locale, { notation: "compact", compactDisplay: "short" }).format(val)} />
                     <Tooltip
                       contentStyle={{ borderRadius: '12px', borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                       formatter={(value: number) => [formatCurrency(value)]}
                     />
                     <Area type="monotone" dataKey="income" stroke="hsl(var(--success))" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                     <Area type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
