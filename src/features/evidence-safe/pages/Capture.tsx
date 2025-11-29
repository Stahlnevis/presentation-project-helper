import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/features/evidence-safe/components/ui/button";
import { Card } from "@/features/evidence-safe/components/ui/card";
import { Input } from "@/features/evidence-safe/components/ui/input";
import { toast } from 'sonner';
import { Upload, FileText, Download, Shield, MapPin, Lock } from 'lucide-react';

export default function Capture() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [manifestSha256, setManifestSha256] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [geolocation, setGeolocation] = useState<{ lat: number, lng: number, accuracy: number } | null>(null);
  const [geoPermissionAsked, setGeoPermissionAsked] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      // Decode JWT to get session_id (simple base64 decode of payload)
      try {
        const payload = JSON.parse(atob(tokenParam.split('.')[1]));
        setSessionId(payload.session_id);
      } catch (e) {
        toast.error('Invalid session token');
        navigate('/');
      }
    } else {
      navigate('/');
    }

    // 🔐 REQUEST GEOLOCATION (Optional but strengthens evidence)
    if (!geoPermissionAsked && navigator.geolocation) {
      setGeoPermissionAsked(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geo = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setGeolocation(geo);
          toast.success('Location captured for forensic tracking');
        },
        (error) => {
          console.log('Geolocation not available:', error);
          // Not critical - evidence can still be captured without it
        }
      );
    }
  }, [searchParams, navigate, geoPermissionAsked]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!files || !token || !sessionId) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();

      // 🔐 INCLUDE FORENSIC METADATA
      const metadata = {
        platform: 'WebApp',
        geolocation: geolocation || null
      };

      formData.append('meta', JSON.stringify(metadata));

      Array.from(files).forEach(file => {
        formData.append('files[]', file);
      });

      const supabaseUrl = import.meta.env.VITE_EVIDENCE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/upload-evidence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setReportId(data.report_id);

      toast.success(
        `✅ ${data.uploaded.length} files uploaded with forensic metadata`,
        { duration: 5000 }
      );

      setFiles(null);

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateManifest = async () => {
    if (!reportId || !token) {
      toast.error('Please upload files first');
      return;
    }

    setGenerating(true);
    try {
      const supabaseUrl = import.meta.env.VITE_EVIDENCE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-manifest/${reportId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Manifest generation failed');
      }

      const data = await response.json();
      setManifestSha256(data.manifest_sha256);
      toast.success('🔐 Cryptographic manifest generated', { duration: 5000 });
    } catch (error) {
      console.error('Manifest error:', error);
      toast.error('Failed to generate manifest');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!reportId || !token || !manifestSha256) {
      toast.error('Please generate manifest first');
      return;
    }

    try {
      toast.info('🔗 Generating court-ready certificate...', { duration: 3000 });

      // Download PDF Certificate
      const pdfResponse = await fetch(
        `https://gbwtuzqiqasoggqhghfi.supabase.co/functions/v1/generate-certificate/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!pdfResponse.ok) throw new Error('PDF generation failed');

      const pdfBlob = await pdfResponse.blob();
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      const pdfLink = document.createElement('a');
      pdfLink.href = pdfUrl;
      pdfLink.download = `EVIDENCE_CERTIFICATE_${reportId}.pdf`;
      document.body.appendChild(pdfLink);
      pdfLink.click();
      window.URL.revokeObjectURL(pdfUrl);
      document.body.removeChild(pdfLink);

      // Also download JSON backup (technical file)
      const supabaseUrl = import.meta.env.VITE_EVIDENCE_SUPABASE_URL;
      const jsonResponse = await fetch(`${supabaseUrl}/functions/v1/export-report/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (jsonResponse.ok) {
        const jsonData = await jsonResponse.json();
        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const jsonUrl = window.URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `TECHNICAL_BACKUP_${reportId}.json`;
        document.body.appendChild(jsonLink);
        jsonLink.click();
        window.URL.revokeObjectURL(jsonUrl);
        document.body.removeChild(jsonLink);
      }

      toast.success(
        '📄 Evidence Certificate Downloaded! Professional PDF + technical backup ready for submission.',
        { duration: 7000 }
      );
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export certificate');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">🔐 Digital Evidence Vault</h1>
              <p className="text-muted-foreground mt-1">Blockchain-secured forensic evidence capture</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {sessionId && (
          <Card className="p-6 bg-card border-border">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Secure Session Active</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Session ID</p>
                <p className="font-mono text-sm bg-muted p-3 rounded break-all">{sessionId}</p>
              </div>
              {geolocation && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <MapPin className="w-4 h-4" />
                  <span>Location tracking enabled (forensic metadata)</span>
                </div>
              )}
            </div>
          </Card>
        )}

        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload Evidence
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Files will be cryptographically hashed and metadata captured for forensic verification
            </p>
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              className="mb-4"
            />
            <Button
              onClick={handleUpload}
              disabled={!files || uploading}
              className="w-full"
            >
              {uploading ? 'Uploading with forensic metadata...' : '🔐 Upload & Capture Metadata'}
            </Button>
          </div>

          {reportId && (
            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Report ID</p>
              <p className="font-mono text-sm bg-muted p-3 rounded break-all mb-4">{reportId}</p>
            </div>
          )}
        </Card>

        {reportId && (
          <>
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Generate Cryptographic Manifest
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Create SHA-256 hash manifest with all forensic metadata
              </p>
              <Button
                onClick={handleGenerateManifest}
                disabled={generating}
                className="w-full"
              >
                {generating ? 'Generating...' : '🔐 Generate Forensic Manifest'}
              </Button>

              {manifestSha256 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Manifest SHA256 Hash</p>
                  <p className="font-mono text-xs bg-muted p-3 rounded break-all text-primary">
                    {manifestSha256}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    ✅ This hash will be anchored to Bitcoin blockchain for immutable verification
                  </p>
                </div>
              )}
            </Card>

            {manifestSha256 && (
              <Card className="p-6 border-primary">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Download className="w-6 h-6" />
                  Export Forensic Evidence Vault
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Download court-ready evidence report with blockchain proof
                </p>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Cryptographically verified evidence</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Blockchain-anchored via OpenTimestamps (Bitcoin)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Full forensic metadata & chain of custody</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Court-admissible format with verification instructions</span>
                  </div>
                </div>
                <Button
                  onClick={handleExport}
                  className="w-full"
                  variant="default"
                >
                  📄 Download Evidence Certificate
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Professional PDF certificate + technical JSON backup
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}