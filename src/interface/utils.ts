export interface TimeCheckResult {
  isWithinPeriod: boolean; 
  isApproachingStart: boolean;
  startTime: Date;
  endTime: Date;
}

export interface TimeCheckConfig {
  startTime: Date | string | number;
  endTime: Date | string | number;
  threshold?: number;
  inclusiveEnd?: boolean;
}

export type DateInput = Date | string | number;

export interface TimeProgressResult {
  progress: number;
  isInPeriod: boolean;
  start: Date; 
  end: Date;
  current: Date;
}
