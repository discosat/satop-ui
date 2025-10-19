"use client";

import { useMemo, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { FlightPlan } from "@/app/api/platform/flight/flight-plan-service";
import { createFlightPlan } from "@/app/api/platform/flight/flight-plan-service";
import { toast } from "sonner";
import { useSession } from "@/app/context";
import FlightPlanSteps from "@/app/platform/flight/components/flight-plan-steps";
import { CommandBuilder } from "../components/commands/command-builder";
import {
  getSatellites,
  Satellite,
} from "@/app/api/platform/satellites/satellite-service";
import { getGroundStations } from "@/app/api/platform/ground-stations/ground-station-service";
import type { GroundStation } from "@/app/api/platform/ground-stations/mock";
import { Command } from "../components/commands/command";

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Flight plan name must be at least 3 characters." }),
  gsId: z
    .string()
    .min(1, { message: "Please select a ground station." })
    .refine((val) => !val.startsWith("__"), {
      message: "Please select a valid ground station.",
    }),
  satId: z
    .string()
    .min(1, { message: "Please select a satellite." })
    .refine((val) => !val.startsWith("__"), {
      message: "Please select a valid satellite.",
    }),
});

// Command type is imported from local command builder

export default function NewFlightPlanPage() {
  const router = useRouter();
  const [commands, setCommands] = useState<Command[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [groundStations, setGroundStations] = useState<GroundStation[]>([]);
  const [satellitesError, setSatellitesError] = useState<string | null>(null);
  const [groundStationsError, setGroundStationsError] = useState<string | null>(
    null
  );

  const session = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", gsId: "", satId: "" },
  });

  // Fetch satellites and ground stations on component mount
  useEffect(() => {
    const fetchSatellites = async () => {
      try {
        const satellitesData = await getSatellites();
        // Filter out any satellites with empty id or name

        setSatellites(satellitesData);
        setSatellitesError(null);
      } catch (error) {
        console.error("Error fetching satellites:", error);
        setSatellitesError("Failed to load satellites");
      }
    };

    const fetchGroundStations = async () => {
      try {
        const groundStationsData = await getGroundStations();
        // Filter out any ground stations with empty id or name
        setGroundStations(groundStationsData);
        setGroundStationsError(null);
      } catch (error) {
        console.error("Error fetching ground stations:", error);
        setGroundStationsError("Failed to load ground stations");
      }
    };

    fetchSatellites();
    fetchGroundStations();
  }, []);

  const commandBody = useMemo(() => {
    return commands.map((cmd) => {
      if (cmd.type === "TRIGGER_CAPTURE") {
        // Remove the id field from the command as it's only for UI
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...commandData } = cmd;
        return {
          commandType: cmd.type,
          captureLocation: commandData.captureLocation,
          cameraSettings: commandData.cameraSettings,
          maxOffNadirDegrees: commandData.maxOffNadirDegrees,
          maxSearchDurationHours: commandData.maxSearchDurationHours,
        };
      } else {
        // TRIGGER_PIPELINE
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...commandData } = cmd;
        return {
          commandType: cmd.type,
          executionTime: commandData.executionTime,
          mode: commandData.mode,
        };
      }
    });
  }, [commands]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session) {
      toast.error("Authentication session not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: FlightPlan = {
        id: 0, // backend will assign this
        name: values.name,
        commands: commandBody,
        gsId: Number(values.gsId),
        satId: Number(values.satId),
        status: "DRAFT",
      };

      const created = await createFlightPlan(payload);

      toast.success("Flight plan created successfully!");

      if (created?.id) {
        router.push(`/platform/flight/${created.id}`);
      } else {
        router.push("/platform/flight");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create flight plan";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">New flight plan</h1>
      </div>
      <FlightPlanSteps status={"DRAFT"} />

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Flight plan details</CardTitle>
          <CardDescription>
            Fill the required fields and author commands below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter flight plan name"
                          {...field}
                        />
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
                  name="gsId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ground station</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a ground station" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groundStationsError ? (
                            <SelectItem value="__error__" disabled>
                              {groundStationsError}
                            </SelectItem>
                          ) : groundStations.length === 0 ? (
                            <SelectItem value="__empty__" disabled>
                              No ground stations available
                            </SelectItem>
                          ) : (
                            groundStations.map((gs) => (
                              <SelectItem key={gs.id} value={String(gs.id)}>
                                {gs.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The ground station that will communicate with the
                        satellite
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="satId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Satellite</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a satellite" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {satellitesError ? (
                            <SelectItem value="__error__" disabled>
                              {satellitesError}
                            </SelectItem>
                          ) : satellites.length === 0 ? (
                            <SelectItem value="__empty__" disabled>
                              No satellites available
                            </SelectItem>
                          ) : (
                            satellites.map((sat) => (
                              <SelectItem
                                key={sat.id}
                                value={sat.id.toString()}
                              >
                                {sat.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The satellite that will execute this flight plan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Commands</h2>
                </div>
                <CommandBuilder
                  commands={commands}
                  onCommandsChange={setCommands}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/platform/flight")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !!satellitesError ||
                    !!groundStationsError ||
                    satellites.length === 0 ||
                    groundStations.length === 0 ||
                    commands.length === 0
                  }
                  title={
                    commands.length === 0 
                      ? "Add at least one command to create a flight plan" 
                      : "Create flight plan"
                  }
                  className={commands.length === 0 ? "opacity-50" : ""}
                >
                  {isSubmitting ? "Creating..." : "Create Flight Plan"}
                </Button>
              </div>
              {commands.length === 0 && (
                <div className="text-sm text-muted-foreground text-center mt-2 p-3 bg-muted/30 rounded-lg border border-dashed">
                  💡 Add at least one command above to create your flight plan
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

    </div>
  );
}
