"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { GroundStation } from "@/app/api/ground-stations/types";
import { updateGroundStation } from "@/app/api/ground-stations/ground-station-service";
import { refreshGroundStations } from "@/app/actions/ground-stations";

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  latitude: z
    .number({ invalid_type_error: "Latitude must be a number" })
    .min(-90)
    .max(90),
  longitude: z
    .number({ invalid_type_error: "Longitude must be a number" })
    .min(-180)
    .max(180),
  altitude: z
    .number({ invalid_type_error: "Altitude must be a number" })
    .min(-1000, { message: "Altitude must be greater than -1000 meters" })
    .max(10000, { message: "Altitude must be less than 10000 meters" }),
  httpUrl: z
    .string()
    .url({ message: "Please enter a valid HTTP URL" }),
});

type FormValues = z.infer<typeof formSchema>;

export function EditGroundStationModal({
  station,
  open,
  onOpenChange,
}: {
  station: GroundStation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: station.name,
      latitude: station.location.latitude,
      longitude: station.location.longitude,
      altitude: station.location.altitude,
      httpUrl: station.httpUrl,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    await updateGroundStation(station.id, {
      name: values.name,
      location: { 
        latitude: values.latitude, 
        longitude: values.longitude,
        altitude: values.altitude 
      },
      httpUrl: values.httpUrl,
    });
    await refreshGroundStations();
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Ground Station</DialogTitle>
          <DialogDescription>
            Update connection and location details.
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
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
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
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
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
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="httpUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTTP URL</FormLabel>
                  <FormControl>
                    <Input placeholder="http://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
