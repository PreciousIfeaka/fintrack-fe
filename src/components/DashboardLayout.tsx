import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  LogOut,
  LayoutDashboard,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  Menu,
  X,
  User,
  FileText
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const navItems = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', path: '/transactions', icon: TrendingUp },
  { label: 'Budgets', path: '/budgets', icon: PiggyBank },
  { label: 'Income', path: '/income', icon: TrendingUp },
  { label: 'Expenses', path: '/expenses', icon: TrendingDown },
  { label: 'Statements', path: '/bank-statements', icon: FileText },
];

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-primary/30 text-foreground">
      {/* Global Animated Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse [animation-duration:15s]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] animate-pulse [animation-duration:12s]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 dark:border-white/5 bg-background/60 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-muted/80 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:inline">FinTrac</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 bg-muted/30 rounded-2xl border border-white/5 backdrop-blur-sm">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium',
                    isActive 
                      ? 'bg-background shadow-sm text-foreground ring-1 ring-border/50' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "")} />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-9 h-9 shrink-0 bg-muted/50 hover:bg-muted border border-transparent hover:border-border/50 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            {/* Desktop Profile Access */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border/50 ml-2">
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                aria-label="Profile settings"
              >
                <div className="text-right hidden md:block">
                   <p className="font-medium text-foreground text-sm max-w-[120px] truncate leading-none mb-1">{user?.name}</p>
                   <p className="text-xs opacity-70 leading-none truncate max-w-[120px]">{user?.email}</p>
                </div>
                <Avatar className="w-9 h-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-sm">
                  <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>

              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full w-9 h-9 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" aria-label="Logout">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl px-4 py-4 absolute w-full shadow-2xl animate-fade-in z-50">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      'justify-start gap-3 w-full rounded-xl transition-all',
                      isActive 
                        ? 'bg-primary/10 text-primary font-semibold' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                )
              })}
              <div className="h-px bg-border/50 my-2" />
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  navigate('/settings');
                  setMobileMenuOpen(false);
                }}
                className="justify-start gap-3 w-full rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <User className="w-5 h-5" />
                Profile Settings
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleLogout}
                className="justify-start gap-3 w-full rounded-xl text-destructive hover:bg-destructive/10 mt-1"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="animate-fade-in max-w-7xl mx-auto">
          <div className="mb-8 p-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
            {description && <p className="text-lg text-muted-foreground mt-2 max-w-2xl">{description}</p>}
          </div>
          <div className="relative">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
