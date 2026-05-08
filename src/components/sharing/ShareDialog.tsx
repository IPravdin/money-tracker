"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Share2, Copy, Check, Link as LinkIcon, Users } from "lucide-react";
import { CollaboratorList } from "./CollaboratorList";

interface ShareDialogProps {
  accountId: string;
  accountName: string;
  shareToken?: string | null;
  onShareTokenGenerated?: (token: string) => void;
  onShareTokenRevoked?: () => void;
}

export function ShareDialog({
  accountId,
  accountName,
  shareToken: initialShareToken,
  onShareTokenGenerated,
  onShareTokenRevoked,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaboratorPermission, setCollaboratorPermission] = useState<"READ_ONLY" | "FULL_ACCESS">("FULL_ACCESS");
  const [addingCollaborator, setAddingCollaborator] = useState(false);
  const [collaboratorError, setCollaboratorError] = useState<string | null>(null);
  const [collaboratorSuccess, setCollaboratorSuccess] = useState(false);

  const shareUrl = shareToken
    ? `${window.location.origin}/shared/${shareToken}`
    : null;

  const generateShareLink = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/accounts/${accountId}/share`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate share link");
      }

      const data = await response.json();
      setShareToken(data.shareToken);
      onShareTokenGenerated?.(data.shareToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const revokeShareLink = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/accounts/${accountId}/share`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to revoke share link");
      }

      setShareToken(null);
      onShareTokenRevoked?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const addCollaborator = async () => {
    if (!collaboratorEmail.trim()) {
      setCollaboratorError("Please enter an email address");
      return;
    }

    setAddingCollaborator(true);
    setCollaboratorError(null);
    setCollaboratorSuccess(false);

    try {
      const response = await fetch(`/api/accounts/${accountId}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: collaboratorEmail,
          permission: collaboratorPermission,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add collaborator");
      }

      setCollaboratorEmail("");
      setCollaboratorSuccess(true);
      setTimeout(() => setCollaboratorSuccess(false), 3000);
    } catch (err) {
      setCollaboratorError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAddingCollaborator(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share {accountName}</DialogTitle>
          <DialogDescription>
            Share this account with others for viewing or collaboration
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">
              <LinkIcon className="h-4 w-4 mr-2" />
              View-Only Link
            </TabsTrigger>
            <TabsTrigger value="collaborators">
              <Users className="h-4 w-4 mr-2" />
              Collaborators
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Anyone with this link can view your account data, but cannot make changes.
              </p>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {shareUrl ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input value={shareUrl} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={generateShareLink}
                      disabled={loading}
                    >
                      Regenerate Link
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={revokeShareLink}
                      disabled={loading}
                    >
                      Revoke Link
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={generateShareLink} disabled={loading}>
                  Generate Share Link
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="collaborators" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Invite users to collaborate on this account. They need to have an account to accept the invitation.
                </p>

                {collaboratorError && (
                  <Alert variant="destructive">
                    <AlertDescription>{collaboratorError}</AlertDescription>
                  </Alert>
                )}

                {collaboratorSuccess && (
                  <Alert>
                    <AlertDescription>Collaborator added successfully!</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={collaboratorEmail}
                      onChange={(e) => setCollaboratorEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="permission">Permission Level</Label>
                    <select
                      id="permission"
                      className="w-full px-3 py-2 border rounded-md"
                      value={collaboratorPermission}
                      onChange={(e) => setCollaboratorPermission(e.target.value as "READ_ONLY" | "FULL_ACCESS")}
                    >
                      <option value="FULL_ACCESS">Full Access (can add/edit/delete)</option>
                      <option value="READ_ONLY">Read Only (can only view)</option>
                    </select>
                  </div>

                  <Button
                    onClick={addCollaborator}
                    disabled={addingCollaborator}
                    className="w-full"
                  >
                    {addingCollaborator ? "Adding..." : "Add Collaborator"}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <CollaboratorList accountId={accountId} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
