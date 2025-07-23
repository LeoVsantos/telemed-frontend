"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/brand-logo'; // Moved import to top
import apiClient from '@/lib/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true); 

    try {
      const response = await apiClient.post('/auth', { email, password });
      const { user, token, refreshToken } = response.data; 

      // Store tokens (localStorage for simplicity, consider secure cookies for production)
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));


      // Redirect based on role
      if (user.role === 'doctor') {
        router.push('/doctor/dashboard');
      } else if (user.role === 'patient') {
        router.push('/patient/dashboard'); // Assuming a patient dashboard exists
      } else {
        // Handle other roles or a default redirect
        router.push('/');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); 
      } else {
        setError('Falha no login. Por favor, tente novamente.'); 
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md sm:p-8">
        <div className="flex justify-center mb-6">
          <BrandLogo className="h-16 w-auto" />
        </div>
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-700 sm:text-3xl">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
              placeholder="********"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button 
            type="submit" 
            className="w-full flex justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75"
            disabled={isLoading} 
          >
            {isLoading ? 'Entrando...' : 'Entrar'} 
          </button>
        </form>
      </div>
    </div>
  );
}
