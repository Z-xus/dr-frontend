import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, X, Shield } from 'lucide-react';

const navItems = [
  { href: '/analyze', label: 'Analyze PIIs' },
  { href: '/redact-image', label: 'Redact Images' },
  { href: '/redact-pdf', label: 'Redact PDFs' }
] as const;

export function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full border-b bg-background">
      <div className="container px-4 mx-auto">
        <div className="flex items-center h-16">
          {/* Logo and Navigation - Left aligned */}
          <div className="flex items-center gap-16">
            <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-sm">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-xl md:text-2xl text-foreground">Data Rakshak</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-10">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'text-sm transition-all relative group',
                    location.pathname === item.href
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                  <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300"></div>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Actions - Right aligned */}
          <div className="flex items-center space-x-4 ml-auto">
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="container px-4 py-3">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-2 py-1.5 text-sm rounded-sm transition-all hover:translate-x-1',
                    location.pathname === item.href
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

