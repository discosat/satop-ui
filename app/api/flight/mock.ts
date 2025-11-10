import { FlightPlan, CompileToCshResult, FlightPlanImage } from "./types";


// Mock data for flight plans based on the Python backend model
export const mockFlightPlans: FlightPlan[] = [
    {
      id: 1,
      name: "Camera Calibration",
      commands: [
        { name: "enable-camera", id: "main" },
        { name: "set-exposure", value: 150 },
        { name: "capture-calibration", frames: 5 },
        { name: "adjust-focus", value: "auto" },
        { name: "disable-camera", id: "main" },
      ],
      scheduledAt: "2025-05-22T13:45:00+01:00",
      gsId: 1,
      satId: 1,
      status: "TRANSMITTED",
      previousPlanId: 2,
      createdById: 1,
      approvedById: 2,
      approvalDate: "2025-05-21T10:00:00Z",
      createdAt: "2025-05-20T08:30:00Z",
      updatedAt: "2025-05-21T10:00:00Z",
    },
    {
      id: 2,
      name: "Camera Calibration",
      commands: [
        { name: "enable-camera", id: "main" },
        { name: "set-exposure", value: 120 },
        { name: "capture-calibration", frames: 5 },
        { name: "adjust-focus", value: "auto" },
        { name: "disable-camera", id: "main" },
      ],
      scheduledAt: "2025-05-22T13:45:00+01:00",
      gsId: 1,
      satId: 1,
      status: "SUPERSEDED",
      createdById: 1,
      createdAt: "2025-05-19T14:00:00Z",
      updatedAt: "2025-05-20T08:30:00Z",
    },
    {
      id: 3,
      name: "LED Blink Sequence",
      commands: [
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
      ],
      scheduledAt: "2025-05-12T14:30:00+01:00",
      gsId: 2,
      satId: 2,
      status: "DRAFT",
      createdById: 3,
      createdAt: "2025-05-11T09:00:00Z",
      updatedAt: "2025-05-11T09:00:00Z",
    },
    {
      id: 4,
      name: "Sensor Data Collection",
      commands: [
        { name: "start-data-collection", sensor: "temperature", duration: 300 },
        { name: "start-data-collection", sensor: "radiation", duration: 300 },
        { name: "downlink-data", target: "ground" },
      ],
      scheduledAt: "2025-05-15T09:15:00+01:00",
      gsId: 3,
      satId: 3,
      status: "TRANSMITTED",
      createdById: 1,
      approvedById: 2,
      approvalDate: "2025-05-14T10:00:00Z",
      createdAt: "2025-05-13T11:30:00Z",
      updatedAt: "2025-05-14T10:00:00Z",
    },
    {
      id: 5,
      name: "Solar Panel Deployment",
      commands: [
        { name: "deploy-solar-panels", angle: 90 },
        { name: "wait-min", duration: 10 },
        { name: "check-power-levels", threshold: 75 },
      ],
      scheduledAt: "2025-05-08T11:20:00+01:00",
      gsId: 4,
      satId: 4,
      status: "REJECTED",
      createdById: 3,
      approvedById: 1,
      approvalDate: "2025-05-07T12:00:00Z",
      createdAt: "2025-05-06T15:00:00Z",
      updatedAt: "2025-05-07T12:00:00Z",
    },
    {
      id: 6,
      name: "Thruster Test Sequence",
      commands: [
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
      ],
      scheduledAt: "2025-05-20T16:00:00+01:00",
      gsId: 5,
      satId: 5,
      status: "DRAFT",
      createdById: 2,
      createdAt: "2025-05-19T10:00:00Z",
      updatedAt: "2025-05-19T10:00:00Z",
    },
    {
      id: 7,
      name: "System Diagnostics",
      commands: [
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
      ],
      scheduledAt: "2025-05-07T08:30:00+01:00",
      gsId: 6,
      satId: 6,
      status: "APPROVED",
      createdById: 1,
      approvedById: 2,
      approvalDate: "2025-05-06T16:00:00Z",
      createdAt: "2025-05-05T13:00:00Z",
      updatedAt: "2025-05-06T16:00:00Z",
    },
  ];

// Mock images for flight plans
export const mockFlightPlanImages: Record<number, FlightPlanImage[]> = {
  1: [
    {
      imageId: 123,
      flightPlanId: 1,
      fileName: "image_25544_20251110_143022_capture.jpg",
      captureTime: "2025-11-10T14:30:22Z",
      url: "https://picsum.photos/seed/sat1-img1/1920/1080",
      expiresAt: "2025-11-10T15:30:22Z",
      contentType: "image/jpeg",
      fileSize: 2048576,
      latitude: 56.172,
      longitude: 10.191
    },
    {
      imageId: 124,
      flightPlanId: 1,
      fileName: "image_25544_20251110_143523_capture.jpg",
      captureTime: "2025-11-10T14:35:23Z",
      url: "https://picsum.photos/seed/sat1-img2/1920/1080",
      expiresAt: "2025-11-10T15:35:23Z",
      contentType: "image/jpeg",
      fileSize: 1987432,
      latitude: 56.180,
      longitude: 10.195
    },
    {
      imageId: 125,
      flightPlanId: 1,
      fileName: "image_25544_20251110_144012_capture.jpg",
      captureTime: "2025-11-10T14:40:12Z",
      url: "https://picsum.photos/seed/sat1-img3/1920/1080",
      expiresAt: "2025-11-10T15:40:12Z",
      contentType: "image/jpeg",
      fileSize: 2134567,
      latitude: 56.188,
      longitude: 10.199
    }
  ],
  4: [
    {
      imageId: 201,
      flightPlanId: 4,
      fileName: "image_25544_20251108_091522_capture.jpg",
      captureTime: "2025-11-08T09:15:22Z",
      url: "https://picsum.photos/seed/sat3-img1/1920/1080",
      expiresAt: "2025-11-08T10:15:22Z",
      contentType: "image/jpeg",
      fileSize: 1845321,
      latitude: 55.676,
      longitude: 12.568
    },
    {
      imageId: 202,
      flightPlanId: 4,
      fileName: "image_25544_20251108_091845_capture.jpg",
      captureTime: "2025-11-08T09:18:45Z",
      url: "https://picsum.photos/seed/sat3-img2/1920/1080",
      expiresAt: "2025-11-08T10:18:45Z",
      contentType: "image/jpeg",
      fileSize: 1923456,
      latitude: 55.685,
      longitude: 12.575
    }
  ]
};

// Mock CSH script compilation for flight plans
export function generateMockCshScript(flightPlanId: number): CompileToCshResult {
  // Example CSH script generation based on a sample TRIGGER_CAPTURE command
  // This would normally be generated from the actual commands in the flight plan
  const scripts = [
    `set camera_id_param "CAM-${flightPlanId}" -n CameraController`,
    `set camera_type_param 1 -n CameraController`,
    `set exposure_param 1000 -n CameraController`,
    `set iso_param 100 -n CameraController`,
    `set num_images_param 5 -n CameraController`,
    `set interval_param 500000 -n CameraController`,
    `set obid_param 1 -n CameraController`,
    `set pipeline_id_param ${flightPlanId} -n CameraController`,
    `set capture_param 1 -n CameraController`,
  ];

  return {
    script: scripts,
  };
}