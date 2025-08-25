import { mockGroundStations, GroundStation } from "./mock";

export async function getGroundStations(): Promise<GroundStation[]> {
  try {
    return mockGroundStations;
  } catch (error) {
    console.error("Error fetching ground stations:", error);
    return [];
  }
}

export async function updateGroundStation(updated: GroundStation): Promise<GroundStation> {
  // Mock update: replace in-memory array item
  const idx = mockGroundStations.findIndex((g) => g.id === updated.id);
  if (idx !== -1) {
    mockGroundStations[idx] = { ...updated };
  }
  return updated;
}

export async function deleteGroundStation(id: string): Promise<{ success: boolean }> {
  const idx = mockGroundStations.findIndex((g) => g.id === id);
  if (idx !== -1) {
    mockGroundStations.splice(idx, 1);
    return { success: true };
  }
  return { success: false };
} 