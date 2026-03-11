export interface JobDefinition {
  name: string;
  intervalMs: number;
  run: () => Promise<void> | void;
}
