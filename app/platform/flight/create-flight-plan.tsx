"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";

// Mock data for the dropdowns
const mockGroundStations = [
  { id: "gs-001", name: "Svalbard Ground Station" },
  { id: "gs-002", name: "Vandenberg SFB" },
  { id: "gs-003", name: "Fairbanks-Alaska" },
  { id: "gs-004", name: "Perth Ground Station" },
];

const mockSatellites = [
  { id: "sat-001", name: "EarthObserver-1" },
  { id: "sat-002", name: "OceanMonitor-2" },
  { id: "sat-003", name: "AtmosphereAnalyzer-1" },
  { id: "sat-004", name: "ClimateTracker-3" },
];

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Flight plan name must be at least 3 characters.",
  }),
  gs_id: z.string().min(1, {
    message: "Please select a ground station.",
  }),
  sat_name: z.string().min(1, {
    message: "Please select a satellite.",
  }),
});

export const CreateFlightPlanModal = () => {
  const [open, setOpen] = useState(false);

  // Form definition with validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gs_id: "",
      sat_name: "",
    },
  });

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  // Form submission handler
  const onSubmit = async (values) => {
    try {
      console.log("Submitting flight plan:", values);
      
      // Here, implement your API call to create the flight plan
      // For example:
      // await createFlightPlan(values);
      
      // Close modal on success
      setOpen(false);
    } catch (error) {
      console.error("Error creating flight plan:", error);
      // Handle error (show an error message, etc.)
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create new plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Flight Plan</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new satellite flight plan.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter flight plan name" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this flight plan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gs_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ground Station</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a ground station" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockGroundStations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The ground station that will communicate with the satellite
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sat_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Satellite</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a satellite" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockSatellites.map((satellite) => (
                        <SelectItem key={satellite.id} value={satellite.name}>
                          {satellite.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The satellite that will execute this flight plan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Plan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};