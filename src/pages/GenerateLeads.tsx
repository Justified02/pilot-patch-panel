import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LeadGenerationForm from '@/components/dashboard/LeadGenerationForm';
import LeadsTable from '@/components/dashboard/LeadsTable';

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

export default function GenerateLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLeadsGenerated = (newLeads: Lead[]) => {
    setLeads(newLeads);
  };

  const handleLeadUpdate = (leadId: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead =>
      lead.id === leadId ? { ...lead, ...updates } : lead
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Generate Leads</h1>
          <p className="text-muted-foreground mt-2">
            Use AI to find your ideal prospects with natural language.
          </p>
        </div>

        <LeadGenerationForm onLeadsGenerated={handleLeadsGenerated} />

        {leads.length > 0 && (
          <LeadsTable
            leads={leads}
            isLoading={isLoading}
            onLeadUpdate={handleLeadUpdate}
          />
        )}
      </div>
    </DashboardLayout>
  );
}