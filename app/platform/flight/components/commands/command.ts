export type CommandType = "TRIGGER_CAPTURE" | "TRIGGER_PIPELINE";

export interface CaptureLocation {
  latitude: number;
  longitude: number;
}

export interface CameraSettings {
  cameraId: string;
  type: number; // 0 for VMB, 1 for IR, etc.
  exposureMicroseconds: number;
  iso: number;
  numImages: number;
  intervalMicroseconds: number;
  observationId: number;
  pipelineId: number;
}

export type Command =
  | {
      type: "TRIGGER_CAPTURE";
      id: string;
      captureLocation: CaptureLocation;
      cameraSettings: CameraSettings;
    }
  | {
      type: "TRIGGER_PIPELINE";
      id: string;
      executionTime: string; // ISO 8601 format
      mode: number;
    };

export const getDefaultCameraSettings = (): CameraSettings => ({
  cameraId: "1800 U-500c",
  type: 0, // VMB
  exposureMicroseconds: 55000,
  iso: 1,
  numImages: 5,
  intervalMicroseconds: 1000000,
  observationId: 1,
  pipelineId: 1,
});

export const getDefaultCaptureLocation = (): CaptureLocation => ({
  latitude: 55.6761, // Copenhagen coordinates as default
  longitude: 12.5683,
});
