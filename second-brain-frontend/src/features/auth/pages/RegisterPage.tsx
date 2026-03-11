import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { cn } from '@/shared/utils/cn';

const registerSchema = z.object({
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
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await authService.register(data.email, data.password);
      setAuth(response.user, response.token);
      toast.success('Account created successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10 text-center sm:text-left">
        <h2 className="mt-6 text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Start building your second brain today.
        </p>
      </div>

      <div className="mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                type="password"
                className={cn(
                  "block w-full rounded-md border-0 py-2 text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-transparent transition-all",
                  errors.password && "ring-red-500 focus:ring-red-500"
                )}
              />
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
                type="password"
                className={cn(
                  "block w-full rounded-md border-0 py-2 text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-transparent transition-all",
                  errors.confirmPassword && "ring-red-500 focus:ring-red-500"
                )}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center items-center gap-2 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center sm:text-left text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
