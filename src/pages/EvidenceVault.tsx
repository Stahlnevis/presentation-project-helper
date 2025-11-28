import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Shield, FileCheck } from "lucide-react";
import { toast } from "sonner";

const EvidenceVault = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadEvidence(session.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const loadEvidence = async (userId: string) => {
    const { data, error } = await supabase
      .from("evidence_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading evidence:", error);
    } else {
      setEvidence(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !evidenceType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("evidenceType", evidenceType);
      formData.append("metadata", JSON.stringify({
        uploaded_at: new Date().toISOString(),
        browser: navigator.userAgent,
      }));

      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("upload-evidence", {
        body: formData,
      });

      if (response.error) throw response.error;

      toast.success("Evidence uploaded successfully! Hash: " + response.data.hash.substring(0, 16) + "...");
      
      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setEvidenceType("");
      
      // Reload evidence
      if (user) loadEvidence(user.id);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload evidence");
    } finally {
      setLoading(false);
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">Evidence Vault</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-secondary" />
                Upload Evidence
              </CardTitle>
              <CardDescription>
                Securely upload digital evidence with SHA-256 hashing and blockchain timestamping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Evidence Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Harassment screenshot from Instagram"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Evidence Type *</Label>
                  <Select value={evidenceType} onValueChange={setEvidenceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="screenshot">Screenshot</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio Recording</SelectItem>
                      <SelectItem value="chat_log">Chat Log</SelectItem>
                      <SelectItem value="link">Link/URL</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional details about this evidence..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="file">File Upload *</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept="image/*,video/*,audio/*,.pdf,.txt"
                    required
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-secondary text-primary hover:bg-secondary/90"
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload & Hash Evidence"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Evidence List */}
          <div>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-secondary" />
                  Your Evidence ({evidence.length})
                </CardTitle>
                <CardDescription>
                  All evidence is cryptographically hashed and blockchain-verified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {evidence.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No evidence uploaded yet. Start by uploading your first piece of evidence above.
                    </p>
                  ) : (
                    evidence.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border border-border rounded-lg hover:border-secondary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <span className="text-xs px-2 py-1 bg-secondary/20 text-secondary rounded-full">
                            {item.evidence_type}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        )}
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="font-mono">Hash: {item.file_hash.substring(0, 32)}...</p>
                          <p>Uploaded: {new Date(item.created_at).toLocaleString()}</p>
                          <p className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-green-500" />
                            Status: {item.status}
                          </p>
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

export default EvidenceVault;
