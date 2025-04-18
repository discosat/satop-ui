import FlightPlanner from "./flight-planner";

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Flight planning</h1>
      <FlightPlanner/>
    </div>
  );
}
