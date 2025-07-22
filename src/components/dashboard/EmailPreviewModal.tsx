import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Send, Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  email: string;
  linkedin: string;
  snippet: string;
  image: string | null;
  company_domain: string;
}

interface EmailPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  emailContent: string;
  tone: string;
  onEmailUpdate: (leadId: string, emailContent: string) => void;
  onEmailSent: (leadId: string) => void;
}

export default function EmailPreviewModal({
  isOpen,
  onOpenChange,
  lead,
  emailContent,
  tone,
  onEmailUpdate,
  onEmailSent,
}: EmailPreviewModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // FIX: Improved email parsing logic
  useEffect(() => {
    if (emailContent) {
      try {
        // Try parsing as JSON first
        const parsed = JSON.parse(emailContent);
        if (parsed.subject && parsed.body) {
          setSubject(parsed.subject);
          setBody(parsed.body);
          return;
        }
      } catch {
        // Not JSON, parse as text
      }

      // Parse text format
      const subjectMatch = emailContent.match(/(?:subject|SUBJECT):\s*(.+?)(?:\n|$)/i);
      if (subjectMatch) {
        setSubject(subjectMatch[1].trim());
        const bodyStart = emailContent.indexOf(subjectMatch[0]) + subjectMatch[0].length;
        setBody(emailContent.substring(bodyStart).trim());
      } else {
        // No subject found, treat entire content as body
        setSubject(`Regarding ${lead?.company || 'Partnership Opportunity'}`);
        setBody(emailContent);
      }
    } else {
      setSubject('');
      setBody('');
    }
  }, [emailContent, lead]);

  const handleSave = () => {
    const updatedContent = JSON.stringify({ subject, body });
    onEmailUpdate(lead?.id!, updatedContent);
    setIsEditing(false);
    toast({
      title: "Email saved",
      description: "Your changes have been saved",
    });
  };

  const handleSend = async () => {
    if (!lead || !subject || !body) return;

    setIsSending(true);
    try {
      const response = await fetch('https://divverse-community.app.n8n.cloud/webhook-test/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: lead.email,
          to_name: lead.name,
          subject,
          body,
          user_id: user?.id,
          lead_id: lead.id
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      onEmailSent(lead.id);
      onOpenChange(false);
      toast({
        title: "Email sent successfully",
        description: `Email sent to ${lead.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Error sending email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Email Preview - {lead?.name}</span>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!isEditing}
              placeholder="Email subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={!isEditing}
              className="min-h-[300px]"
              placeholder="Email content"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !subject || !body}
            >
              {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}