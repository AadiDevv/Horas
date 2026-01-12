export class Logger {
  static info(message: string, ...args: any[]): void {
  }

  static error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args);
  }
}
