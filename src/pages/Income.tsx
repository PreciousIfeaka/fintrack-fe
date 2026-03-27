import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MonthPicker } from '@/components/ui/month-picker';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api, ApiError, lastApiMessage } from '@/lib/api';
import { Currency, CURRENCY_LOCALE_MAP, Income } from '@/lib/types';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Loader2,
  TrendingUp,
  Search,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialogue'
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function IncomePage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIncome, setTotalIncome] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filterSource, setFilterSource] = useState('');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);
  const [viewingIncome, setViewingIncome] = useState<Income | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [transactionDateTime, setTransactionDateTime] = useState('');

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const data = await api.getIncomesByMonth(page, 10, selectedMonth);
      setIncomes(data.income);
      setTotalPages(Math.ceil(data.total / data.limit));
      setTotalIncome(data.totalIncome);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [page, selectedMonth]);

  // Frontend source filter
  const filteredIncomes = useMemo(() => {
    if (!filterSource.trim()) return incomes;
    return incomes.filter(i =>
      i.source.toLowerCase().includes(filterSource.toLowerCase())
    );
  }, [incomes, filterSource]);

  const openCreateDialog = () => {
    setEditingIncome(null);
    setAmount('');
    setSource('');
    setNote('');
    setIsRecurring(false);
    setTransactionDateTime('');
    setDialogOpen(true);
  };

  const openEditDialog = (income: Income) => {
    setEditingIncome(income);
    setAmount(String(income.amount));
    setSource(income.source);
    setNote(income.note || '');
    setIsRecurring(income.isRecurring);
    setTransactionDateTime(income.transactionDateTime ? income.transactionDateTime.slice(0, 16) : '');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }
    if (!source.trim()) {
      toast({ title: 'Error', description: 'Please enter an income source', variant: 'destructive' });
      return;
    }

    try {
      setSubmitting(true);
      if (editingIncome) {
        await api.updateIncome(editingIncome.id, {
          amount: parseFloat(amount),
          source: source.trim(),
          note: note.trim() || undefined,
          isRecurring,
          transactionDateTime: transactionDateTime || undefined,
        });
        toast({ title: 'Success', description: lastApiMessage || 'Income updated successfully' });
      } else {
        await api.createIncome({
          amount: parseFloat(amount),
          source: source.trim(),
          note: note.trim() || undefined,
          isRecurring,
          transactionDateTime: transactionDateTime || undefined,
        });
        toast({ title: 'Success', description: lastApiMessage || 'Income added successfully' });
      }
      setDialogOpen(false);
      fetchIncomes();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingIncome) return;

    try {
      setSubmitting(true);
      await api.deleteIncome(deletingIncome.id);
      toast({ title: 'Success', description: lastApiMessage || 'Income deleted successfully' });
      setDeleteDialogOpen(false);
      setDeletingIncome(null);
      fetchIncomes();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRowClick = (income: Income) => {
    setViewingIncome(income);
    setDetailsDialogOpen(true);
  };

  const userCurrency = (user?.currency as Currency) ?? 'NGN';
  const locale = userCurrency == 'NGN'
    ? 'en-NG'
    : 'en-US';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: userCurrency,
      currencyDisplay: 'symbol'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return dateString || '-';
    }
  };

  return (
    <DashboardLayout title="Income" description="Track your income sources">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <MonthPicker
            value={selectedMonth}
            onChange={(val) => {
              setSelectedMonth(val);
              setPage(1);
            }}
          />
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by source..."
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="pl-8 w-[180px]"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchIncomes}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Income
        </Button>
      </div>

      {/* Total Income Card */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
          <TrendingUp className="w-4 h-4 text-success" />
          Total Income for {selectedMonth}
        </div>
        <div className="text-3xl font-bold text-success">{formatCurrency(totalIncome)}</div>
      </div>

      {/* Income List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredIncomes.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No income records found</h3>
          <p className="text-muted-foreground mb-4">
            {filterSource ? 'No records match your filter.' : 'Start tracking your income by adding your first entry.'}
          </p>
          {!filterSource && (
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Income
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Source</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Note</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">Type</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredIncomes.map((income) => (
                    <tr
                      key={income.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(income)}
                    >
                      <td className="px-4 py-3 text-foreground font-medium text-center">{income.source}</td>
                      <td className="px-4 py-3 text-success font-semibold whitespace-nowrap text-center">{formatCurrency(income.amount)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-sm hidden sm:table-cell whitespace-nowrap text-center">
                        {formatDate(income.transactionDateTime)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm hidden md:table-cell max-w-[150px] truncate text-center">
                        {income.note || '-'}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        {income.isRecurring ? (
                          <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                            Recurring
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                            One-time
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(income)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingIncome(income);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIncome ? 'Edit Income' : 'Add Income'}</DialogTitle>
            <DialogDescription>
              {editingIncome
                ? 'Update your income details below.'
                : 'Record a new income entry.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                placeholder="e.g., Salary, Freelance, etc."
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transactionDate">Transaction Date</Label>
              <Input
                id="transactionDate"
                type="datetime-local"
                value={transactionDateTime}
                onChange={(e) => setTransactionDateTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="recurring">Recurring monthly</Label>
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingIncome ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Income Details</DialogTitle>
          </DialogHeader>
          {viewingIncome && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Source</p>
                  <p className="font-medium">{viewingIncome.source}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-success">{formatCurrency(viewingIncome.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Date</p>
                  <p className="text-sm">{formatDate(viewingIncome.transactionDateTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="text-sm">{viewingIncome.isRecurring ? 'Recurring' : 'One-time'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Note</p>
                  <p className="text-sm">{viewingIncome.note || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDate(viewingIncome.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated</p>
                  <p className="text-sm">{formatDate(viewingIncome.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
