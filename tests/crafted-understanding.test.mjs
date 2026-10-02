import test from 'node:test';
import assert from 'node:assert/strict';
import { graph, initialState, advance, findNode, resolve, phqScore, needsHuman, selectedTopic, summaryLines } from '../lib/crafted-understanding.mjs';

test('all answer rows have unique IDs, a real reaction and a valid destination', () => {
  const ids = new Set(graph.nodes.map(n => n.id));
  assert.equal(ids.size, graph.nodes.length);
  for (const n of graph.nodes) {
    assert.equal(new Set(n.choices.map(c => c.id)).size, n.choices.length, n.id);
    for (const choice of n.choices) {
      assert.ok(choice.label && choice.reply && ids.has(choice.next), `${n.id}/${choice.id}`);
      if (choice.resume) assert.ok(ids.has(choice.resume));
      const state = { ...initialState(), current: n.id };
      assert.ok(findNode(advance(state, choice.id).current), `runtime ${n.id}/${choice.id}`);
    }
    if (n.kind === 'question') for (const id of ['unknown','private','skip']) assert.ok(n.choices.some(c => c.id === id), `${n.id}/${id}`);
    for (const source of n.sources ?? []) assert.ok(graph.sources.some(s => s.id === source));
  }
});

test('every question keeps the main choice set short and the labels scannable',()=>{
  for(const node of graph.nodes.filter(node=>node.kind==='question')){
    const main=node.choices.filter(choice=>!choice.missing);
    assert.ok(main.length<=6,`${node.id} has ${main.length} main choices`);
    for(const choice of main)assert.ok(choice.label.length<=68,`${node.id}/${choice.id} has ${choice.label.length} characters`);
  }
});

test('every node can reach the ending or a human help route; no unintended dead ends', () => {
  function canFinish(id, seen = new Set()) {
    if (['DONE','H1','H2','H3','H4'].includes(id)) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    const n = findNode(id);
    const next = [...n.choices.map(c => c.next), ...(n.rules??[]).map(r=>r.next)].filter(id=>!id.startsWith('$'));
    return next.some(id => canFinish(id, new Set(seen)));
  }
  for(const node of graph.nodes) assert.ok(canFinish(node.id),node.id);
});

const sequence = ids => ids.reduce((state,id)=>advance(state,id),initialState());
test('complete eating path gets a factual summary and the chosen first step', () => {
  const state=sequence(['start','worried','sibling','foodBody','eating','diagnosed','treatment','fits','exhausted','much','trusted','calm','no','no','no','skip']);
  assert.equal(state.current,'R0');
  assert.equal(advance(state,'step').current,'R_CALM');
  assert.match(summaryLines(state).join('\n'),/Erschöpfung/);
  assert.equal(Object.keys(state.answers).length,13);
});
test('bullying, weight and addiction all have independently runnable fixed paths',()=>{
  const starts=[
    ['relations','bullying','school','nobody'],
    ['foodBody','body','stigma','online'],
    ['addiction','gambling','money'],
  ];
  for(const branch of starts){const state=sequence(['start','mixed','sibling',...branch,'fits','helpless','some','trusted','support','no','no','no','skip','step']);assert.equal(state.current,'R_SUPPORT');}
});
test('neurodivergence, disability, school, self-worth and family paths are complete and return to the user',()=>{
  const branches=[
    ['development','neuro','diagnosed','organising','schoolhelp'],
    ['development','disability','development','participation','professional'],
    ['development','school','learning','person','confidence','school'],
    ['feelings','selfworth','said','schoolwork','listen'],
    ['development','family','conflict','well','family'],
  ];
  for(const branch of branches){
    const state=sequence(['start','mixed','child',...branch,'fits','worry','some','trusted','understand','no','no','no','skip']);
    assert.equal(state.current,'R0',branch[0]);
    assert.match(summaryLines(state).join('\n'),/Dein genauerer Schwerpunkt/,branch[0]);
  }
});
test('all 256 PHQ combinations use the original arithmetic; missing values never become zero', () => {
  for(let x=0;x<256;x++){
    const values=[0,1,2,3].map(i=>String((x>>(2*i))&3));
    const answers=Object.fromEntries(values.map((v,i)=>[`P${i+1}`,v]));
    assert.equal(phqScore(answers).total,values.reduce((sum,v)=>sum+Number(v),0));
    for(const missing of ['unknown','private','skip',undefined]){const incomplete={...answers,P2:missing};assert.equal(phqScore(incomplete),null);}
  }
});
test('danger interrupts the fixed flow and returns to the stated remaining question without clearing the concern', () => {
  let state={...initialState(),current:'S1'};
  state=advance(state,'now');assert.equal(state.current,'H1');assert.equal(state.resume,'S2');
  state=advance(state,'continue');assert.equal(state.current,'S2');
  state=advance(state,'no');assert.equal(state.current,'P0');
  assert.equal(resolve('R_NEXT',state),'R_HELP');
  assert.equal(resolve('R_PREMIUM',state),'R_HELP');
});
test('unknown and skipped safety answers never permit a sales or normal conversation recommendation',()=>{
  for(const value of ['unknown','private','skip',undefined]){
    const state={...initialState(),answers:{S1:value,S2:'no',C4:'talk'}};
    assert.equal(needsHuman(state),true);assert.equal(resolve('R_NEXT',state),'R_HELP');
  }
  const violence={...initialState(),current:'V1'};
  assert.equal(advance(violence,'control').current,'H4');
  const sourceSuicide={...initialState(),current:'D1'};
  assert.equal(advance(sourceSuicide,'suicide').helpSeen,true);
  assert.equal(selectedTopic({...initialState(),answers:{A3:'feelings',A3P:'suicide'}}),'suicide');
  assert.equal(needsHuman({...initialState(),answers:{A3:'feelings',A3P:'suicide',S1:'no',S2:'no'}}),true);
});
test('topic changes remove stale branch, follow-up and score data, retaining prior help disclosure',()=>{
  const state={...initialState(),current:'A3',answers:{A1:'mixed',E1:'diagnosed',C1:'guilt',C4:'talk',P1:'3',S1:'no'},helpSeen:true};
  const next=advance(state,'foodBody');
  assert.deepEqual(next.answers,{A1:'mixed',A3:'foodBody'});assert.equal(next.helpSeen,true);
});
test('changing the second topic menu clears a previous detailed branch but keeps the shared context',()=>{
  const state={...initialState(),current:'A4',answers:{A1:'mixed',A2:'child',A3:'development',A4:'neuro',ND1:'observed',C1:'worry'}};
  const next=advance(state,'school');
  assert.deepEqual(next.answers,{A1:'mixed',A2:'child',A3:'development',A4:'school'});
  assert.equal(next.current,'SCH1');
});
test('own problem has a complete honest offline fallback and bounded local text',()=>{
  let state=sequence(['start','mixed','sibling','careOther','own','write']);
  assert.equal(state.current,'AI1');
  state=advance(state,'save','x'.repeat(900));
  assert.equal(state.notes.ownConcern.length,800);assert.equal(state.current,'AI2');
  assert.equal(advance(state,'continue').current,'C1');assert.equal(graph.aiContract.enabled,false);
});
test('help opened during a pause keeps the original continuation independent',()=>{
  const state={...initialState(),returnTo:'E1',helpReturn:'PAUSE'};
  assert.equal(resolve('RESUME',state),'PAUSE');
  assert.equal(resolve('RETURN',state),'E1');
});
