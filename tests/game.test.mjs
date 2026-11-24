import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PENTATONIC_NOTES,
  ROCKY_PHRASES,
  INITIAL_RESOURCES,
  TRUST_LEVELS,
} from "../src/utils/constants.js";
import { resourceManager } from "../src/systems/ResourceManager.js";
import { dialogueSystem } from "../src/systems/DialogueSystem.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("game constants and Rocky musical vocabulary satisfy acoustic & index invariants", () => {
  assert.equal(GAME_WIDTH, 390);
  assert.equal(GAME_HEIGHT, 844);
  assert.equal(PENTATONIC_NOTES.length, 6);

  for (let i = 1; i < PENTATONIC_NOTES.length; i++) {
    assert.ok(
      PENTATONIC_NOTES[i].freq > PENTATONIC_NOTES[i - 1].freq,
      "pentatonic frequencies must strictly ascend"
    );
  }

  for (const [phraseName, phrase] of Object.entries(ROCKY_PHRASES)) {
    assert.equal(
      phrase.notes.length,
      phrase.rhythm.length,
      `${phraseName} notes and rhythm lengths must match`
    );
    for (const idx of phrase.notes) {
      assert.ok(
        Number.isInteger(idx) && idx >= 0 && idx < PENTATONIC_NOTES.length,
        `${phraseName} note index ${idx} out of range`
      );
    }
  }
});

test("ResourceManager clamps [0, 100], tracks critical/gameover thresholds, and resolves trust levels", () => {
  resourceManager.reset();
  assert.deepEqual(resourceManager.getStatus(), INITIAL_RESOURCES);
  assert.equal(resourceManager.isCritical(), false);
  assert.equal(resourceManager.isGameOver(), false);

  resourceManager.add("oxygen", 500);
  assert.equal(resourceManager.get("oxygen"), 100);

  resourceManager.sub("astrophageFuel", 60);
  assert.equal(resourceManager.get("astrophageFuel"), 10);
  assert.equal(resourceManager.isCritical(), true);
  assert.equal(resourceManager.isGameOver(), false);

  resourceManager.sub("astrophageFuel", 25);
  assert.equal(resourceManager.get("astrophageFuel"), 0);
  assert.equal(resourceManager.isGameOver(), true);

  for (const tier of TRUST_LEVELS) {
    resourceManager.set("rockyTrust", tier.min);
    assert.equal(resourceManager.getTrustLevel().name, tier.name);
  }
  resourceManager.reset();
});

test("DialogueSystem serves all four narrative chapters and Capacitor shell config is valid", () => {
  const expectedChapters = ["awakening", "first_contact", "friendship", "solution"];
  assert.deepEqual(
    dialogueSystem.chapters.map((c) => c.id),
    expectedChapters
  );

  for (const id of expectedChapters) {
    const lines = dialogueSystem.getAllLines(id);
    assert.ok(lines.length >= 4, `chapter ${id} should have dialogue lines`);
    assert.deepEqual(dialogueSystem.getNextLine(id, 0), lines[0]);
    assert.equal(dialogueSystem.getNextLine(id, lines.length), null);
  }

  const capConfig = JSON.parse(fs.readFileSync(path.join(ROOT, "capacitor.config.json"), "utf8"));
  assert.ok(capConfig.appId && capConfig.webDir);
  assert.ok(fs.existsSync(path.join(ROOT, "android")));
});
