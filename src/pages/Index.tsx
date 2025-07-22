import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Target, TrendingUp, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">LeadPilot</span>
            </div>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-foreground">
              Generate Leads with AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Use natural language to find your ideal prospects. LeadPilot helps you discover, 
              connect, and engage with potential customers using AI-powered lead generation.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Link to="/auth">
              <Button size="lg" className="shadow-elegant">
                <Zap className="w-5 h-5 mr-2" />
                Start Generating Leads
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Search</h3>
              <p className="text-muted-foreground">
                Describe your ideal customer in natural language and let AI find them
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Smart Email Generation</h3>
              <p className="text-muted-foreground">
                Generate personalized outreach emails for each prospect automatically
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Track & Optimize</h3>
              <p className="text-muted-foreground">
                Monitor your outreach performance and optimize your lead generation
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
