import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Brain, AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const ThreatIntelligence = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [platform, setPlatform] = useState("");
  const [username, setUsername] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [description, setDescription] = useState("");
  const [incidentDate, setIncidentDate] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadIncidents(session.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const loadIncidents = async (userId: string) => {
    const { data, error } = await supabase
      .from("threat_incidents")
      .select("*")
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading incidents:", error);
    } else {
      setIncidents(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform || !description || !incidentDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await supabase.functions.invoke("analyze-threat", {
        body: {
          platform,
          harasserUsername: username,
          harasserProfileUrl: profileUrl,
          incidentDescription: description,
          incidentDate,
          metadata: {
            reported_at: new Date().toISOString(),
          },
        },
      });

      if (response.error) throw response.error;

      const { data } = response;
      toast.success(
        `Incident analyzed! Severity: ${data.severityLevel.toUpperCase()}${
          data.isRepeatOffender ? " ⚠️ REPEAT OFFENDER DETECTED" : ""
        }`
      );

      // Reset form
      setPlatform("");
      setUsername("");
      setProfileUrl("");
      setDescription("");
      setIncidentDate("");

      // Reload incidents
      if (user) loadIncidents(user.id);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze threat");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-500 border-red-500/50";
      case "high":
        return "bg-orange-500/20 text-orange-500 border-orange-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "low":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/50";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">Threat Intelligence</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Report Form */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-secondary" />
                Report Incident
              </CardTitle>
              <CardDescription>
                AI-powered analysis will link harassers across platforms and assess threat levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform *</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="snapchat">Snapchat</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="username">Harasser Username (if known)</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username or display name"
                  />
                </div>

                <div>
                  <Label htmlFor="profileUrl">Profile URL (if available)</Label>
                  <Input
                    id="profileUrl"
                    type="url"
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="date">Incident Date *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Incident Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened, include any threatening language, patterns, or concerning behavior..."
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-secondary text-primary hover:bg-secondary/90"
                  disabled={loading}
                >
                  {loading ? "Analyzing..." : "Analyze Threat"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Incidents List */}
          <div>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  Your Reports ({incidents.length})
                </CardTitle>
                <CardDescription>
                  AI-analyzed incidents with threat assessment and pattern detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {incidents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No incidents reported yet. Report your first incident to start tracking threats.
                    </p>
                  ) : (
                    incidents.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border border-border rounded-lg hover:border-secondary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)} Incident
                            </h3>
                            {item.harasser_username && (
                              <p className="text-sm text-muted-foreground">@{item.harasser_username}</p>
                            )}
                          </div>
                          <span
                            className={`text-xs px-3 py-1 rounded-full border ${getSeverityColor(
                              item.severity_level
                            )}`}
                          >
                            {item.severity_level.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {item.incident_description}
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Incident: {new Date(item.incident_date).toLocaleString()}</p>
                          <p>Reported: {new Date(item.created_at).toLocaleString()}</p>
                          {item.metadata?.risk_score && (
                            <p className="font-semibold text-foreground">
                              Risk Score: {item.metadata.risk_score}/100
                            </p>
                          )}
                          {item.linked_attacker_id && (
                            <p className="text-red-500 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Linked to repeat offender
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThreatIntelligence;
