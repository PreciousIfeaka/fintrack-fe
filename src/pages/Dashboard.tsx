import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ income: 0, expenses: 0, budget: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchStats = async () => {
        try {
          const [incomeData, expenseData, budgetData] = await Promise.all([
            api.getIncomesByMonth(1, 1),
            api.getExpensesByMonth(1, 1),
            api.getBudgetsByMonth(1, 1),
          ]);
          setStats({
            income: incomeData.totalIncome || 0,
            expenses: expenseData.totalExpenses || 0,
            budget: budgetData.totalBudget || 0,
          });
        } catch { /* ignore */ } finally { setLoading(false); }
      };
      fetchStats();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
        <div className="text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-3">FinTrack</h1>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Take control of your finances with our simple and powerful tracking tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/login')} variant="outline" size="lg">Sign in</Button>
            <Button onClick={() => navigate('/register')} size="lg">Create account</Button>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <DashboardLayout title={`Welcome back, ${user?.name?.split(' ')[0]}!`} description="Here's your financial overview.">
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Total Budget', value: stats.budget, icon: PiggyBank, color: 'text-primary' },
            { label: 'Income', value: stats.income, icon: TrendingUp, color: 'text-success' },
            { label: 'Expenses', value: stats.expenses, icon: TrendingDown, color: 'text-destructive' },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
              </div>
              <div className={`text-2xl font-bold ${item.color}`}>{formatCurrency(item.value)}</div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
