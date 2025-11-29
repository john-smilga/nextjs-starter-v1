```ts
// lib/http/httpClient.ts
import axios, { AxiosRequestConfig } from 'axios';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpRequestConfig = Omit<AxiosRequestConfig, 'method'> & {
  method: HttpMethod;
};

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export function normalizeError(err: unknown): string {
  // axios-like error
  if (axios.isAxiosError(err)) {
    const e = err;

    return (
      e.response?.data?.message ||
      e.response?.data?.error ||
      e.message ||
      'Unexpected server error'
    );
  }

  if (err instanceof Error) {
    return err.message || 'Something went wrong';
  }

  return 'Something went wrong';
}

export async function httpRequest<T>(config: HttpRequestConfig): Promise<T> {
  try {
    const res = await axiosInstance.request<T>(config);
    return res.data;
  } catch (err) {
    throw normalizeError(err); // always a string
  }
}

```

```tsx
// features/auth/store/authStore.ts
import { create } from 'zustand';

export type User = {
  id: string;
  email: string;
  name: string;
}

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

```

```tsx
// features/auth/queries/useLoginMutation.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { httpRequest } from '@/lib/http/httpClient';
import { useAuthStore, User } from '../store/authStore';

export interface LoginPayload {
  email: string;
  password: string;
}

async function loginRequest(payload: LoginPayload): Promise<User> {
  return httpRequest<User>({
    url: '/auth/login',
    method: 'POST',
    data: payload,
  });
}

export function useLoginMutation() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  // TData = User, TError = string, TVariables = LoginPayload
  return useMutation<User, string, LoginPayload>({
    mutationKey: ['auth', 'login'],
    mutationFn: loginRequest,
    onSuccess: (user) => {
      setUser(user);
      router.push('/dashboard'); // central routing here
    },
  });
}


```

```tsx
// app/login/page.tsx (Next App Router)
'use client';

import { FormEvent, useState } from 'react';
import { useLoginMutation } from '@/features/auth/queries/useLoginMutation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const {
    mutate: login,
    isPending,
    error: serverError, // string | undefined
  } = useLoginMutation();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError('Please enter email and password.');
      return;
    }

    login({ email, password });
  }

  const isSubmitDisabled = isPending || !email.trim() || !password.trim();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold">Login</h1>

        {/* client-side validation error */}
        {formError && (
          <p className="mb-2 text-sm text-red-500">
            {formError}
          </p>
        )}

        {/* server-side error from React Query (already a string) */}
        {serverError && (
          <p className="mb-2 text-sm text-red-500">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="mt-2 w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

```