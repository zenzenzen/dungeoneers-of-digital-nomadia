import {
  test,
  expect,
  type Page,
  type BrowserContext,
  type Locator,
} from "@playwright/test";
import { mkdirSync } from "node:fs";
const output = "output/playwright";
async function phase(page: Page) {
  return await page
    .locator(".table")
    .evaluateAll((nodes) => nodes[0]?.getAttribute("data-phase") ?? null);
}
async function settleUI(page: Page) {
  await expect(page.locator(".banner.error")).toHaveCount(0);
}
async function press(page: Page, button: Locator) {
  const before = await page
    .locator(".table")
    .evaluateAll((nodes) => nodes[0]?.getAttribute("data-revision") ?? null);
  await button.click();
  if (before !== null)
    await expect
      .poll(
        async () =>
          await page
            .locator(".table")
            .evaluateAll(
              (nodes) => nodes[0]?.getAttribute("data-revision") ?? null,
            ),
      )
      .not.toBe(before);
  await settleUI(page);
}

test("desktop and phone onboarding, collection, archive and overflow", async ({
  page,
  browser,
}) => {
  mkdirSync(output, { recursive: true });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Swipe Right. Regret Later." }),
  ).toBeVisible();
  await page.screenshot({
    path: `${output}/home-desktop.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Your collection" }).click();
  await expect(
    page.getByRole("heading", { name: "Emotional baggage claim." }),
  ).toBeVisible();
  await page
    .getByPlaceholder("Ghosts, red flags, questionable gear…")
    .fill("ghoster");
  await expect(page.locator(".collection-entry")).toHaveCount(1);
  await page.getByRole("button", { name: "Source archive" }).click();
  await page
    .getByPlaceholder("A class, trait, location, or joke…")
    .fill("Chronic Oversharer");
  await expect(page.locator(".archive-list details")).toHaveCount(1);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobile = await context.newPage();
  await mobile.goto("/");
  await expect(
    mobile.getByRole("button", { name: "Create a room" }),
  ).toBeVisible();
  await mobile.screenshot({
    path: `${output}/home-mobile.png`,
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await context.close();
  expect(errors).toEqual([]);
});

for (const count of [1, 3, 6])
  test(`${count} isolated browser players complete encounters, reconnect, finish and rematch`, async ({
    browser,
  }) => {
    const contexts: BrowserContext[] = [],
      pages: Page[] = [];
    const errors: string[] = [];
    try {
      for (let i = 0; i < count; i++) {
        const context = await browser.newContext({
          viewport:
            i === count - 1
              ? { width: 390, height: 844 }
              : { width: 1280, height: 960 },
        });
        contexts.push(context);
        const p = await context.newPage();
        pages.push(p);
        p.on("pageerror", (e) => errors.push(e.message));
        const code =
          i === 0
            ? ""
            : (await pages[0].locator(".invite-code strong").textContent())!;
        await p.goto(code ? `/?room=${code}` : "/");
        await p.getByLabel("Your nickname").fill(`Player ${i + 1}`);
        await p
          .getByRole("button", {
            name: i === 0 ? "Create a room" : "Join room",
          })
          .click();
        await expect(p.locator(".seat-list")).toBeVisible();
      }
      await expect(pages[0].locator(".seat-row")).toHaveCount(count);
      await pages[0]
        .getByRole("button", { name: "Deal everyone a personality" })
        .click();
      await Promise.all(
        pages.map((p) =>
          expect(p.locator(".table")).toHaveAttribute("data-phase", "prepare"),
        ),
      );
      await pages[0].screenshot({
        path: `${output}/table-${count}-desktop.png`,
        fullPage: true,
        animations: "disabled",
      });
      await pages[count - 1].screenshot({
        path: `${output}/table-${count}-mobile.png`,
        fullPage: true,
        animations: "disabled",
      });
      expect(
        await pages[count - 1].evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const originalCards = await pages[0]
        .locator(".hand-section .game-card")
        .evaluateAll((nodes) =>
          nodes.map((n) => n.getAttribute("data-card-id")),
        );
      await pages[0].reload();
      await expect(pages[0].locator(".table")).toBeVisible();
      expect(
        await pages[0]
          .locator(".hand-section .game-card")
          .evaluateAll((nodes) =>
            nodes.map((n) => n.getAttribute("data-card-id")),
          ),
      ).toEqual(originalCards);
      let battles = 0,
        actions = 0;
      for (let turns = 0; turns < 65; turns++) {
        if (await pages[0].locator(".results").count()) break;
        const activeId = await pages[0]
          .locator(".table")
          .getAttribute("data-active");
        const actor =
          pages[
            await Promise.all(
              pages.map((p) => p.locator(".table").getAttribute("data-self")),
            ).then((ids) => ids.indexOf(activeId))
          ];
        expect(actor).toBeTruthy();
        await expect(actor.locator(".table")).toHaveAttribute(
          "data-phase",
          "prepare",
        );
        const finale = actor.locator(".finale-choices button").first();
        if (await finale.count()) await press(actor, finale);
        else
          await press(
            actor,
            actor.getByRole("button", { name: "Reveal encounter" }),
          );
        if ((await phase(actor)) === "negotiate") {
          battles++;
          const selector = actor.getByLabel("Helper", { exact: true });
          const values = await selector
            .locator("option")
            .evaluateAll((nodes) =>
              nodes.map((n) => (n as HTMLOptionElement).value).filter(Boolean),
            );
          if (values.length) {
            await selector.selectOption(values[0]);
            await actor.getByLabel("Offer loot", { exact: true }).fill("1");
            await press(
              actor,
              actor.getByRole("button", { name: "Offer help deal" }),
            );
            const helperIndex = await Promise.all(
              pages.map((p) => p.locator(".table").getAttribute("data-self")),
            ).then((ids) => ids.indexOf(values[0]));
            await press(
              pages[helperIndex],
              pages[helperIndex].getByRole("button", { name: "Accept deal" }),
            );
            await expect(actor.locator(".deal-panel")).toContainText(
              "is helping",
            );
          }
          await press(
            actor,
            actor.getByRole("button", { name: "Open interventions" }),
          );
          await Promise.all(
            pages.map((p) =>
              expect(p.locator(".table")).toHaveAttribute(
                "data-phase",
                "intervene",
              ),
            ),
          );
          for (const p of pages) {
            const helpful = p
              .locator(".hand-section .game-card")
              .filter({
                has: p.locator(".card-rule", {
                  hasText: /Party \+[1-5] strength/,
                }),
              })
              .getByRole("button", { name: "Play card" })
              .first();
            if ((await helpful.count()) && (await helpful.isEnabled())) {
              await press(p, helpful);
              actions++;
            }
            await press(p, p.getByRole("button", { name: "Pass / done" }));
          }
        }
        if (await actor.locator(".results").count()) break;
        await expect(actor.locator(".table")).toHaveAttribute(
          "data-phase",
          "cleanup",
        );
        const newTrait = actor.getByRole("button", {
          name: "Discard new trait",
          exact: true,
        });
        if (await newTrait.count()) await press(actor, newTrait);
        while ((await actor.locator(".hand-section .game-card").count()) > 5)
          await press(
            actor,
            actor
              .locator(".hand-section")
              .getByRole("button", { name: "Discard", exact: true })
              .first(),
          );
        await press(actor, actor.getByRole("button", { name: "End turn" }));
      }
      await Promise.all(
        pages.map((p) => expect(p.locator(".results")).toBeVisible()),
      );
      expect(battles).toBeGreaterThan(0);
      if (count > 1) expect(actions).toBeGreaterThan(0);
      expect(errors).toEqual([]);
      await pages[0].screenshot({
        path: `${output}/results-${count}.png`,
        fullPage: true,
        animations: "disabled",
      });
      const host = pages[0]; // Host may transfer during refresh; locate the actual rematch button.
      for (const p of pages) {
        const rematch = p.getByRole("button", {
          name: "Same friends. New red flags.",
        });
        if (await rematch.count()) {
          await rematch.click();
          break;
        }
      }
      await Promise.all(
        pages.map((p) => expect(p.locator(".lobby")).toBeVisible()),
      );
      const hostIndex = (
        await Promise.all(
          pages.map((p) =>
            p
              .getByRole("button", { name: "Deal everyone a personality" })
              .count(),
          ),
        )
      ).findIndex((n) => n > 0);
      expect(hostIndex).toBeGreaterThanOrEqual(0);
      await pages[hostIndex]
        .getByRole("button", { name: "Deal everyone a personality" })
        .click();
      await Promise.all(
        pages.map((p) =>
          expect(p.locator(".table")).toHaveAttribute("data-phase", "prepare"),
        ),
      );
      await pages[0].getByRole("button", { name: "Your collection" }).click();
      await expect(
        pages[0]
          .locator(".discovery-state")
          .filter({ hasText: "✦ DISCOVERED" })
          .first(),
      ).toBeVisible();
    } finally {
      await Promise.all(contexts.map((c) => c.close()));
    }
  });
