import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MonthPicker } from '@/components/ui/month-picker';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api, ApiError, lastApiMessage } from '@/lib/api';
import { BankStatement, DocumentUrls } from '@/lib/types';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  FileText,
  Play,
  Pencil,
  X,
  ExternalLink,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialogue';

export default function BankStatementsPage() {
  const { toast } = useToast();

  const [statements, setStatements] = useState<BankStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStatement, setEditingStatement] = useState<BankStatement | null>(null);
  const [deletingStatement, setDeletingStatement] = useState<BankStatement | null>(null);
  const [analyzingStatement, setAnalyzingStatement] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingDocs, setExistingDocs] = useState<DocumentUrls[]>([]);
  const [deletedDocs, setDeletedDocs] = useState<DocumentUrls[]>([]);
  const [viewingStatement, setViewingStatement] = useState<BankStatement | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Form state
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchStatements = async () => {
    try {
      setLoading(true);
      const data = await api.getAllStatements(page, 10);
      setStatements(data.statements);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, [page]);

  const openCreateDialog = () => {
    setEditingStatement(null);
    setMonth('');
    setFiles([]);
    setExistingDocs([]);
    setDeletedDocs([]);
    setDialogOpen(true);
  };

  const openEditDialog = async (id: string) => {
    try {
      setLoading(true);
      const data = await api.getStatement(id);
      setEditingStatement(data);
      setMonth(data.month);
      setExistingDocs(data.documentUrls || []);
      setDeletedDocs([]);
      setFiles([]);
      setDialogOpen(true);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!month) {
      toast({ title: 'Error', description: 'Please select a month', variant: 'destructive' });
      return;
    }
    if (files.length === 0 && (!editingStatement || existingDocs.length === 0)) {
      toast({ title: 'Error', description: 'Please provide at least one document', variant: 'destructive' });
      return;
    }

    try {
      setSubmitting(true);
      setIsUploading(true);

      const uploadedDocs = files.length > 0 ? await Promise.all(
        files.map(file => api.uploadDocument(file))
      ) : [];

      setIsUploading(false);

      const newDocs: DocumentUrls[] = uploadedDocs.map(doc => ({ url: doc.fileUrl, mimeType: doc.mimeType }));

      if (editingStatement) {
        await api.updateStatement(editingStatement.id, {
          month: month !== editingStatement.month ? month : undefined,
          documentUrls: newDocs.length > 0 ? newDocs : undefined,
          deleteDocuments: deletedDocs.length > 0 ? deletedDocs : undefined,
        });
        toast({ title: 'Success', description: lastApiMessage || 'Bank Statement updated successfully' });
      } else {
        await api.createStatement({
          month,
          documentUrls: newDocs,
        });
        toast({ title: 'Success', description: lastApiMessage || 'Bank Statement added successfully' });
      }
      setDialogOpen(false);
      fetchStatements();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setIsUploading(false);
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStatement) return;

    try {
      setSubmitting(true);
      await api.deleteStatement(deletingStatement.id);
      toast({ title: 'Success', description: lastApiMessage || 'Bank Statement deleted successfully' });
      setDeleteDialogOpen(false);
      setDeletingStatement(null);
      fetchStatements();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnalyse = async (id: string) => {
    try {
      setAnalyzingStatement(id);
      const updatedStatement = await api.analyseBankStatements(id);
      toast({ title: 'Success', description: lastApiMessage || 'Analysis started successfully' });
      setStatements((prev) =>
        prev.map((stmt) => (stmt.id === updatedStatement.id ? updatedStatement : stmt))
      );
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setAnalyzingStatement(null);
    }
  };

  return (
    <DashboardLayout title="Bank Statements" description="Upload and analyse your bank statements">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <Button variant="outline" size="icon" onClick={fetchStatements}>
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Statement
        </Button>
      </div>

      {/* Statements List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : statements.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No bank statements found</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first bank statement.</p>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Statement
          </Button>
        </div>
      ) : (
        <>
          <div className="premium-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Month</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">Date Added</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {statements.map((statement) => (
                    <tr
                      key={statement.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={async () => {
                        try {
                          const data = await api.getStatement(statement.id);
                          setViewingStatement(data);
                          setDetailsDialogOpen(true);
                        } catch (error) {
                          if (error instanceof ApiError) {
                            toast({ title: 'Error', description: error.message, variant: 'destructive' });
                          }
                        }
                      }}
                    >
                      <td className="px-4 py-3 text-foreground font-medium text-center">{statement.month}</td>
                      <td className="px-4 py-3 text-center">
                        {statement.status === 'ANALYSED' ? (
                          <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                            Analysed
                          </span>
                        ) : statement.status === 'IN_PROGRESS' ? (
                          <span className="px-2 py-1 bg-primary/20 text-primary font-semibold text-xs rounded-full">
                            In Progress
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-warning/20 text-warning font-semibold text-xs rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm hidden sm:table-cell text-center">
                        {new Date(statement.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(statement.id)}
                            disabled={statement.status !== 'PENDING' || analyzingStatement === statement.id}
                            className="mr-1"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={statement.status !== 'PENDING' || analyzingStatement === statement.id}
                            onClick={() => handleAnalyse(statement.id)}
                            className="mr-2"
                          >
                            {analyzingStatement === statement.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Play className="w-4 h-4 mr-1 text-primary" />}
                            Analyse
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingStatement(statement);
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

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStatement ? 'Edit Bank Statement' : 'Add Bank Statement'}</DialogTitle>
            <DialogDescription>
              {editingStatement ? 'Modify existing bank statement documents.' : 'Record a new bank statement entry.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <MonthPicker
                id="month"
                value={month}
                onChange={(val) => setMonth(val)}
              />
            </div>
            {editingStatement && existingDocs.length > 0 && (
              <div className="space-y-2">
                <Label>Existing Documents</Label>
                <div className="flex flex-col gap-2">
                  {existingDocs.map((doc, idx) => {
                    const fileName = doc.url.split('/').pop() || doc.url;
                    const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
                    return (
                      <div key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                        <span className="text-sm truncate mr-2" title={fileName}>
                          Document {idx + 1} ({ext})
                        </span>
                        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => {
                          setExistingDocs(prev => prev.filter(d => d.url !== doc.url));
                          setDeletedDocs(prev => [...prev, doc]);
                        }}>
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="file">{editingStatement ? 'Add Additional Documents' : 'Document Files'}</Label>
              <Input
                id="file"
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
              {files.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {files.length} file(s) selected
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || isUploading}>
              {(submitting || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isUploading ? 'Uploading...' : (editingStatement ? 'Update' : 'Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Statement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this statement? This action cannot be undone.
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

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bank Statement Details</DialogTitle>
            <DialogDescription>
              Statement for {viewingStatement?.month}
            </DialogDescription>
          </DialogHeader>
          {viewingStatement && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Month</p>
                  <p className="font-medium">{viewingStatement.month}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {viewingStatement.status === 'ANALYSED' ? (
                    <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                      Analysed
                    </span>
                  ) : viewingStatement.status === 'IN_PROGRESS' ? (
                    <span className="px-2 py-1 bg-primary/20 text-primary font-semibold text-xs rounded-full">
                      In Progress
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-warning/20 text-warning font-semibold text-xs rounded-full">
                      Pending
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(viewingStatement.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated</p>
                  <p className="text-sm">{new Date(viewingStatement.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Documents ({viewingStatement.documentUrls.length})
                </p>
                <div className="flex flex-col gap-2">
                  {viewingStatement.documentUrls.map((doc, idx) => {
                    const fileName = doc.url.split('/').pop() || doc.url;
                    const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
                    return (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-muted/50 p-2 rounded-md hover:bg-muted transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">Document {idx + 1} ({ext})</span>
                        <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
