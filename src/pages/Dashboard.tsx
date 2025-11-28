import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Brain, MapPin, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SafeGuard</h1>
              <p className="text-xs text-muted-foreground">Protection Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Your Security Tools</h2>
          <p className="text-muted-foreground">Select a tool to begin protecting yourself from digital violence</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card 
            className="border-border/50 hover:border-secondary/50 transition-all duration-300 hover:shadow-glow cursor-pointer group"
            onClick={() => navigate("/evidence-vault")}
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-4 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Database className="w-full h-full text-white" />
              </div>
              <CardTitle className="text-2xl">Evidence Vault</CardTitle>
              <CardDescription className="text-base">
                Upload and secure digital evidence with blockchain verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-secondary text-primary hover:bg-secondary/90">
                Open Tool
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="border-border/50 hover:border-secondary/50 transition-all duration-300 hover:shadow-glow cursor-pointer group"
            onClick={() => navigate("/threat-intelligence")}
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 p-4 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-full h-full text-white" />
              </div>
              <CardTitle className="text-2xl">Threat Intelligence</CardTitle>
              <CardDescription className="text-base">
                Report incidents and track harassers across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-secondary text-primary hover:bg-secondary/90">
                Open Tool
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="border-border/50 hover:border-secondary/50 transition-all duration-300 hover:shadow-glow cursor-pointer group"
            onClick={() => navigate("/geo-tracking")}
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-4 mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-full h-full text-white" />
              </div>
              <CardTitle className="text-2xl">Geo Tracking</CardTitle>
              <CardDescription className="text-base">
                Create tracking links to capture attacker information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-secondary text-primary hover:bg-secondary/90">
                Open Tool
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
