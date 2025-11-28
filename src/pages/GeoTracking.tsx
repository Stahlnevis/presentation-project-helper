import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Link2, Copy, Eye } from "lucide-react";
import { toast } from "sonner";

const GeoTracking = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [trackingLinks, setTrackingLinks] = useState<any[]>([]);
  const [captures, setCaptures] = useState<any[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadTrackingLinks(session.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const loadTrackingLinks = async (userId: string) => {
    const { data, error } = await supabase
      .from("tracking_links")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading tracking links:", error);
    } else {
      setTrackingLinks(data || []);
    }
  };

  const loadCaptures = async (linkId: string) => {
    const { data, error } = await supabase
      .from("geo_captures")
      .select("*")
      .eq("tracking_link_id", linkId)
      .order("captured_at", { ascending: false });

    if (error) {
      console.error("Error loading captures:", error);
    } else {
      setCaptures(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("Please provide a title");
      return;
    }

    setLoading(true);

    try {
      const response = await supabase.functions.invoke("create-tracking-link", {
        body: {
          title,
          description,
          targetUrl: targetUrl || null,
        },
      });

      if (response.error) throw response.error;

      toast.success("Tracking link created successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setTargetUrl("");

      // Reload links
      if (user) loadTrackingLinks(user.id);
    } catch (error: any) {
      console.error("Creation error:", error);
      toast.error(error.message || "Failed to create tracking link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  const viewCaptures = (linkId: string) => {
    setSelectedLinkId(linkId);
    loadCaptures(linkId);
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">Geolocation Tracking</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Link Form */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-secondary" />
                Create Tracking Link
              </CardTitle>
              <CardDescription>
                Generate a link that captures attacker location, device info, and digital fingerprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Link Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Evidence Document Link"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this link for? Who will you send it to?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="targetUrl">Redirect URL (Optional)</Label>
                  <Input
                    id="targetUrl"
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com (where to redirect after capture)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to show a generic "link accessed" message
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-secondary text-primary hover:bg-secondary/90"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Generate Tracking Link"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tracking Links List */}
          <div>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-secondary" />
                  Your Tracking Links ({trackingLinks.length})
                </CardTitle>
                <CardDescription>
                  Click a link to view captures or copy it to share
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {trackingLinks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No tracking links yet. Create one above to start capturing attacker data.
                    </p>
                  ) : (
                    trackingLinks.map((link) => {
                      const trackingUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-geo?code=${link.link_code}`;
                      return (
                        <div
                          key={link.id}
                          className="p-4 border border-border rounded-lg hover:border-secondary/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-foreground">{link.title}</h3>
                            <span className="text-xs px-2 py-1 bg-secondary/20 text-secondary rounded-full">
                              {link.captures_count} captures
                            </span>
                          </div>
                          {link.description && (
                            <p className="text-sm text-muted-foreground mb-3">{link.description}</p>
                          )}
                          <div className="flex gap-2 mb-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => copyToClipboard(trackingUrl)}
                            >
                              <Copy className="w-3 h-3 mr-2" />
                              Copy Link
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewCaptures(link.id)}
                            >
                              <Eye className="w-3 h-3 mr-2" />
                              View
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {trackingUrl}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {new Date(link.created_at).toLocaleString()}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Captures View */}
        {selectedLinkId && (
          <Card className="border-border/50 mt-8">
            <CardHeader>
              <CardTitle>Captured Data</CardTitle>
              <CardDescription>
                Information collected from users who clicked the tracking link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {captures.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No captures yet for this link. Share it to start collecting data.
                  </p>
                ) : (
                  captures.map((capture) => (
                    <div
                      key={capture.id}
                      className="p-4 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Location Data</h4>
                          <div className="text-xs space-y-1 text-muted-foreground">
                            <p>IP: {capture.ip_address}</p>
                            {capture.geolocation && typeof capture.geolocation === 'object' && !capture.geolocation.error && (
                              <>
                                <p>City: {capture.geolocation.city || 'Unknown'}</p>
                                <p>Region: {capture.geolocation.region || 'Unknown'}</p>
                                <p>Country: {capture.geolocation.country_name || 'Unknown'}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Device Info</h4>
                          <div className="text-xs space-y-1 text-muted-foreground">
                            <p>Browser: {capture.device_info?.browser || 'Unknown'}</p>
                            <p>OS: {capture.device_info?.os || 'Unknown'}</p>
                            <p>Device: {capture.device_info?.device_type || 'Unknown'}</p>
                            <p className="font-mono">Fingerprint: {capture.browser_fingerprint?.substring(0, 16)}...</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Captured: {new Date(capture.captured_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default GeoTracking;
