"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FlightPlansTable from "./flight-table";
import { mockFlightPlans } from "./mock";
import { RefreshButton } from "@/components/refresh-button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Flight planning</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create new plan
        </Button>
      </div>
      <div className="flex flex-col">
        <span>Goddag Radu jeg har været en git terrorist igen :)</span>
      </div>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle>Scheduled Flight Plans</CardTitle>
          <CardDescription>
            View, update and approve pending satellite command sequences
            awaiting transmission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search plans..." className="pl-8" />
            </div>
            <RefreshButton onClick={() => {}} />
          </div>

          <FlightPlansTable flightPlans={mockFlightPlans} />
        </CardContent>
      </Card>

      {/*  <div className="w-full">
        <Tabs defaultValue="Scheduled">
          <TabsList className="grid w-full lg:w-80 grid-cols-2">
            <TabsTrigger value="Scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="Create New">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="Scheduled" className="mt-6">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle>Scheduled Flight Plans</CardTitle>
                <CardDescription>
                  View, update and approve pending satellite command sequences
                  awaiting transmission.
                </CardDescription>
              </CardHeader>
              <CardContent>hello other content</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="Create New" className="mt-6">
            <FlightPlanner />
          </TabsContent>
        </Tabs>
      </div> */}
    </div>
  );
}
