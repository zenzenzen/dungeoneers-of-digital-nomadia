// Offline only: assemble reviewable requests; never upload or submit them.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const check = process.argv.includes('--check');
const planPath = 'content/art-pilot/plan.v1.json';
const plan = JSON.parse(read(planPath));
const schemas = JSON.parse(read(plan.schemaFile));
const bundle = JSON.parse(read('content/launch.json'));
const style = read(plan.styleFile);
assert.equal(plan.status, 'prepared');
assert.equal(plan.submission.authorized, false);
assert.equal(plan.submission.jobsSubmitted, 0);
assert.deepEqual(plan.referenceImages, []);
assert.equal(new Set(plan.cards.map((c) => c.id)).size, plan.cards.length);
assert.equal(new Set(plan.models.map((m) => m.key)).size, plan.models.length);
const outputs = new Map();
const requests = [];
for (const selection of plan.cards) {
  const card = bundle.cards.find((c) => c.id === selection.id);
  assert.equal(card?.kind, 'monster', `Unknown monster: ${selection.id}`);
  const sourcePrompt = `content/prompt-packets/monsters/${card.id}.art.txt`;
  const sourceBrief = `content/prompt-packets/monsters/${card.id}.brief.json`;
  const original = read(sourcePrompt);
  const brief = read(sourceBrief);
  const packet = JSON.parse(brief);
  assert.equal(packet.cardId, card.id);
  assert.equal(packet.contentVersion, bundle.version, 'Rebuild source prompts first');
  assert.equal(original.trim(), packet.visual.cleanPrompt.trim());
  const prompt = `${original.trim()}\n\nRendering direction for this study:\n${style.trim()}\n`;
  assert(!/\{\{|cash_cp|therapy_healedness|immutableMechanics|sourceRefs|\bgp\b/.test(prompt));
  const promptFile = `content/art-pilot/prepared/${card.id}.art.txt`;
  outputs.set(promptFile, prompt);
  for (const model of plan.models) {
    const schema = schemas.models.find((s) => s.id === model.params.model);
    assert(schema, `Missing schema for ${model.key}`);
    assert(schema.aspect_ratios.includes(model.params.aspect_ratio));
    assert.equal(model.params.count, 1);
    for (const [key, value] of Object.entries(model.params)) {
      if (['model', 'aspect_ratio', 'count'].includes(key)) continue;
      const parameter = schema.parameters.find((p) => p.name === key);
      assert(parameter, `Unsupported ${key} for ${model.key}`);
      assert(parameter.options?.includes(value), `Unsupported ${key}=${value}`);
    }
    const requestId = `${card.id}__${model.key}`;
    const args = { params: { ...model.params, prompt } };
    const requestFile = `content/art-pilot/prepared/${requestId}.request.json`;
    const requestText = json(args);
    outputs.set(requestFile, requestText);
    requests.push({
      id: requestId,
      cardId: card.id,
      name: card.name,
      model: model.label,
      status: 'prepared',
      sourcePrompt,
      sourcePromptSha256: sha256(original),
      sourceBrief,
      sourceBriefSha256: sha256(brief),
      promptFile,
      promptSha256: sha256(prompt),
      requestFile,
      requestSha256: sha256(requestText),
      sceneChecks: selection.tests,
      providerJobId: null,
      result: null,
    });
  }
}
assert.equal(requests.length, 6, 'Pilot is bounded to three monsters and two models');
outputs.set('content/art-pilot/prepared/manifest.json', json({
  schemaVersion: 1,
  id: plan.id,
  status: 'prepared',
  contentVersion: bundle.version,
  planSha256: sha256(read(planPath)),
  styleSha256: sha256(style),
  schemaSha256: sha256(read(plan.schemaFile)),
  requestTool: 'higgsfield_generate_image',
  referenceImages: [],
  requests,
}));
outputs.set('content/art-pilot/prepared/review-template.csv',
  'request_id,joke_0_5,phone_readability_0_5,style_0_5,anatomy_0_5,scene_fidelity_0_5,hard_failures,decision,notes\n' +
  requests.map((r) => `${r.id},,,,,,,pending,`).join('\n') + '\n');
for (const [path, expected] of outputs) {
  if (check) assert.equal(read(path), expected, `Stale preparation: ${path}; run npm run art:prepare`);
  else {
    mkdirSync(new URL('.', new URL(path, root)), { recursive: true });
    writeFileSync(new URL(path, root), expected);
  }
}
console.log(`${check ? 'Verified' : 'Prepared'} ${requests.length} image requests and ${outputs.size} files. No provider calls.`);
