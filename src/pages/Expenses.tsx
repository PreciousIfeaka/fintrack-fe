import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MonthPicker } from '@/components/ui/month-picker';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api, ApiError, lastApiMessage } from '@/lib/api';
import { Currency, Expense, EXPENSE_CATEGORIES, ExpenseCategory } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Loader2,
  TrendingDown
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialogue';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Expenses() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExpense, setTotalExpense] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [pageInput, setPageInput] = useState('1');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('all');
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [transactionDateTime, setTransactionDateTime] = useState('');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await api.getExpensesByMonth(page, 10, selectedMonth, filterCategory);
      setExpenses(data.expenses);
      setTotalPages(Math.ceil(data.total / data.limit));
      setTotalExpense(data.totalExpenses ?? 0);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    setPageInput(String(page));
  }, [page, selectedMonth, filterCategory]);

  const handlePageJump = () => {
    const p = parseInt(pageInput);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setPage(p);
    } else {
      setPageInput(String(page));
    }
  };

  const openCreateDialog = () => {
    setEditingExpense(null);
    setAmount('');
    setCategory('all');
    setNote('');
    setIsRecurring(false);
    setTransactionDateTime('');
    setDialogOpen(true);
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setNote(expense.note || '');
    setIsRecurring(expense.isRecurring);
    setTransactionDateTime(expense.transactionDateTime ? expense.transactionDateTime.slice(0, 16) : '');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    try {
      setSubmitting(true);
      if (editingExpense) {
        await api.updateExpense(editingExpense.id, {
          amount: parseFloat(amount),
          category,
          note: note.trim() || undefined,
          isRecurring,
          transactionDateTime: transactionDateTime || undefined,
        });
        toast({ title: 'Success', description: lastApiMessage || 'Expense updated successfully' });
      } else {
        await api.createExpense({
          amount: parseFloat(amount),
          category,
          note: note.trim() || undefined,
          isRecurring,
          transactionDateTime: transactionDateTime || undefined,
        });
        toast({ title: 'Success', description: lastApiMessage || 'Expense added successfully' });
      }
      setDialogOpen(false);
      fetchExpenses();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingExpense) return;

    try {
      setSubmitting(true);
      await api.deleteExpense(deletingExpense.id);
      toast({ title: 'Success', description: lastApiMessage || 'Expense deleted successfully' });
      setDeleteDialogOpen(false);
      setDeletingExpense(null);
      fetchExpenses();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      setSubmitting(true);
      await api.deleteSelectedExpenses(selectedIds);
      toast({ title: 'Success', description: lastApiMessage || 'Expenses deleted successfully' });
      setBulkDeleteDialogOpen(false);
      setSelectedIds([]);
      fetchExpenses();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === expenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(expenses.map(e => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleRowClick = async (expense: Expense) => {
    try {
      const data = await api.getExpense(expense.id);
      setViewingExpense(data);
      setDetailsDialogOpen(true);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  const getCategoryLabel = (cat: ExpenseCategory) => {
    return EXPENSE_CATEGORIES.find(c => c.value === cat)?.label || cat;
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
    <DashboardLayout title="Expenses" description="Track your spending">
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
          <Select value={filterCategory} onValueChange={(val) => { setFilterCategory(val); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => {
            fetchExpenses();
            setSelectedIds([]);
          }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setBulkDeleteDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedIds.length})
            </Button>
          )}
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Total Expense Card */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
          <TrendingDown className="w-4 h-4 text-destructive" />
          Total Expenses for {selectedMonth}{filterCategory !== 'all' ? ` (${getCategoryLabel(filterCategory as ExpenseCategory)})` : ''}
        </div>
        <div className="text-3xl font-bold text-destructive">{formatCurrency(totalExpense)}</div>
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4 w-full">
          <div className="flex items-center justify-between px-2">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-1/6" />
          </div>
          <div className="space-y-3 mt-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No expenses found</h3>
          <p className="text-muted-foreground mb-4">Start tracking by adding your first expense.</p>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-center w-[50px]">
                      <Checkbox 
                        checked={expenses.length > 0 && selectedIds.length === expenses.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Note</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">Type</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedIds.includes(expense.id) ? 'bg-muted/50' : ''}`}
                      onClick={() => handleRowClick(expense)}
                    >
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedIds.includes(expense.id)}
                          onCheckedChange={() => toggleSelect(expense.id)}
                          aria-label={`Select expense from ${getCategoryLabel(expense.category)}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                          {getCategoryLabel(expense.category)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-destructive font-semibold whitespace-nowrap text-center">
                        -{formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm hidden sm:table-cell whitespace-nowrap text-center">
                        {formatDate(expense.transactionDateTime)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm hidden md:table-cell max-w-[150px] truncate text-center">
                        {expense.note || '-'}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        {expense.isRecurring ? (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
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
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(expense)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingExpense(expense);
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Page</span>
                <Input
                  className="w-12 h-8 px-1 text-center"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={handlePageJump}
                  onKeyDown={(e) => e.key === 'Enter' && handlePageJump()}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">of {totalPages}</span>
              </div>
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
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            <DialogDescription>
              {editingExpense
                ? 'Update your expense details below.'
                : 'Record a new expense.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as ExpenseCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {editingExpense ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {viewingExpense && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                    {getCategoryLabel(viewingExpense.category)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-destructive">-{formatCurrency(viewingExpense.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Date</p>
                  <p className="text-sm">{formatDate(viewingExpense.transactionDateTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="text-sm">{viewingExpense.isRecurring ? 'Recurring' : 'One-time'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Note</p>
                  <p className="text-sm">{viewingExpense.note || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDate(viewingExpense.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated</p>
                  <p className="text-sm">{formatDate(viewingExpense.updatedAt)}</p>
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
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
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
      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Expenses</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected expense records? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
