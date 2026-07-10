import { after } from "next/server";

export function scheduleEmail(label: string, task: () => Promise<boolean>): void {
  after(async () => {
    try {
      const sent = await task();
      if (!sent) {
        console.warn(`[Email] ${label} was not sent`);
      }
    } catch (error) {
      console.error(`[Email] ${label} failed`, error);
    }
  });
}
