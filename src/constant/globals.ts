export const PIXEL_TO_CM = 0.25;
export const GRAVITY_PRESSURE = 9.81;
export const MIN_SLOPE = 0.00001;
export const MIN_PRESSURE_DIFF = 0.001; // Minimum pressure difference [bar]
export const WATER_DENSITY = 997; // [kg/m³]
export const PRESSURE_CONVERSION = 100000; // Pa to bar
export const SIMULATION_INTERVAL = 1000; // [ms]

export const FITTING_COEFFICIENTS = {
  cross: 0.5,
  tee: 0.3,
  elbow: 0.15,
  coupling: 0.1,
  default: 0.2,
} as const;

export const VALVE_STATUS_OPTIONS = ["open", "close"] as const;

export const IMPERIAL_PIPE_SIZES = [
  { label: '3/8"', value: 17.1 },
  { label: '1/2"', value: 21.4 },
  { label: '3/4"', value: 26.7 },
  { label: '1"', value: 33.6 },
  { label: '1 1/4"', value: 42.2 },
  { label: '1 1/2"', value: 48.3 },
  { label: '2"', value: 60.3 },
  { label: '2 1/2"', value: 75.2 },
  { label: '3"', value: 88.9 },
  { label: '4"', value: 114.3 },
  { label: '5"', value: 140.2 },
  { label: '6"', value: 168.3 },
  { label: '8"', value: 219.1 },
];
