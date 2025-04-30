"use client";

import { FlightPlan } from "./flight-table";

// Mock data for flight plans based on the Python backend model
export const mockFlightPlans: FlightPlan[] = [
  {
    id: "7f9c6e8a-5d4b-3c2a-1e0f-9d8c7b6a5e4d",
    flight_plan: {
      name: "LED Blink Sequence",
      body: [
        {
          name: "repeat-n",
          count: 10,
          body: [
            {
              name: "gpio-write",
              pin: 16,
              value: 1
            },
            {
              name: "wait-sec",
              duration: 1
            },
            {
              name: "gpio-write",
              pin: 16,
              value: 0
            },
            {
              name: "wait-sec",
              duration: 1
            }
          ]
        }
      ]
    },
    datetime: "2025-05-12T14:30:00+01:00",
    gs_id: "86c8a92b-571a-46cb-b306-e9be71959279",
    sat_name: "DISCO-2",
    status: "pending"
  },
  {
    id: "2a1b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    flight_plan: {
      name: "Sensor Data Collection",
      body: [
        {
          name: "start-data-collection",
          sensor: "temperature",
          duration: 300
        },
        {
          name: "start-data-collection",
          sensor: "radiation",
          duration: 300
        },
        {
          name: "downlink-data",
          target: "ground"
        }
      ]
    },
    datetime: "2025-05-15T09:15:00+01:00",
    gs_id: "5f4e3d2c-1b2a-3c4d-5e6f-7g8h9i0j1k2l",
    sat_name: "ORION-1",
    status: "approved"
  },
  {
    id: "3e4d5c6b-7a8b-9c0d-1e2f-3g4h5i6j7k8l",
    flight_plan: {
      name: "Attitude Adjustment",
      body: [
        {
          name: "set-attitude",
          roll: 45,
          pitch: 10,
          yaw: 20
        },
        {
          name: "capture-image",
          camera: "main",
          format: "raw"
        }
      ]
    },
    datetime: "2025-05-03T18:45:00+01:00",
    gs_id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    sat_name: "SENTINEL-4",
    status: "approved"
  },
  {
    id: "9z8y7x6w-5v4u-3t2s-1r0q-9p8o7n6m5l4k",
    flight_plan: {
      name: "Solar Panel Deployment",
      body: [
        {
          name: "deploy-solar-panels",
          angle: 90
        },
        {
          name: "wait-min",
          duration: 10
        },
        {
          name: "check-power-levels",
          threshold: 75
        }
      ]
    },
    datetime: "2025-05-08T11:20:00+01:00",
    gs_id: "4j5k6l7m-8n9o-0p1q-2r3s-4t5u6v7w8x9y",
    sat_name: "AURORA-5",
    status: "rejected"
  },
  {
    id: "1q2w3e4r-5t6y-7u8i-9o0p-1a2s3d4f5g6h",
    flight_plan: {
      name: "Thruster Test Sequence",
      body: [
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
      ]
    },
    datetime: "2025-05-20T16:00:00+01:00",
    gs_id: "7h8j9k0l-1z2x-3c4v-5b6n-7m8a9s0d1f2g",
    sat_name: "VOYAGER-9",
    status: "pending"
  },
  {
    id: "5t6y7u8i-9o0p-1q2w-3e4r-5t6y7u8i9o0p",
    flight_plan: {
      name: "System Diagnostics",
      body: [
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
      ]
    },
    datetime: "2025-05-07T08:30:00+01:00",
    gs_id: "2s3d4f5g-6h7j-8k9l-0q1w-2e3r4t5y6u7i",
    sat_name: "PIONEER-3",
    status: "approved"
  },
  {
    id: "8k9l0p1o-2i3u-4y5t-6r7e-8w9q0a1s2d3f",
    flight_plan: {
      name: "Camera Calibration",
      body: [
        {
          name: "enable-camera",
          id: "main"
        },
        {
          name: "set-exposure",
          value: 150
        },
        {
          name: "capture-calibration",
          frames: 5
        },
        {
          name: "adjust-focus",
          value: "auto"
        },
        {
          name: "disable-camera",
          id: "main"
        }
      ]
    },
    datetime: "2025-05-22T13:45:00+01:00",
    gs_id: "3d4f5g6h-7j8k-9l0p-1o2i-3u4y5t6r7e8w",
    sat_name: "EXPLORER-1",
    status: "pending"
  }
];