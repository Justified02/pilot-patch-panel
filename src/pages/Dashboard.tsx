import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Zap, Users, TrendingUp, Target, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalLeads: number;
  creditsUsed: number;
  successRate: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    creditsUsed: 0,
    successRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      // Set up real-time subscription for lead count updates
      const channel = supabase
        .channel('dashboard-stats')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'lead_history',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchDashboardStats();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Fetch total leads count
      const { count: totalLeads, error: leadsError } = await supabase
        .from('lead_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (leadsError) throw leadsError;

      // Fetch leads with generated emails (success rate calculation)
      const { count: leadsWithEmails, error: emailsError } = await supabase
        .from('lead_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('generated_email', 'is', null);

      if (emailsError) throw emailsError;

      // Calculate success rate
      const successRate = totalLeads ? Math.round((leadsWithEmails || 0) / (totalLeads || 1) * 100) : 0;

      setStats({
        totalLeads: totalLeads || 0,
        creditsUsed: totalLeads || 0, // For now, assuming 1 credit per lead
        successRate
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsData = [
    {
      icon: Target,
      label: 'Leads Generated',
      value: stats.totalLeads.toString(),
      description: 'Total leads found'
    },
    {
      icon: Users,
      label: 'Credits Used',
      value: stats.creditsUsed.toString(),
      description: 'API calls made'
    },
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      description: 'Leads with generated emails'
    }
  ];

  const quickActions = [
    {
      icon: Zap,
      title: 'Generate New Leads',
      description: 'Use AI to find your ideal prospects',
      href: '/dashboard/generate',
      primary: true
    },
    {
      icon: Users,
      title: 'View Profile',
      description: 'Manage your account settings',
      href: '/dashboard/profile',
      primary: false
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.user_metadata?.full_name || 'there'}!
          </h1>
          <p className="text-muted-foreground">
            Ready to find your next prospects? Let's get started.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsData.map((stat, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-primary rounded-lg">
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">
                      {isLoading ? '...' : stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Card className={`bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-elegant transition-smooth cursor-pointer ${
                  action.primary ? 'ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-primary/10' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          action.primary ? 'bg-gradient-primary' : 'bg-muted'
                        }`}>
                          <action.icon className={`w-5 h-5 ${
                            action.primary ? 'text-primary-foreground' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                          <CardDescription>{action.description}</CardDescription>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}