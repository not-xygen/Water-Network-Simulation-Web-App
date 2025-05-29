export const PIXEL_TO_CM = 0.25;
export const GRAVITY_PRESSURE = 9.81;
export const MIN_SLOPE = 0.00001;
export const MIN_PRESSURE_DIFF = 0.001; // Minimum pressure difference [bar]
export const WATER_DENSITY = 997; // [kg/m³]
export const PRESSURE_CONVERSION = 0.00001; // Pa to bar
export const SIMULATION_INTERVAL = 1000; // [ms]

export const FITTING_COEFFICIENTS = {
  cross: 2.2,
  tee: 1.8,
  elbow: 0.5,
  coupling: 0.2,
  default: 0.3,
} as const;
