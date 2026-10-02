import test from 'node:test';
import assert from 'node:assert/strict';
import { questionsFor, scorePHQ4, safetyState, setAnswer, toggleChoice, exampleAnswers } from '../lib/understanding.ts';

test('PHQ-4 respects all published category boundaries and subscale thresholds', () => {
  for (let a = 0; a <= 3; a++) for (let b = 0; b <= 3; b++) for (let c = 0; c <= 3; c++) for (let d = 0; d <= 3; d++) {
    const score = scorePHQ4({ phq1: `${a}`, phq2: `${b}`, phq3: `${c}`, phq4: `${d}` });
    const sum = a + b + c + d;
    assert.equal(score.total, sum);
    assert.equal(score.depression, a + b);
    assert.equal(score.anxiety, c + d);
    assert.equal(score.followUp, a + b >= 3 || c + d >= 3);
    assert.equal(score.burden, sum <= 2 ? 'geringe' : sum <= 5 ? 'leichte' : sum <= 8 ? 'mittlere' : 'starke');
  }
});
test('missing, refused, malformed and partial clinical answers never produce a score', () => {
  for (const value of [undefined, 'skipped', 'private', 'unknown', '', '4', '-1', ['0'], '0.0']) {
    assert.equal(scorePHQ4({ phq1: '0', phq2: '0', phq3: '0', phq4: value }), null);
  }
});
test('changing topic removes obsolete observed danger and irrelevant details', () => {
  const eating = { ...exampleAnswers.eating, eatingDetail: ['urgent'] };
  assert.equal(safetyState(eating), 'urgent');
  const bullying = setAnswer(eating, 'situation', 'bullying');
  assert.equal(bullying.eatingDetail, undefined);
  assert.equal(bullying.bullyingDetail, undefined);
  assert.equal(safetyState(bullying), 'unanswered');
  assert.equal(questionsFor(bullying).length, 13);
  assert.equal(questionsFor({ situation: 'other' }).length, 12);
});
test('safety decisions never depend on a low PHQ score or substitute unknown for no', () => {
  const low = { phq1: '0', phq2: '0', phq3: '0', phq4: '0', selfSafety: 'no', otherSafety: 'no' };
  assert.equal(safetyState(low), 'no-disclosure');
  assert.equal(safetyState({ ...low, selfSafety: 'yes' }), 'concern');
  assert.equal(safetyState({ ...low, otherSafety: 'yes' }), 'concern');
  assert.equal(safetyState({ ...low, bullyingDetail: ['urgent'] }), 'urgent');
  for (const status of ['unknown', 'private', 'skipped', undefined]) assert.equal(safetyState({ ...low, selfSafety: status }), 'unanswered');
});
test('exclusive choices cannot coexist with contradictory impact or support selections', () => {
  const choices = [{ id: 'a' }, { id: 'b' }, { id: 'none', exclusive: true }];
  assert.deepEqual(toggleChoice(['a', 'b'], choices[2], choices), ['none']);
  assert.deepEqual(toggleChoice(['none'], choices[0], choices), ['a']);
  assert.deepEqual(toggleChoice(['a'], choices[0], choices), []);
});
