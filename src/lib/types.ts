// Expense Categories from backend
export type ExpenseCategory = 
  | 'food'
  | 'clothing'
  | 'entertainment'
  | 'utilities'
  | 'healthcare'
  | 'education'
  | 'shopping'
  | 'housing'
  | 'transportation'
  | 'personal'
  | 'all'
  | 'miscellaneous'

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'housing', label: 'Housing' },
  { value: 'personal', label: 'Personal' },
  { value: 'miscellaneous', label: 'Misc.' },
  { value: 'all', label: 'All' }
];

// Budget Types
export interface Budget {
  id: string;
  amount: number;
  category: ExpenseCategory;
  month: string; // YearMonth format "2024-01"
  isExceeded: boolean | null;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  amount: number;
  category: ExpenseCategory;
  isRecurring: boolean;
}

export interface UpdateBudgetRequest {
  amount?: number;
  category?: ExpenseCategory;
  isRecurring?: boolean;
}

export interface PagedBudgetResponse {
  budgets: Budget[];
  page: number;
  limit: number;
  total: number;
  totalBudget: number;
}

export interface MonthlyBudgetStats {
  month: string;
  total: number;
}

// Income Types
export interface Income {
  id: string;
  amount: number;
  source: string;
  note: string | null;
  isRecurring: boolean;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeRequest {
  amount: number;
  source: string;
  isRecurring: boolean;
  note?: string;
}

export interface UpdateIncomeRequest {
  amount?: number;
  source?: string;
  isRecurring?: boolean;
  note?: string;
}

export interface PagedIncomeResponse {
  income: Income[];
  totalIncome: number;
  page: number;
  limit: number;
  total: number;
}

export interface MonthlyIncomeStats {
  month: string;
  total: number;
}

// Expense Types
export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  note: string | null;
  isRecurring: boolean;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  amount: number;
  category: ExpenseCategory;
  isRecurring: boolean;
  note?: string;
}

export interface UpdateExpenseRequest {
  amount?: number;
  category?: ExpenseCategory;
  isRecurring?: boolean;
  note?: string;
}

export interface PagedExpenseResponse {
  expenses: Expense[];
  totalExpenses: number;
  page: number;
  limit: number;
  total: number;
}

export interface MonthlyExpenseStats {
  month: string;
  total: number;
}

// Currency enum
export type Currency = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'JPY' | 'CAD' | 'AUD';

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
];

export const CURRENCY_LOCALE_MAP: Record<Currency, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  NGN: "en-NG",
  JPY: "ja-JP",
  CAD: "en-CA",
  AUD: "en-AU"
};

// User Types
export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
  currency?: Currency;
}

export interface ChangePasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface PagedUserResponse {
  users: {
    id: string;
    name: string;
    email: string;
    currency: Currency | null;
    role: string;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
    verified: boolean;
  }[];
  page: number;
  limit: number;
  total: number;
}
