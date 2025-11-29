import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Download, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ExtensionDownload() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-10 h-10 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">SafeGuard Browser Extension</h1>
                            <p className="text-muted-foreground">Real-time protection while you browse</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/')}>
                        Back to Home
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="p-6 space-y-6">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <Download className="w-6 h-6 text-primary" />
                            Installation Steps
                        </h2>

                        <div className="space-y-4">
                            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                                    <Download className="w-4 h-4" />
                                    Step 1: Download
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Get the extension package to your computer.
                                </p>
                                <a href="/safeguard-extension.zip" download>
                                    <Button className="w-full font-bold">
                                        Download Extension (.zip)
                                    </Button>
                                </a>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold shrink-0">2</div>
                                    <div>
                                        <h4 className="font-semibold">Unzip the file</h4>
                                        <p className="text-sm text-muted-foreground">Extract the zip. You will get a folder named <strong>safeguard-extension</strong>.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold shrink-0">3</div>
                                    <div>
                                        <h4 className="font-semibold">Add to Browser</h4>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Go to <code>chrome://extensions</code>, enable <strong>Developer mode</strong> (top right), and click <strong>Load unpacked</strong>. Select the extracted folder.
                                        </p>
                                        <div className="text-xs bg-muted p-2 rounded border border-border">
                                            <strong>Note:</strong> Browsers require this manual step for private security extensions.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-6 bg-secondary/10 border-secondary/20">
                        <h2 className="text-2xl font-semibold">Features</h2>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <strong>Screenshot Detection</strong>
                                    <p className="text-sm text-muted-foreground">Detects PrintScreen key and prompts to secure evidence.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <strong>One-Click Secure</strong>
                                    <p className="text-sm text-muted-foreground">Instantly open the Evidence Vault from any page.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <strong>Context Menu Integration</strong>
                                    <p className="text-sm text-muted-foreground">Right-click any page or image to secure it.</p>
                                </div>
                            </li>
                        </ul>

                        <div className="pt-4">
                            <p className="text-sm text-center text-muted-foreground">
                                Once installed, press <strong>PrintScreen</strong> on any website to test it!
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
