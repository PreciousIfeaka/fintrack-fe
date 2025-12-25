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

interface ValidationErrorResponse {
  errors: ValidationError[];
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
    // Check for validation errors
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

export const api = {
  async register(fullName: string, email: string, password: string, confirmPassword: string): Promise<UserResponse> {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      }),
    });

    return handleResponse<UserResponse>(response);
  },

  async verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    });

    return handleResponse<AuthResponse>(response);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    return handleResponse<AuthResponse>(response);
  },

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<void>(response);
  },

  async resetPassword(otp: string, password: string, confirmPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        otp,
        password,
        confirmPassword,
      }),
    });

    return handleResponse<void>(response);
  },

  async resendOtp(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<void>(response);
  },
};

export { ApiError };
