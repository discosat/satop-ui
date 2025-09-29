import { FlightPlan } from "./flight-plan-service";


// Mock data for flight plans based on the Python backend model
export const mockFlightPlans: FlightPlan[] = [
    {
      id: 1,
      flightPlanBody: {
        name: "Camera Calibration",
        body: JSON.stringify([
          { name: "enable-camera", id: "main" },
          { name: "set-exposure", value: 150 },
          { name: "capture-calibration", frames: 5 },
          { name: "adjust-focus", value: "auto" },
          { name: "disable-camera", id: "main" },
        ]),
      },
      scheduledAt: "2025-05-22T13:45:00+01:00",
      gsId: 1,
      satId: 1,
      status: "pending",
      previousPlanId: "2",
    },
    {
      id: 2,
      flightPlanBody: {
        name: "Camera Calibration",
        body: JSON.stringify([
          { name: "enable-camera", id: "main" },
          { name: "set-exposure", value: 120 },
          { name: "capture-calibration", frames: 5 },
          { name: "adjust-focus", value: "auto" },
          { name: "disable-camera", id: "main" },
        ]),
      },
      scheduledAt: "2025-05-22T13:45:00+01:00",
      gsId: 1,
      satId: 1,
      status: "superseded",
    },
    {
      id: 3,
      flightPlanBody: {
        name: "LED Blink Sequence",
        body: JSON.stringify([
          {
            name: "repeat-n",
            count: 10,
            body: [
              { name: "gpio-write", pin: 16, value: 1 },
              { name: "wait-sec", duration: 1 },
              { name: "gpio-write", pin: 16, value: 0 },
              { name: "wait-sec", duration: 1 },
            ],
          },
        ]),
      },
      scheduledAt: "2025-05-12T14:30:00+01:00",
      gsId: 2,
      satId: 2,
      status: "pending",
    },
    {
      id: 4,
      flightPlanBody: {
        name: "Sensor Data Collection",
        body: JSON.stringify([
          { name: "start-data-collection", sensor: "temperature", duration: 300 },
          { name: "start-data-collection", sensor: "radiation", duration: 300 },
          { name: "downlink-data", target: "ground" },
        ]),
      },
      scheduledAt: "2025-05-15T09:15:00+01:00",
      gsId: 3,
      satId: 3,
      status: "approved",
      approverId: "user-abc-123",
      approvalDate: "2025-05-14T10:00:00Z",
    },
    {
      id: 5,
      flightPlanBody: {
        name: "Solar Panel Deployment",
        body: JSON.stringify([
          { name: "deploy-solar-panels", angle: 90 },
          { name: "wait-min", duration: 10 },
          { name: "check-power-levels", threshold: 75 },
        ]),
      },
      scheduledAt: "2025-05-08T11:20:00+01:00",
      gsId: 4,
      satId: 4,
      status: "rejected",
      approverId: "user-xyz-789",
      approvalDate: "2025-05-07T12:00:00Z",
    },
    {
      id: 6,
      flightPlanBody: {
        name: "Thruster Test Sequence",
        body: JSON.stringify([
          {
            name: "enable-thrusters",
            group: "attitude"
          },
          {
            name: "execute-burn",
            duration: 5,
            thrust: 25
          },
          {
            name: "wait-sec",
            duration: 30
          },
          {
            name: "execute-burn",
            duration: 5,
            thrust: 50
          },
          {
            name: "disable-thrusters",
            group: "attitude"
          }
        ])
      },
      scheduledAt: "2025-05-20T16:00:00+01:00",
      gsId: 5,
      satId: 5,
      status: "pending"
    },
    {
      id: 7,
      flightPlanBody: {
        name: "System Diagnostics",
        body: JSON.stringify([
          {
            name: "run-diagnostics",
            level: "comprehensive",
            timeout: 120
          },
          {
            name: "generate-report",
            format: "compressed"
          },
          {
            name: "transmit-data",
            priority: "high"
          }
        ])
      },
      scheduledAt: "2025-05-07T08:30:00+01:00",
      gsId: 6,
      satId: 6,
      status: "approved"
    },
  ];