/**
 * 로깅 유틸리티
 */

import chalk from "chalk";

export enum LogLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  SUCCESS = "success",
  DEBUG = "debug",
}

export class Logger {
  private verbose: boolean;
  private debug: boolean;

  constructor(verbose = false, debug = false) {
    this.verbose = verbose;
    this.debug = debug;
  }

  private formatMessage(message: string, level: LogLevel): string {
    const timestamp = new Date().toISOString();
    const prefix = this.getPrefix(level);
    return `${prefix} [${timestamp}] ${message}`;
  }

  private getPrefix(level: LogLevel): string {
    const prefixes = {
      [LogLevel.INFO]: chalk.blue("📝"),
      [LogLevel.WARN]: chalk.yellow("⚠️"),
      [LogLevel.ERROR]: chalk.red("❌"),
      [LogLevel.SUCCESS]: chalk.green("✅"),
      [LogLevel.DEBUG]: chalk.gray("🔍"),
    };
    return prefixes[level];
  }

  info(message: string): void {
    console.log(this.formatMessage(message, LogLevel.INFO));
  }

  warn(message: string): void {
    console.log(this.formatMessage(chalk.yellow(message), LogLevel.WARN));
  }

  error(message: string): void {
    console.log(this.formatMessage(chalk.red(message), LogLevel.ERROR));
  }

  success(message: string): void {
    console.log(this.formatMessage(chalk.green(message), LogLevel.SUCCESS));
  }

  debug(message: string): void {
    if (this.debug) {
      console.log(this.formatMessage(chalk.gray(message), LogLevel.DEBUG));
    }
  }

  verbose(message: string): void {
    if (this.verbose) {
      this.info(message);
    }
  }

  // 특별한 로깅 메서드들
  header(message: string): void {
    console.log(chalk.cyan.bold(`\n=== ${message} ===`));
  }

  subheader(message: string): void {
    console.log(chalk.cyan(`\n--- ${message} ---`));
  }

  list(items: string[], prefix = "•"): void {
    items.forEach((item) => {
      console.log(chalk.gray(`${prefix} ${item}`));
    });
  }

  table(data: Record<string, any>): void {
    const maxKeyLength = Math.max(
      ...Object.keys(data).map((key) => key.length)
    );
    Object.entries(data).forEach(([key, value]) => {
      const paddedKey = key.padEnd(maxKeyLength);
      console.log(chalk.gray(`${paddedKey}: ${value}`));
    });
  }

  progress(message: string): void {
    process.stdout.write(chalk.blue(`\r${message}`));
  }

  clearProgress(): void {
    process.stdout.write("\r" + " ".repeat(50) + "\r");
  }
}
