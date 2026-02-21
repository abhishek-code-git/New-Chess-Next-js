"use client";

import React, { useState } from 'react';
import { MessageSquare, X, Send, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const FeedbackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedback.trim() && rating === 0) {
      toast({
        title: "Please provide feedback",
        description: "Add a rating or write a message before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({
      title: "Thank you for your feedback!",
      description: "We appreciate you taking the time to help us improve.",
    });
    
    setFeedback('');
    setRating(0);
    setIsOpen(false);
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Floating feedback button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg gold-gradient hover:scale-110 transition-transform"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Feedback dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass-card border-primary/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Send Feedback</DialogTitle>
            <DialogDescription>
              Help us improve ChessMaster! Share your thoughts, suggestions, or report issues.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Star rating */}
            <div className="space-y-2">
              <Label>Rate your experience</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        (hoveredRating || rating) >= star
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback text */}
            <div className="space-y-2">
              <Label htmlFor="feedback">Your feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us what you think... What features would you like? Any bugs to report?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 gold-gradient"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeedbackButton;

