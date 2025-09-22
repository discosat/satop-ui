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
import type { GroundStation } from "@/app/api/platform/ground-stations/mock";
import { updateGroundStation } from "@/app/api/platform/ground-stations/ground-station-service";
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
  httpUrl: z
    .string()
    .url({ message: "Please enter a valid HTTP URL" }),
  isActive: z.boolean().default(true),
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
      httpUrl: station.httpUrl,
      isActive: station.isActive,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    await updateGroundStation({
      id: station.id,
      name: values.name,
      location: { latitude: values.latitude, longitude: values.longitude },
      httpUrl: values.httpUrl,
      createdAt: station.createdAt,
      isActive: values.isActive,
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

            <div className="grid grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) =>
                        field.onChange((e.target as HTMLInputElement).checked)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Uncheck to disable this station.
                  </FormDescription>
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
