import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Calendar, FileText, LayoutDashboard, GraduationCap, Menu, X, Heart, Settings, Upload, Phone } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const currentPath = routerState.location.pathname;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const studentLinks = [
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/materials', label: 'Study Materials', icon: FileText },
    { to: '/profile', label: 'Profile', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: Calendar },
    { to: '/test-results', label: 'Test Results', icon: FileText }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/courses', label: 'Courses', icon: BookOpen },
    { to: '/admin/materials', label: 'Upload Materials', icon: Upload },
    { to: '/admin/attendance', label: 'Attendance', icon: Calendar },
    { to: '/admin/test-scores', label: 'Test Scores', icon: FileText },
    { to: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/assets/generated/cognify-logo.dim_200x200.png" alt="Cognify" className="h-10 w-10" />
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl text-primary">Cognify</span>
                <span className="text-xs text-muted-foreground hidden sm:block">From Rote to Reason</span>
              </div>
            </Link>

            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = currentPath === link.to || currentPath.startsWith(link.to + '/');
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
            >
              {isLoggingIn ? 'Loading...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>

            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-accent rounded-md"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden border-t bg-card">
            <nav className="container py-4 flex flex-col gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = currentPath === link.to || currentPath.startsWith(link.to + '/');
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-card mt-auto">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span>© {new Date().getFullYear()} Cognify. All rights reserved.</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-medium">Contact: 778-095-1766</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Built with</span>
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                <span>using</span>
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    window.location.hostname
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  caffeine.ai
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
