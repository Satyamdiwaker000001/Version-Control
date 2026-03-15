import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Github, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { AuthState } from '@/features/auth/store/useAuthStore';
import { cn } from '@/shared/utils/cn';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state: AuthState) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleSocialLogin = async (provider: string) => {
    setIsSocialLoading(provider);
    try {
      // Mock social login for now - will integrate with backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockUser = {
        id: `social_${Date.now()}`,
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        createdAt: new Date().toISOString(),
      };
      const token = btoa(JSON.stringify({ userId: mockUser.id, email: mockUser.email, provider }));
      setAuth(mockUser, token);
      toast.success(`Successfully connected with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`);
      navigate('/');
    } catch (error) {
      toast.error(`Failed to connect with ${provider}`);
    } finally {
      setIsSocialLoading(null);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await authService.login({ email: data.email, password: data.password });
      setAuth(response.user, response.token);
      toast.success('Successfully logged in');
      navigate('/');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to login');
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to your knowledge base to continue.
          </p>
        </div>

        <div className="mt-8">
          {/* Social Login Options */}
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="flex w-full justify-center items-center gap-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-300 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-200">
                Email address
              </label>
              <div className="mt-2 relative">
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={cn(
                    "block w-full rounded-md border-0 py-2 text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-transparent transition-all",
                    errors.email && "ring-red-500 focus:ring-red-500"
                  )}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-200">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2 relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={cn(
                    "block w-full rounded-md border-0 py-2 pr-10 text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-transparent transition-all",
                    errors.password && "ring-red-500 focus:ring-red-500"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center items-center gap-2 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Not a member?{' '}
            <Link to="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              Start your free trial
            </Link>
          </p>

          {/* Security Badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <Shield className="w-4 h-4" />
            <span>Secured with industry-standard encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
