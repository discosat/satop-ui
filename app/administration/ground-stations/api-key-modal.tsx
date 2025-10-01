"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  apiKey: string;
}

export function ApiKeyModal({ open, onOpenChange, applicationId, apiKey }: ApiKeyModalProps) {
  
  const handleCopy = (textToCopy: string, fieldName: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast.success(`${fieldName} copied to clipboard!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ground Station Created Successfully</DialogTitle>
          <DialogDescription>
            The ground station has been registered. Copy the generated API Key and Application Id below.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="mt-4">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Important: Save Your API Key</AlertTitle>
          <AlertDescription>
            This is the only time you will see this API key. Store it in a secure location. If you lose it, you will need to generate a new one.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="appId">Application ID</Label>
            <div className="flex items-center gap-2">
              <Input id="appId" value={applicationId} readOnly />
              <Button variant="outline" size="icon" onClick={() => handleCopy(applicationId, 'Application ID')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex items-center gap-2">
              <Input id="apiKey" value={apiKey} readOnly className="font-mono"/>
              <Button variant="outline" size="icon" onClick={() => handleCopy(apiKey, 'API Key')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}