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
