"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Disc3, Download, ExternalLink, Loader2, CheckCircle, AlertCircle, Unlink } from "lucide-react";
import { 
  startDiscogsAuthAction,
  completeDiscogsAuthWithPinAction,
  getDiscogsStatusAction, 
  importFromDiscogsAction,
  disconnectDiscogsAction 
} from "@/actions/discogs.actions";
import { Input } from "@/components/ui/input";

interface DiscogsSyncDialogProps {
  iconOnly?: boolean;
}

export default function DiscogsSyncDialog({ iconOnly = false }: DiscogsSyncDialogProps) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [discogsUsername, setDiscogsUsername] = useState<string>();
  const [lastSync, setLastSync] = useState<Date>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);
  const [error, setError] = useState<string>();
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [requestToken, setRequestToken] = useState<string>();
  const [verifierPin, setVerifierPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Check for OAuth callback success
  useEffect(() => {
    const discogsParam = searchParams.get('discogs');
    const errorParam = searchParams.get('error');
    
    if (discogsParam === 'connected') {
      setOpen(true);
      loadStatus();
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    } else if (errorParam) {
      setOpen(true);
      if (errorParam === 'oauth-params-missing') {
        setError('OAuth parameters missing. Please try connecting again.');
      } else if (errorParam === 'oauth-token-expired') {
        setError('OAuth token expired. Please try connecting again.');
      } else if (errorParam === 'oauth-failed') {
        setError('OAuth authentication failed. Please try again.');
      }
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  // Load connection status when dialog opens
  useEffect(() => {
    if (open) {
      loadStatus();
    }
  }, [open]);

  const loadStatus = async () => {
    try {
      const status = await getDiscogsStatusAction();
      if (status.error) {
        setError(status.error);
      } else {
        setIsConnected(status.connected);
        setDiscogsUsername(status.username);
        setLastSync(status.lastSync);
      }
    } catch {
      setError("Failed to load Discogs status");
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(undefined);
    setVerifierPin("");
    
    try {
      const result = await startDiscogsAuthAction();
      if (result.success && result.authUrl && result.token) {
        // Open Discogs auth page in new tab
        window.open(result.authUrl, '_blank', 'width=800,height=600');
        
        // Store request token and show PIN entry
        setRequestToken(result.token);
        setShowPinEntry(true);
      } else {
        setError(result.error || "Failed to start authentication");
      }
    } catch {
      setError("Failed to connect to Discogs");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!verifierPin.trim() || !requestToken) {
      setError("Please enter the verification code");
      return;
    }

    setIsVerifying(true);
    setError(undefined);

    try {
      const result = await completeDiscogsAuthWithPinAction(requestToken, verifierPin.trim());
      if (result.success) {
        setShowPinEntry(false);
        setVerifierPin("");
        setRequestToken(undefined);
        await loadStatus();
      } else {
        setError(result.error || "Failed to verify code");
      }
    } catch {
      setError("Failed to complete authentication");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    setError(undefined);
    
    try {
      const result = await disconnectDiscogsAction();
      if (result.success) {
        setIsConnected(false);
        setDiscogsUsername(undefined);
        setLastSync(undefined);
        setImportResult(null);
      } else {
        setError(result.error || "Failed to disconnect");
      }
    } catch {
      setError("Failed to disconnect from Discogs");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setError(undefined);
    setImportResult(null);
    
    try {
      const result = await importFromDiscogsAction();
      if (result.success) {
        setImportResult({
          imported: result.imported,
          skipped: result.skipped,
        });
        // Refresh status to update last sync time
        await loadStatus();
      } else {
        setError(result.error || "Import failed");
      }
    } catch {
      setError("Failed to import from Discogs");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {iconOnly ? (
          <div className="flex flex-col items-center gap-1">
            <Button variant="outline" className="p-2" size="sm">
              <Disc3 className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground">Sync</span>
          </div>
        ) : (
          <Button variant="outline" className="gap-2">
            <Disc3 className="w-4 h-4" />
            Discogs Sync
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Disc3 className="w-5 h-5" />
            Discogs Integration
          </DialogTitle>
          <DialogDescription>
            Connect your Discogs account to import your collection and sync records.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-muted-foreground">Not connected</span>
                </>
              )}
            </div>
            {isConnected && discogsUsername && (
              <Badge variant="secondary">{discogsUsername}</Badge>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                Import completed! Added {importResult.imported} records, skipped {importResult.skipped} duplicates.
              </p>
            </div>
          )}

          {/* Last Sync Info */}
          {isConnected && lastSync && (
            <div className="text-xs text-muted-foreground">
              Last synced: {lastSync.toLocaleDateString()} at {lastSync.toLocaleTimeString()}
            </div>
          )}

          {/* PIN Entry Section */}
          {showPinEntry && !isConnected && (
            <div className="space-y-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900">
                  Enter Verification Code
                </p>
                <p className="text-xs text-blue-700">
                  1. Authorize the app in the Discogs tab that just opened
                </p>
                <p className="text-xs text-blue-700">
                  2. Copy the verification code shown on Discogs
                </p>
                <p className="text-xs text-blue-700">
                  3. Paste it below and click Verify
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={verifierPin}
                  onChange={(e) => setVerifierPin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                  disabled={isVerifying}
                />
                <Button 
                  onClick={handleVerifyPin}
                  disabled={isVerifying || !verifierPin.trim()}
                  className="min-w-[100px]"
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPinEntry(false);
                  setVerifierPin("");
                  setRequestToken(undefined);
                }}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isConnected && !showPinEntry ? (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full gap-2"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Connect to Discogs
              </Button>
            ) : isConnected ? (
              <div className="space-y-2">
                <Button 
                  onClick={handleImport} 
                  disabled={isImporting}
                  className="w-full gap-2"
                >
                  {isImporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isImporting ? "Importing..." : "Import Collection"}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleDisconnect} 
                  disabled={isDisconnecting}
                  className="w-full gap-2"
                >
                  {isDisconnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unlink className="w-4 h-4" />
                  )}
                  Disconnect
                </Button>
              </div>
            ) : null}
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-1">About Discogs Sync</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Import your entire Discogs collection</li>
              <li>• Automatically fills in release details</li>
              <li>• Skips duplicates to avoid conflicts</li>
              <li>• Respects Discogs API rate limits</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}