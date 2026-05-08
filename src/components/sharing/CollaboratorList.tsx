"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, User } from "lucide-react";

interface Collaborator {
  id: string;
  permission: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface CollaboratorListProps {
  accountId: string;
}

export function CollaboratorList({ accountId }: CollaboratorListProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`/api/accounts/${accountId}/collaborators`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch collaborators");
      }

      const data = await response.json();
      setCollaborators(data.collaborators);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [accountId]);

  const removeCollaborator = async (userId: string) => {
    setRemovingId(userId);
    setError(null);

    try {
      const response = await fetch(
        `/api/accounts/${accountId}/collaborators?userId=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove collaborator");
      }

      // Refresh the list
      await fetchCollaborators();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading collaborators...</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (collaborators.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No collaborators yet
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Current Collaborators</h4>
      <div className="space-y-2">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {collaborator.user.name || collaborator.user.email}
                </p>
                {collaborator.user.name && (
                  <p className="text-xs text-muted-foreground">
                    {collaborator.user.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={collaborator.permission === "FULL_ACCESS" ? "default" : "secondary"}>
                {collaborator.permission === "FULL_ACCESS" ? "Full Access" : "Read Only"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCollaborator(collaborator.user.id)}
                disabled={removingId === collaborator.user.id}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
