import React from 'react';
import { APP_CONFIG, isDemoMode } from '@/lib/config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlaskConical, Rocket, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const ModeBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (!APP_CONFIG.SHOW_MODE_TOGGLE || dismissed) {
    return null;
  }

  const handleGoLive = () => {
    toast.info('Going live requires API key configuration. Contact support for production setup.');
  };

  if (isDemoMode()) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-5 w-5 animate-pulse" />
            <span className="font-medium">Demo Mode Active</span>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              v{APP_CONFIG.VERSION}
            </Badge>
            <span className="text-white/80 text-sm hidden sm:inline">
              Using mock data • No real transactions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={handleGoLive}
            >
              <Rocket className="h-4 w-4 mr-1" />
              Go Live
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-6 w-6"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rocket className="h-5 w-5" />
          <span className="font-medium">Live Mode</span>
          <span className="text-white/80 text-sm hidden sm:inline">
            Real payments and data
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 h-6 w-6"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ModeBanner;
