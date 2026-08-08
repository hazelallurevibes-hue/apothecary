import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatThread,
  heuristicReply,
  buildUserPrompt,
  draftReply,
} from '../src/engine/reply.js';

test('formatThread includes bodies', () => {
  const s = formatThread([{ from: 'a', body: 'Hello there' }]);
  assert.match(s, /Hello there/);
  assert.match(s, /From: a/);
});

test('heuristic thread reply', () => {
  const d = heuristicReply({
    mode: 'thread',
    goal: 'confirm shipping',
    thread: [{ from: 'x', body: 'Where is my package?' }],
  });
  assert.ok(d.body.includes('Thanks'));
  assert.equal(d.provider, 'heuristic');
});

test('generic mode prompt', () => {
  const p = buildUserPrompt({ mode: 'generic', goal: 'intro' });
  assert.match(p, /first-touch|generic/i);
});

test('draftReply always returns body (LLM or fallback)', async () => {
  const d = await draftReply({
    mode: 'generic',
    goal: 'thank them',
    incoming: 'Just saying hi',
  });
  assert.ok(d.body && d.body.length > 10);
});
