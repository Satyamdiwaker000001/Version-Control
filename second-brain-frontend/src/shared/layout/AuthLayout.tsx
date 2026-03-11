import { Outlet } from 'react-router-dom';
import { Network } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-zinc-950 font-sans transition-colors">
      {/* Left side documentation / marketing */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-50 dark:bg-zinc-900 p-12 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/5 blur-3xl"></div>
           <div className="absolute top-[60%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-3xl"></div>
           
           {/* Grid pattern overlay */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 font-bold text-2xl text-zinc-900 dark:text-white mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <Network size={20} />
            </div>
            Second Brain
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
            Your personal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">knowledge version control</span> <br />
            system.
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
            Built for developers, engineers, and creators. Connect notes, track idea evolution, and manage your cognitive load effectively.
          </p>
        </div>

        <div className="relative z-10 text-sm font-medium text-zinc-500 dark:text-zinc-500">
          © {new Date().getFullYear()} Second Brain Inc.
        </div>
      </div>

      {/* Right side authentication forms */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950 transition-colors">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
