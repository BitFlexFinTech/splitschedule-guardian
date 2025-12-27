import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Clock, CheckCircle, LogIn, LogOut } from 'lucide-react';

interface CheckInButtonProps {
  familyId: string | null;
  userId: string;
  childId?: string;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({ familyId, userId, childId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transferType, setTransferType] = useState<'pickup' | 'dropoff'>('pickup');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleCheckIn = async () => {
    if (!familyId) {
      toast.error('No family connected');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('custody_transfers')
        .insert({
          family_id: familyId,
          child_id: childId || null,
          transfer_type: transferType,
          location: location || 'Not specified',
          notes: notes || null,
          transferred_by: userId,
        });

      if (error) throw error;

      toast.success(`${transferType === 'pickup' ? 'Check-in' : 'Check-out'} recorded successfully!`);
      setIsDialogOpen(false);
      setLocation('');
      setNotes('');
    } catch (error) {
      console.error('Error recording transfer:', error);
      toast.error('Failed to record transfer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setTransferType('pickup');
            setIsDialogOpen(true);
          }}
          className="flex-1"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Check In
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setTransferType('dropoff');
            setIsDialogOpen(true);
          }}
          className="flex-1"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Check Out
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {transferType === 'pickup' ? (
                <>
                  <LogIn className="h-5 w-5 text-primary" />
                  Record Check-In
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5 text-accent" />
                  Record Check-Out
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Record the custody transfer with timestamp and location
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {new Date().toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  className="pl-10"
                  placeholder="e.g., School parking lot"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckIn} disabled={isLoading}>
              {isLoading ? 'Recording...' : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm {transferType === 'pickup' ? 'Check-In' : 'Check-Out'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};