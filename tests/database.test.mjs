import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

// Execute the real migration against PostgreSQL, including role permissions and RLS.
// Only Supabase's auth.users/auth.uid surface is replaced by local test fixtures.
test('shared volleyball database security and lifecycle', async (t) => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
      grant usage on schema auth, public to anon, authenticated;
    `);
    await db.exec(await readFile(new URL('../supabase/migrations/202608310001_shared_volleyball.sql', import.meta.url), 'utf8'));
    const users = Array.from({ length: 6 }, () => randomUUID());
    for (let i = 0; i < users.length; i++) {
      await db.query('insert into auth.users(id) values ($1)', [users[i]]);
      await db.query('insert into public.profiles(id, display_name, gender) values ($1, $2, $3)', [users[i], `Player ${i}`, i === 2 || i === 3 ? 'Female' : 'Male']);
    }
    const [a, b, c, d, outsider, extra] = users;
    async function as(user, sql, params = []) {
      return db.transaction(async (tx) => {
        await tx.exec(`set local role ${user ? 'authenticated' : 'anon'}`);
        await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [user ?? '']);
        return tx.query(sql, params);
      });
    }
    const create = async (user = a, category = 'Open', id = randomUUID()) => {
      await as(user, "select public.create_match('Test Court', now() + interval '1 day', $1, 'Intermediate', $2)", [category, id]);
      return id;
    };
    const join = (user, id, team) => as(user, 'select public.join_match($1, $2::smallint)', [id, team]);
    const report = (user, id, team = 1, score = '21-18, 21-19') => as(user, 'select public.report_result($1, $2::smallint, $3)', [id, team, score]);
    const result = async (id) => (await db.query('select * from public.match_results where match_id = $1', [id])).rows[0];
    const review = (user, id, confirm, stamp) => as(user, 'select public.review_result($1, $2, $3)', [id, confirm, stamp]);
    const start = (id) => db.query("update public.matches set starts_at = now() - interval '1 hour' where id = $1", [id]);

    await t.test('anonymous users cannot read player data or invoke match functions', async () => {
      await assert.rejects(as(null, 'select * from public.profiles'), /permission denied/);
      await assert.rejects(as(null, 'select * from public.matches'), /permission denied/);
      await assert.rejects(create(null), /permission denied/);
    });
    await t.test('profiles are self-owned; emails do not exist in the public profile', async () => {
      const changed = await as(a, "update public.profiles set display_name = 'Forged' where id = $1 returning id", [b]);
      assert.equal(changed.rows.length, 0);
      await as(a, "update public.profiles set display_name = 'My name' where id = $1", [a]);
      await assert.rejects(as(a, 'update public.profiles set id = $1 where id = $2', [outsider, a]), /permission denied/);
      await assert.rejects(as(a, 'select email from public.profiles'), /does not exist/);
      await assert.rejects(as(a, 'insert into public.profiles(id, display_name, gender) values ($1, $2, $3)', [randomUUID(), 'Forged', 'Male']), /row-level security/);
    });
    await t.test('create adds the organizer atomically and retries return the same match', async () => {
      const id = await create();
      await create(a, 'Open', id);
      assert.equal((await as(a, 'select * from public.matches where id = $1', [id])).rows.length, 1);
      assert.equal((await as(a, 'select * from public.match_members where match_id = $1', [id])).rows.length, 1);
      await assert.rejects(as(a, "select public.create_match('Court', now() - interval '1 hour', 'Open', 'Intermediate', $1)", [randomUUID()]), /future/);
      await assert.rejects(create(a, 'Women'), /category/);
      await assert.rejects(create(a, 'Not a category'), /check constraint/);
    });
    await t.test('direct writes cannot bypass the transactional match rules', async () => {
      const id = await create();
      await assert.rejects(as(a, 'insert into public.match_members(match_id, user_id, team) values ($1, $2, 2)', [id, outsider]), /permission denied/);
      await assert.rejects(as(a, "update public.matches set status = 'completed' where id = $1", [id]), /permission denied/);
      await assert.rejects(as(a, "insert into public.match_results(match_id, reporter_id, winning_team, score) values ($1, $2, 1, 'fake')", [id, a]), /permission denied/);
      await assert.rejects(as(a, "insert into public.courts(created_by, name, lat, lng) values ($1, 'Forged Court', 28, -15)", [b]), /row-level security/);
    });
    await t.test('joins are idempotent and capacity is enforced per team', async () => {
      const id = await create();
      await join(b, id, 1); await join(b, id, 1);
      await assert.rejects(join(outsider, id, 1), /full/);
      await join(c, id, 2); await join(d, id, 2);
      await assert.rejects(join(extra, id, 2), /full/);
      assert.equal((await as(a, 'select * from public.match_members where match_id = $1', [id])).rows.length, 4);
      await assert.rejects(join(extra, id, 3), /Choose team/);
    });
    await t.test('mixed category enforces one male and one female player per team', async () => {
      const id = await create(a, 'Mixed');
      await assert.rejects(join(b, id, 1), /Mixed teams/);
      await join(c, id, 1); await join(b, id, 2); await join(d, id, 2);
    });
    await t.test('only participants report; require four players and the start time', async () => {
      const id = await create();
      await assert.rejects(report(outsider, id), /Only participants/);
      await assert.rejects(report(a, id), /after the match starts/);
      await start(id);
      await assert.rejects(report(a, id), /four participants/);
      await assert.rejects(join(b, id, 1), /no longer accepting/);
    });
    await t.test('opposing team confirms, locks membership, and makes the result immutable', async () => {
      const id = await create();
      await join(b, id, 1); await join(c, id, 2); await join(d, id, 2); await start(id);
      await report(a, id); await report(a, id);
      const stamp = (await result(id)).reported_at;
      await assert.rejects(review(a, id, true, stamp), /opposing team/);
      await assert.rejects(review(b, id, true, stamp), /opposing team/);
      await assert.rejects(review(outsider, id, true, stamp), /opposing team/);
      await assert.rejects(as(b, 'select public.leave_match($1)', [id]), /locked/);
      await assert.rejects(review(c, id, true, new Date(0).toISOString()), /result changed/);
      await review(c, id, true, stamp); await review(c, id, true, stamp);
      assert.equal((await result(id)).status, 'confirmed');
      assert.equal((await db.query('select status from public.matches where id = $1', [id])).rows[0].status, 'completed');
      await assert.rejects(report(a, id, 2, 'other'), /already pending or confirmed/);
      await assert.rejects(review(d, id, false, stamp), /already been reviewed/);
    });
    await t.test('disputed results can be corrected and old confirmations are rejected', async () => {
      const id = await create();
      await join(b, id, 1); await join(c, id, 2); await join(d, id, 2); await start(id);
      await report(a, id);
      const oldStamp = (await result(id)).reported_at;
      await review(c, id, false, oldStamp);
      assert.equal((await result(id)).status, 'disputed');
      await report(c, id, 2, '18-21, 19-21');
      await assert.rejects(review(b, id, true, oldStamp), /result changed/);
      await review(b, id, true, (await result(id)).reported_at);
      assert.equal((await result(id)).winning_team, 2);
    });
    await t.test('participants may leave; only organizer cancels; cancelled matches reject joins', async () => {
      const id = await create();
      await join(b, id, 1);
      await as(b, 'select public.leave_match($1)', [id]);
      await assert.rejects(as(a, 'select public.leave_match($1)', [id]), /organizer/);
      await assert.rejects(as(outsider, 'select public.cancel_match($1)', [id]), /Only the organizer/);
      await as(a, 'select public.cancel_match($1)', [id]);
      await as(a, 'select public.cancel_match($1)', [id]);
      await assert.rejects(join(b, id, 1), /no longer accepting/);
    });
  } finally { await db.close(); }
});
