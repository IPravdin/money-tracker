"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Eye, Users } from "lucide-react";

interface SharedAccountBannerProps {
  isShared: boolean;
  isOwner: boolean;
  permission?: string | null;
  ownerName?: string;
  ownerEmail?: string;
}

export function SharedAccountBanner({
  isShared,
  isOwner,
  permission,
  ownerName,
  ownerEmail,
}: SharedAccountBannerProps) {
  if (!isShared || isOwner) {
    return null;
  }

  return (
    <Alert className="mb-4">
      <Users className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span className="font-medium">Shared Account</span>
          {ownerName || ownerEmail ? (
            <span className="text-muted-foreground ml-2">
              by {ownerName || ownerEmail}
            </span>
          ) : null}
        </div>
        <Badge variant={permission === "FULL_ACCESS" ? "default" : "secondary"}>
          {permission === "READ_ONLY" ? (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Read Only
            </>
          ) : (
            "Full Access"
          )}
        </Badge>
      </AlertDescription>
    </Alert>
  );
}
