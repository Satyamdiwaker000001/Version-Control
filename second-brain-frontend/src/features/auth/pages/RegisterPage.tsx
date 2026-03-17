import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Github, Shield, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { AuthState } from '@/features/auth/store/useAuthStore';
import { cn } from '@/shared/utils/cn';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state: AuthState) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const handleSocialLogin = async (provider: string) => {
    setIsSocialLoading(provider);
    try {
      // Redirect to backend OAuth for social login
      const oauthUrls = {
        google: `${import.meta.env.VITE_API_URL}/auth/google`,
        github: `${import.meta.env.VITE_API_URL}/api/github/auth/url`,
      };
      
      window.location.href = oauthUrls[provider as keyof typeof oauthUrls];
    } catch (error) {
      toast.error(`Failed to connect with ${provider}`);
      setIsSocialLoading(provider);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await authService.register({ email: data.email, password: data.password, name: data.name });
      setAuth(response.user, response.token);
      toast.success('Account created successfully');
      navigate('/');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to register');
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Start building your second brain today.
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
                Full name
              </label>
              <div className="mt-2 relative">
                <input
                  {...register('name')}
                  type="text"
                  autoComplete="name"
                  className={cn(
                    "block w-full rounded-md border-0 py-2 text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-transparent transition-all",
                    errors.name && "ring-red-500 focus:ring-red-500"
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
            </div>

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
              <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-200">
                Password
              </label>
              <div className="mt-2 relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
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
              <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-200">
                Confirm Password
              </label>
              <div className="mt-2 relative">
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  className={cn(
                    "block w-full rounded-md border-0 py-2 pr-10 text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-transparent transition-all",
                    errors.confirmPassword && "ring-red-500 focus:ring-red-500"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
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
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              Sign in here
            </Link>
          </p>

          {/* Features List */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Free 14-day trial with full access</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Connect unlimited GitHub repositories</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <Shield className="w-4 h-4" />
            <span>Secured with industry-standard encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
