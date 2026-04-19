export interface BimElementRef {
  id: string;
  uuid: string;
  name?: string;
  userData?: Record<string, unknown>;
  /** Dynamically computed AEC / geometry telemetry (e.g. top face area). */
  computed?: Record<string, unknown>;
}

export interface BimElementSummary {
  id: string;
  displayName: string;
}

export type FilterMode = "none" | "isolate" | "hideUnselected";
