import { Github, Lock, Eye, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center justify-between">
          {/* Product Name - Left */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-sm">
              <div className="w-3 h-3 grid grid-cols-2 grid-rows-2">
                <div className="bg-primary"></div>
                <div className="bg-primary/70"></div>
                <div className="bg-primary/50"></div>
                <div className="bg-primary/30"></div>
              </div>
            </div>
            <span className="text-sm font-medium text-foreground">
              © {new Date().getFullYear()} Data Rakshak
            </span>
          </div>

          {/* Features - Middle */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Secure Processing</span>
            </div>
            
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Eye className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Precision Redaction</span>
            </div>
            
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">AI-Powered Detection</span>
            </div>
          </div>

          {/* GitHub and Version - Right */}
          <div className="flex items-center gap-2">
            <a 
              href="https://github.com/Z-xus/dr-frontend" 
              target="_blank" 
              rel="noreferrer"
              className="p-1.5 hover:bg-accent/50 transition-all hover:scale-110 rounded-sm"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </a>
            <div className="text-xs px-2 py-1 text-muted-foreground bg-muted/30 rounded-sm">
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}