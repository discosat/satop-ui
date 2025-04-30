import { FlightPlan } from "./flight-table";

// Mock flight plans for testing
export const mockFlightPlans: FlightPlan[] = [
  {
    id: "fp-1",
    flight_plan: {
      name: "Imagery Capture Sequence A",
      body: [
        {
          name: "capture_image",
          cameraID: "cam1",
          exposure: 100,
          numOfImages: 5,
        },
        { name: "wait-sec", duration: 10 },
        {
          name: "capture_image",
          cameraID: "cam2",
          exposure: 200,
          numOfImages: 3,
        },
      ],
    },
    datetime: "2024-06-15T14:30:00Z",
    gs_id: "gs-copenhagen-01",
    sat_name: "DISCO-SAT-1",
    status: "pending",
  },
  {
    id: "fp-2",
    flight_plan: {
      name: "Telemetry Collection",
      body: [
        { name: "gpio-write", pin: 5, value: 1 },
        { name: "wait-sec", duration: 5 },
        { name: "gpio-write", pin: 5, value: 0 },
      ],
    },
    datetime: "2024-06-16T09:15:00Z",
    gs_id: "gs-aalborg-02",
    sat_name: "DISCO-SAT-2",
    status: "approved",
  },
  {
    id: "fp-3",
    flight_plan: {
      name: "Orbit Adjustment",
      body: [
        { name: "if", cond: "altitude < 500" },
        { name: "gpio-write", pin: 8, value: 1 },
        { name: "wait-sec", duration: 30 },
        { name: "gpio-write", pin: 8, value: 0 },
      ],
    },
    datetime: "2024-06-17T16:45:00Z",
    gs_id: "gs-aarhus-03",
    sat_name: "DISCO-SAT-1",
    status: "rejected",
  },
  {
    id: "fp-4",
    flight_plan: {
      name: "Experimental Payload Test",
      body: [
        { name: "repeat-n", count: 3 },
        { name: "gpio-write", pin: 12, value: 1 },
        { name: "wait-sec", duration: 15 },
        { name: "gpio-write", pin: 12, value: 0 },
        { name: "wait-sec", duration: 15 },
      ],
    },
    datetime: "2024-06-18T11:00:00Z",
    gs_id: "gs-copenhagen-01",
    sat_name: "DISCO-SAT-3",
    status: "pending",
  },
];
