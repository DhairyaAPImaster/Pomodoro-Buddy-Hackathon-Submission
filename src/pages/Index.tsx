import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Redirect to landing if somehow accessing /app directly without auth
  if (!loading && !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-forest dark flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-forest dark">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-foreground">
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">Ready for a productive session?</p>
          </div>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="border-border text-foreground hover:bg-accent"
          >
            Sign Out
          </Button>
        </div>
        <PomodoroTimer />
      </div>
    </div>
  );
};

export default Index;
