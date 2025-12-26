import {
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  PagedBudgetResponse,
  MonthlyBudgetStats,
  Income,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  PagedIncomeResponse,
  MonthlyIncomeStats,
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  PagedExpenseResponse,
  MonthlyExpenseStats,
  UpdateProfileRequest,
  ChangePasswordRequest,
  PagedUserResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  status: 'Success' | 'Failed';
  message: string;
  data?: T;
  statusCode?: number;
}

interface ValidationError {
  field: string;
  message: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  currency: string | null;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  verified: boolean;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
}

class ApiError extends Error {
  statusCode?: number;
  validationErrors?: ValidationError[];

  constructor(message: string, statusCode?: number, validationErrors?: ValidationError[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok || data.status === 'Failed') {
    // Handle 401 Unauthorized - session expired or invalid token
    if (response.status === 401) {
      localStorage.removeItem('finance_tracker_token');
      localStorage.removeItem('finance_tracker_user');
      window.location.href = '/login';
      throw new ApiError('Session expired. Please log in again.', 401);
    }

    if (data.errors) {
      throw new ApiError(
        'Validation failed',
        response.status,
        data.errors
      );
    }
    throw new ApiError(
      data.message || 'An error occurred',
      data.statusCode || response.status
    );
  }

  return data.data;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('finance_tracker_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const api = {
  // Auth endpoints
  async register(fullName: string, email: string, password: string, confirmPassword: string): Promise<UserResponse> {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password, confirmPassword }),
    });

    return handleResponse<UserResponse>(response);
  },

  async verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    return handleResponse<AuthResponse>(response);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    return handleResponse<AuthResponse>(response);
  },

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    return handleResponse<void>(response);
  },

  async resetPassword(otp: string, password: string, confirmPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, password, confirmPassword }),
    });

    return handleResponse<void>(response);
  },

  async resendOtp(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    return handleResponse<void>(response);
  },

  // Budget endpoints
  async createBudget(data: CreateBudgetRequest): Promise<Budget> {
    const response = await fetch(`${API_BASE_URL}/api/v1/budgets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Budget>(response);
  },

  async updateBudget(id: string, data: UpdateBudgetRequest): Promise<Budget> {
    const response = await fetch(`${API_BASE_URL}/api/v1/budgets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Budget>(response);
  },

  async getBudget(id: string): Promise<Budget> {
    const response = await fetch(`${API_BASE_URL}/api/v1/budgets/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<Budget>(response);
  },

  async getBudgetsByMonth(page = 1, limit = 10, month?: string): Promise<PagedBudgetResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (month) params.append('date', month);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/budgets/month?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedBudgetResponse>(response);
  },

  async getAllBudgets(page = 1, limit = 10): Promise<PagedBudgetResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/budgets?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedBudgetResponse>(response);
  },

  async deleteBudget(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/budgets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },

  async getMonthlyBudgetStats(): Promise<MonthlyBudgetStats[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/budgets/monthly-totals`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<MonthlyBudgetStats[]>(response);
  },

  // Income endpoints
  async createIncome(data: CreateIncomeRequest): Promise<Income> {
    const response = await fetch(`${API_BASE_URL}/api/v1/incomes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Income>(response);
  },

  async updateIncome(id: string, data: UpdateIncomeRequest): Promise<Income> {
    const response = await fetch(`${API_BASE_URL}/api/v1/incomes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Income>(response);
  },

  async getIncome(id: string): Promise<Income> {
    const response = await fetch(`${API_BASE_URL}/api/v1/incomes/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<Income>(response);
  },

  async getIncomesByMonth(page = 1, limit = 10, month?: string): Promise<PagedIncomeResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (month) params.append('date', month);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/incomes/month?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedIncomeResponse>(response);
  },

  async getAllIncomes(page = 1, limit = 10): Promise<PagedIncomeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/incomes?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedIncomeResponse>(response);
  },

  async deleteIncome(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/incomes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },

  async getMonthlyIncomeStats(): Promise<MonthlyIncomeStats[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/incomes/monthly-totals`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<MonthlyIncomeStats[]>(response);
  },

  // Expense endpoints
  async createExpense(data: CreateExpenseRequest): Promise<Expense> {
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Expense>(response);
  },

  async updateExpense(id: string, data: UpdateExpenseRequest): Promise<Expense> {
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Expense>(response);
  },

  async getExpense(id: string): Promise<Expense> {
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<Expense>(response);
  },

  async getExpensesByMonth(page = 1, limit = 10, month?: string): Promise<PagedExpenseResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (month) params.append('date', month);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses/month?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedExpenseResponse>(response);
  },

  async getAllExpenses(page = 1, limit = 10): Promise<PagedExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedExpenseResponse>(response);
  },

  async deleteExpense(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },

  async getMonthlyExpenseStats(): Promise<MonthlyExpenseStats[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses/monthly-totals`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<MonthlyExpenseStats[]>(response);
  },

  // User endpoints
  async getMyProfile(): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<UserResponse>(response);
  },

  async getAllUsers(page = 0, limit = 10): Promise<PagedUserResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedUserResponse>(response);
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    console.log(API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/api/v1/users/update-profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<UserResponse>(response);
  },

  async changePassword(data: ChangePasswordRequest): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<UserResponse>(response);
  },

  async deleteAccount(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },

  // Upload endpoints
  async uploadAvatar(file: File): Promise<{ fileUrl: string }> {
    const token = localStorage.getItem('finance_tracker_token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/v1/uploads`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    return handleResponse<{ fileUrl: string }>(response);
  },
};

export { ApiError };
