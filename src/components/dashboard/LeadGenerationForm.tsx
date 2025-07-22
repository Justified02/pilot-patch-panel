import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface LeadGenerationFormProps {
  onLeadsGenerated: (leads: Lead[]) => void;
}

export default function LeadGenerationForm({ onLeadsGenerated }: LeadGenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || isLoading || !user) return;

    setIsLoading(true);

    try {
      const response = await fetch('https://divverse-community.app.n8n.cloud/webhook-test/83982534-1497-473b-966f-7ad8836ee1d1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          user_id: user.id
        }),
      });

      if (!response.ok) throw new Error('Failed to generate leads');

      const data = await response.json();
      const leads = Array.isArray(data.leads) ? data.leads : data.message?.leads || [];

      if (leads.length > 0) {
        // Store leads in database
        const { error } = await supabase.from('lead_history').insert(
          leads.map((lead: any) => ({
            user_id: user.id,
            name: lead.name,
            title: lead.title,
            company: lead.company,
            location: lead.location,
            email: lead.email,
            linkedin: lead.linkedin,
            snippet: lead.snippet,
            image: lead.image,
            company_domain: lead.company_domain
          }))
        );

        if (error) throw error;

        onLeadsGenerated(leads);
        toast({
          title: "Leads generated successfully",
          description: `Found ${leads.length} potential leads`,
        });
        setPrompt('');
      } else {
        toast({
          title: "No leads found",
          description: "Try refining your search criteria",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error generating leads",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Lead Generation</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe your ideal prospects</label>
            <Textarea
              placeholder="e.g., Find CTOs at AI startups in San Francisco with 10-50 employees"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Generate Leads
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}