export const HUBS = [
  // India
  { id: "mumbai", name: "Mumbai", coordinates: [72.8777, 19.0760] as [number, number], region: "India" },
  { id: "delhi", name: "Delhi", coordinates: [77.2090, 28.6139] as [number, number], region: "India" },
  { id: "bengaluru", name: "Bengaluru", coordinates: [77.5946, 12.9716] as [number, number], region: "India" },
  { id: "kolkata", name: "Kolkata", coordinates: [88.3639, 22.5726] as [number, number], region: "India" },
  { id: "chennai", name: "Chennai", coordinates: [80.2707, 13.0827] as [number, number], region: "India" },
  { id: "hyderabad", name: "Hyderabad", coordinates: [78.4867, 17.3850] as [number, number], region: "India" },
  { id: "ahmedabad", name: "Ahmedabad", coordinates: [72.5714, 23.0225] as [number, number], region: "India" },
  // Asia Pacific
  { id: "singapore", name: "Singapore", coordinates: [103.8198, 1.3521] as [number, number], region: "Asia Pacific" },
  { id: "shanghai", name: "Shanghai", coordinates: [121.4737, 31.2304] as [number, number], region: "Asia Pacific" },
  { id: "tokyo", name: "Tokyo", coordinates: [139.6917, 35.6895] as [number, number], region: "Asia Pacific" },
  { id: "sydney", name: "Sydney", coordinates: [151.2093, -33.8688] as [number, number], region: "Asia Pacific" },
  // Middle East
  { id: "dubai", name: "Dubai", coordinates: [55.2708, 25.2048] as [number, number], region: "Middle East" },
  // Europe
  { id: "london", name: "London", coordinates: [-0.1276, 51.5074] as [number, number], region: "Europe" },
  { id: "rotterdam", name: "Rotterdam", coordinates: [4.4777, 51.9244] as [number, number], region: "Europe" },
  { id: "hamburg", name: "Hamburg", coordinates: [9.9937, 53.5511] as [number, number], region: "Europe" },
  // Americas
  { id: "newyork", name: "New York", coordinates: [-74.0060, 40.7128] as [number, number], region: "Americas" },
  { id: "losangeles", name: "Los Angeles", coordinates: [-118.2437, 34.0522] as [number, number], region: "Americas" },
  { id: "saopaulo", name: "São Paulo", coordinates: [-46.6333, -23.5505] as [number, number], region: "Americas" },
  // Africa
  { id: "lagos", name: "Lagos", coordinates: [3.3792, 6.5244] as [number, number], region: "Africa" },
  { id: "capetown", name: "Cape Town", coordinates: [18.4241, -33.9249] as [number, number], region: "Africa" },
];

export const HUB_REGIONS = [...new Set(HUBS.map(h => h.region))];
