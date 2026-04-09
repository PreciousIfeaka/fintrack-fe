import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { api } from '@/lib/api';
import { ExpenseByCategory, BudgetByCategory, Income, ExpenseCategory, EXPENSE_CATEGORIES } from '@/lib/types';
import { Loader2, TrendingUp, TrendingDown, PiggyBank, PieChart as PieChartIcon } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface CategoricalChartsProps {
  month?: string;
  year?: number;
  currency: string;
  locale: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 72%, 45%)', // Success-ish
  'hsl(348, 83%, 47%)', // Destructive-ish
  'hsl(280, 80%, 60%)', // Purple
  'hsl(45, 90%, 45%)',  // Amber
  'hsl(190, 70%, 50%)', // Cyan
  'hsl(320, 70%, 60%)', // Pink
  'hsl(25, 80%, 50%)',  // Orange
  'hsl(160, 60%, 45%)', // Emerald
  'hsl(217, 91%, 60%)', // Blue
  'hsl(10, 60%, 40%)',  // Sienna
  'hsl(200, 80%, 40%)', // Azure
  'hsl(340, 60%, 65%)', // Rose
];

export function CategoricalCharts({ month, year, currency, locale }: CategoricalChartsProps) {
  const [expenses, setExpenses] = useState<ExpenseByCategory[]>([]);
  const [budgets, setBudgets] = useState<BudgetByCategory[]>([]);
  const [incomes, setIncomes] = useState<{ source: string, total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol'
    }).format(amount);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expenseData, budgetData, incomeData] = await Promise.all([
          api.getExpensesByCategory(month, year),
          api.getBudgetsByCategory(month, year),
          api.getIncomesForChart(month, year),
        ]);

        setExpenses(expenseData);
        setBudgets(budgetData);

        // Group incomes by source
        const incomeGroups = incomeData.reduce((acc, curr) => {
          const source = curr.source || 'Other';
          acc[source] = (acc[source] || 0) + curr.amount;
          return acc;
        }, {} as Record<string, number>);

        setIncomes(Object.entries(incomeGroups).map(([source, total]) => ({ source, total })));
      } catch (error) {
        console.error('Error fetching categorical data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  const renderDonutChart = (data: any[], dataKey: string, nameKey: string, title: string, icon: React.ReactNode) => (
    <div className="premium-card p-6 flex flex-col h-[400px]">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <div className="flex-1 w-full h-full min-h-0">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey={dataKey}
                nameKey={nameKey}
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  borderColor: 'hsl(var(--border))', 
                  backgroundColor: 'hsl(var(--card))',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Total']}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                formatter={(value) => {
                  const category = EXPENSE_CATEGORIES.find(c => c.value === value);
                  return category ? category.label : value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <PieChartIcon className="w-12 h-12 mb-2" />
            <p>No data available for this period</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 mt-8">
      {renderDonutChart(expenses, 'total', 'category', 'Expenses by Category', <TrendingDown className="w-5 h-5" />)}
      {renderDonutChart(incomes, 'total', 'source', 'Incomes by Source', <TrendingUp className="w-5 h-5" />)}
      {renderDonutChart(budgets, 'total', 'category', 'Budget Allocation', <PiggyBank className="w-5 h-5" />)}
    </div>
  );
}
