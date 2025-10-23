"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createGroundStation } from "@/app/api/ground-stations/ground-station-service";
import { refreshGroundStations } from "@/app/actions/ground-stations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ApiKeyModal } from "./api-key-modal";

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  latitude: z.coerce
    .number({ 
      required_error: "Latitude is required",
      invalid_type_error: "Latitude must be a valid number" 
    })
    .min(-90, { message: "Latitude must be between -90 and 90 degrees" })
    .max(90, { message: "Latitude must be between -90 and 90 degrees" }),
  longitude: z.coerce
    .number({ 
      required_error: "Longitude is required",
      invalid_type_error: "Longitude must be a valid number" 
    })
    .min(-180, { message: "Longitude must be between -180 and 180 degrees" })
    .max(180, { message: "Longitude must be between -180 and 180 degrees" }),
  altitude: z.coerce
    .number({ 
      required_error: "Altitude is required",
      invalid_type_error: "Altitude must be a valid number" 
    })
    .min(-1000, { message: "Altitude must be greater than -1000 meters" })
    .max(10000, { message: "Altitude must be less than 10000 meters" }),
  webSocketUrl: z
    .string()
    .min(1, { message: "WebSocket URL is required" })
    .url({ message: "Please enter a valid WebSocket URL" }),
});

type FormValues = z.infer<typeof formSchema>;

export const CreateGroundStationModal = () => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [apiKeyInfo, setApiKeyInfo] = useState<{ applicationId: string; rawApiKey: string } | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      latitude: undefined,
      longitude: undefined,
      altitude: undefined,
      webSocketUrl: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const newStationWithKey = await createGroundStation({
        name: values.name,
        location: { 
          latitude: values.latitude, 
          longitude: values.longitude,
          altitude: values.altitude 
        },
        
      });
      
      setApiKeyInfo({
        applicationId: newStationWithKey.applicationId,
        rawApiKey: newStationWithKey.rawApiKey,
      });
      setShowApiKeyModal(true);
      
      form.reset();
      setOpen(false);

    } catch (error) {
      console.error('Failed to create ground station:', error);
      toast.error("Failed to create ground station.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New ground station
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Ground Station</DialogTitle>
            <DialogDescription>
              Define connection and location details.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormDescription>Human-readable station name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="e.g. 78.2232"
                          value={field.value == null || isNaN(field.value) ? "" : field.value.toString()}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="e.g. 15.6469"
                          value={field.value == null || isNaN(field.value) ? "" : field.value.toString()}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="altitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altitude (m)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g. 100"
                          value={field.value == null || isNaN(field.value) ? "" : field.value.toString()}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="webSocketUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WebSocket URL</FormLabel>
                    <FormControl>
                      <Input placeholder="ws://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {apiKeyInfo && (
        <ApiKeyModal
          open={showApiKeyModal}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setShowApiKeyModal(false);
              setApiKeyInfo(null);
              refreshGroundStations();
              toast.success("Ground station created successfully!");
            }
          }}
          applicationId={apiKeyInfo.applicationId}
          apiKey={apiKeyInfo.rawApiKey}
        />
      )}
    </>
  );
};