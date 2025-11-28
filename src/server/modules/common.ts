/**
 * Defines a common interface for all application modules.
 * Modules can implement this interface to participate in lifecycle events,
 * such as resource disposal.
 */
export interface IModule {
  /**
   * Called when the application or container is shutting down.
   * Modules should release any held resources (e.g., database connections,
   * file handles, timers, event listeners) to prevent memory leaks or
   * other issues.
   *
   * @returns A Promise that resolves when disposal is complete, or void if synchronous.
   */
  dispose(): Promise<void> | void;
}
