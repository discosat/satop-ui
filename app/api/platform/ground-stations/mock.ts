import { GroundStation } from "./types";



export const mockGroundStations: GroundStation[] = [
  {
    id: 1,
    name: "Svalbard Ground Station",
    location: { latitude: 78.2232, longitude: 15.6469, altitude: 72 },
    httpUrl: "http://svalbard.gs.example",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 2,
    name: "Vandenberg SFB",
    location: { latitude: 34.742, longitude: -120.5724, altitude: 110 },
    httpUrl: "http://vandenberg.gs.example",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 3,
    name: "Perth Ground Station",
    location: { latitude: -31.9523, longitude: 115.8613, altitude: 20 },
    httpUrl: "http://perth.gs.example",
    createdAt: new Date().toISOString(),
    isActive: false,
  },
  {
    id: 4,
    name: "Kiruna Ground Station",
    location: { latitude: 67.8558, longitude: 20.2253, altitude: 390 },
    httpUrl: "http://kiruna.gs.example",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
]; 

// We need to figure out how to associate a specific overpass with a schedule(flight plan)


// Core problem we must solve. Given a ground station and a time window. We must find out how long the satelitte should sleep after recieving the command from the groundstation before being above a specific coordinate on the earth where it will run a command to take a picture.
// We have already found the communication window with the groundstation using spg4. Now we need to find the next time the satellite will be above a specific coordinate on the earth.
// We can do this by using spg4 to propagate the satellite's position over time and check when it will be above the desired coordinate.
