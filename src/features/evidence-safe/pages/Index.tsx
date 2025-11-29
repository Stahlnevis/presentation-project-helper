import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/features/evidence-safe/components/ui/button";
import { Card } from "@/features/evidence-safe/components/ui/card";
import { toast } from 'sonner';
import { Shield, PlayCircle } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreateSession = async () => {
    setCreating(true);
    try {
      const supabaseUrl = import.meta.env.VITE_EVIDENCE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          issuer: 'WebApp',
          allowed_hosts: []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      toast.success('Session created successfully');
      navigate(`/evidence-vault/capture?token=${data.token}`);
    } catch (error) {
      console.error('Session creation error:', error);
      toast.error('Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="max-w-2xl w-full p-12 space-y-8 text-center">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </Button>
          <Shield className="w-20 h-20 text-primary mx-auto" />
          <div className="w-[100px]"></div> {/* Spacer for centering */}
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            🔐 Digital Evidence Vault
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Blockchain-secured forensic evidence capture for GBV cases
          </p>
        </div>

        <div className="space-y-6 pt-6">
          <div className="text-left space-y-3 text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="text-primary font-semibold">🔐</span>
              <span><strong>Smart Metadata Capture:</strong> IP hash, device fingerprint, geolocation, timestamp</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary font-semibold">⛓️</span>
              <span><strong>Blockchain Anchoring:</strong> Evidence anchored to Bitcoin via OpenTimestamps</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary font-semibold">📋</span>
              <span><strong>Forensic Reporting:</strong> Court-ready evidence with full chain of custody</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary font-semibold">✅</span>
              <span><strong>Tamper-Proof:</strong> Cryptographically verified and immutable</span>
            </p>
          </div>

          <Button
            size="lg"
            className="w-full text-lg py-6"
            onClick={handleCreateSession}
            disabled={creating}
          >
            <PlayCircle className="mr-2 w-5 h-5" />
            {creating ? 'Creating Session...' : 'Start New Session'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
