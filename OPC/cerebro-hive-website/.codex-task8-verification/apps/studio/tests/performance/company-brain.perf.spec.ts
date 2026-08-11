import { expect, test } from "@playwright/test";
import { mockCompanyOperatingSystemDemo } from '../company-operating-system-demo';

test("company brain becomes interactive quickly without long tasks during deterministic pan and zoom", async ({ page }) => {
  await mockCompanyOperatingSystemDemo(page);
  const navigationStartedAt = Date.now();
  await page.goto("/app/brain?mode=demo");
  await expect(page.getByText("DEMO DATA")).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Search company brain" })).toBeEditable();
  await expect(page.getByRole("button", { name: "Department: Research" })).toBeVisible();
  const initialInteractiveMs = Date.now() - navigationStartedAt;

  const metrics = await page.evaluate(async () => {
    const longTasks: number[] = [];
    const frameDeltas: number[] = [];
    const startedAt = performance.now();
    const observer = new PerformanceObserver((entries) => {
      longTasks.push(...entries.getEntries().filter((entry) => entry.startTime >= startedAt).map((entry) => entry.duration));
    });
    observer.observe({ type: "longtask" });

    const canvas = document.querySelector(".react-flow") as HTMLElement | null;
    if (!canvas) throw new Error("Company brain canvas was not rendered");
    let previousFrame = await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    canvas.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: -180 }));
    canvas.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 480, clientY: 360 }));
    for (let frame = 1; frame <= 12; frame += 1) {
      const timestamp = await new Promise<number>((resolve) => requestAnimationFrame(resolve));
      frameDeltas.push(timestamp - previousFrame);
      previousFrame = timestamp;
      canvas.dispatchEvent(new PointerEvent("pointermove", {
        bubbles: true,
        clientX: 480 + frame * 4,
        clientY: 360 + frame * 3,
      }));
    }
    canvas.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: 520, clientY: 390 }));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    observer.disconnect();
    return { interactionMs: performance.now() - startedAt, longTasks, frameDeltas };
  });

  expect(initialInteractiveMs).toBeLessThan(2_500);
  expect(metrics.interactionMs).toBeLessThan(2_500);
  expect(metrics.frameDeltas).toHaveLength(12);
  expect(metrics.frameDeltas.every((duration) => duration <= 50)).toBe(true);
  expect(metrics.longTasks.every((duration) => duration <= 50)).toBe(true);
});
