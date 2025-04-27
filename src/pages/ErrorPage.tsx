import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export default function ErrorPage() {
  const [glitchActive, setGlitchActive] = useState(false);
  
  useEffect(() => {
    // Create glitch effect at random intervals
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 2000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="flex items-center justify-center py-35 bg-background">
      <div className="p-8">
        <div className="text-center space-y-6 relative z-10">
          <div className={`pixel-container ${glitchActive ? 'glitch' : ''}`}>
            <h1 className="text-7xl font-mono font-bold text-foreground tracking-wider">
              4<span className="text-foreground">0</span>4
            </h1>
          </div>
          
          <p className="text-muted-foreground font-mono text-lg">PAGE_NOT_FOUND</p>
          
          <Button 
            asChild 
            variant="outline"
            className="font-mono px-6 py-2 transition-all duration-300 transform hover:scale-105 hover:pixelated"
          >
            <Link to="/">RETURN_HOME</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
