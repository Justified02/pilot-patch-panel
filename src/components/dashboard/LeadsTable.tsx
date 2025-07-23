import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, Mail, Loader2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import EmailPreviewModal from './EmailPreviewModal';

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
  generated_email?: string;
  email_sent?: boolean;
}

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onLeadUpdate?: (leadId: string, updates: Partial<Lead>) => void;
}

export default function LeadsTable({ leads, isLoading, onLeadUpdate }: LeadsTableProps) {
  const [generatingEmailFor, setGeneratingEmailFor] = useState<string | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateEmail = async (lead: Lead) => {
    setGeneratingEmailFor(lead.id);
    try {
      const response = await fetch('https://divverse-community.app.n8n.cloud/webhook-test/email-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_data: {
            name: lead.name,
            title: lead.title,
            company: lead.company,
            location: lead.location,
            snippet: lead.snippet,
          },
          tone: 'professional',
          user_id: user?.id
        }),
      });

      if (!response.ok) throw new Error('Failed to generate email');

      const result = await response.json();
      
      // Handle N8N response format: [{ "output": { "Subject Line": "...", "Email Body": "..." } }]
      let emailContent = '';
      if (Array.isArray(result) && result[0]?.output) {
        const output = result[0].output;
        const subject = output["Subject Line"] || output.subject || '';
        const body = output["Email Body"] || output.body || output.email_body || '';
        emailContent = JSON.stringify({ subject, body });
      } else {
        // Fallback to original format
        emailContent = result.email_content || result.message || '';
      }

      onLeadUpdate?.(lead.id, { generated_email: emailContent });
      setSelectedLead({ ...lead, generated_email: emailContent });
      setShowEmailPreview(true);

      toast({
        title: "Email generated successfully",
        description: "Review and edit the email before sending",
      });
    } catch (error: any) {
      toast({
        title: "Error generating email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingEmailFor(null);
    }
  };

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Generated Leads ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={lead.image || ''} />
                          <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-muted-foreground">{lead.email}</div>
                          <div className="text-xs text-muted-foreground">{lead.location}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{lead.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {lead.linkedin && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={lead.linkedin} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        
                        {lead.generated_email ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowEmailPreview(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => generateEmail(lead)}
                            disabled={generatingEmailFor === lead.id}
                          >
                            {generatingEmailFor === lead.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4 mr-1" />
                            )}
                            Generate Email
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EmailPreviewModal
        isOpen={showEmailPreview}
        onOpenChange={setShowEmailPreview}
        lead={selectedLead}
        emailContent={selectedLead?.generated_email || ''}
        tone="professional"
        onEmailUpdate={(leadId, emailContent) => {
          onLeadUpdate?.(leadId, { generated_email: emailContent });
        }}
        onEmailSent={(leadId) => {
          onLeadUpdate?.(leadId, { email_sent: true });
        }}
      />
    </>
  );
}