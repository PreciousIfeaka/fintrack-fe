import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TransactionList } from '@/components/TransactionList';
import { api } from '@/lib/api';
import { Transaction, TransactionDirection, MonthlyTransactionStats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

export default function Transactions() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [monthFilter, setMonthFilter] = useState('');
  const [directionFilter, setDirectionFilter] = useState<TransactionDirection | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Monthly totals
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTransactionStats[]>([]);
  const [loadingTotals, setLoadingTotals] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions(
        page,
        limit,
        monthFilter || undefined,
        directionFilter === 'all' ? undefined : directionFilter
      );
      setTransactions(data.transactions);
      setBalance(data.balance);
      setTotal(data.total);
    } catch {
      // Error handled by API
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyTotals = async () => {
    setLoadingTotals(true);
    try {
      const data = await api.getMonthlyTransactionTotals();
      setMonthlyTotals(data);
    } catch {
      // Error handled by API
    } finally {
      setLoadingTotals(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, page, monthFilter, directionFilter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMonthlyTotals();
    }
  }, [isAuthenticated]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const clearFilters = () => {
    setMonthFilter('');
    setDirectionFilter('all');
    setPage(1);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const hasActiveFilters = monthFilter || directionFilter !== 'all';

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout
      title="Transactions"
      description="View and manage all your financial transactions"
    >
      <div className="space-y-6">
        {/* Monthly Totals Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Monthly Totals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTotals ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : monthlyTotals.length === 0 ? (
              <div className="text-muted-foreground">No monthly data available</div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {monthlyTotals.map((stat) => (
                  <div
                    key={stat.month}
                    className="bg-accent/50 rounded-lg px-4 py-2 min-w-[140px]"
                  >
                    <p className="text-sm text-muted-foreground">{formatMonth(stat.month)}</p>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(stat.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {(monthFilter ? 1 : 0) + (directionFilter ? 1 : 0)}
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <Card className="animate-fade-in">
            <CardContent className="pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="month-filter">Month</Label>
                  <Input
                    id="month-filter"
                    type="month"
                    value={monthFilter}
                    onChange={(e) => {
                      setMonthFilter(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Select month"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direction-filter">Transaction Type</Label>
                  <Select
                    value={directionFilter}
                    onValueChange={(v) => {
                      setDirectionFilter(v as TransactionDirection | 'all');
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="credit">Credit (Income)</SelectItem>
                      <SelectItem value="debit">Debit (Expense)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction List */}
        <TransactionList
          transactions={transactions}
          balance={balance}
          page={page}
          limit={limit}
          total={total}
          loading={loading}
          onPageChange={handlePageChange}
          onRefresh={fetchTransactions}
        />
      </div>
    </DashboardLayout>
  );
}

const formatMonth = (monthString: string) => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, 'MMM, yyyy');
};