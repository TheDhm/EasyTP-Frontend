import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { LogOut, Menu, Server, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50 overflow-hidden">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo/Brand */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Server className="h-6 w-6" />
            <span>EasyTP SERVER</span>
          </Link>

          {/* Desktop Navigation - Only show on md and above */}
          <nav className="hidden md:flex items-center space-x-6">
            {isLandingPage && (
              <>
                <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                  Features
                </a>
                <a href="#deployment" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                  Deployment
                </a>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Desktop Auth Section - Only show on md and above */}
            <div className="hidden md:flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild className="h-10 shrink-0">
                    <Link to="/login" className="inline-flex items-center justify-center">
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="h-10 shrink-0">
                    <Link to="/signup" className="inline-flex items-center justify-center">
                      Sign Up
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{user?.username}</span>
                  </div>
                  {!isLandingPage && (
                    <Button variant="ghost" size="sm" asChild className="h-10 shrink-0">
                      <Link to="/dashboard" className="inline-flex items-center justify-center">
                        Dashboard
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="h-10 shrink-0"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Dropdown Menu - Show on smaller than md */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex md:hidden h-10 w-10 shrink-0 p-0"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Navigation Items */}
                {isLandingPage && (
                  <>
                    <DropdownMenuItem asChild>
                      <a href="#features" className="w-full cursor-pointer">
                        Features
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="#deployment" className="w-full cursor-pointer">
                        Deployment
                      </a>
                    </DropdownMenuItem>
                  </>
                )}

                {/* Separator before auth section */}
                {isLandingPage && <DropdownMenuSeparator />}

                {/* Authentication Section */}
                {!isAuthenticated ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="w-full cursor-pointer">
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/signup" className="w-full font-semibold cursor-pointer">
                        Sign Up
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem disabled className="flex items-center opacity-70">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">{user?.username}</span>
                    </DropdownMenuItem>
                    {!isLandingPage && (
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="w-full cursor-pointer">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}