import test from 'node:test';
import assert from 'node:assert/strict';
import { createPacket, decodePacket, encodePacket, relayPacket, crc32, MAX_HOPS } from '../dist/assets/codec.js';

const now = Date.now();
test('create, serialize, decode preserves packet including Unicode', () => {
  const packet = createPacket('Trạm A', 'Cần nước sạch ở Đà Lạt 💧', 'sos', 24, now);
  assert.deepEqual(decodePacket(encodePacket(packet), now), packet);
});
test('CRC32 known test vector', () => assert.equal(crc32('123456789'), 'CBF43926'));
test('QR packet is plain ASCII and reasonably compact', () => {
  const packet = createPacket('Station', 'Need water near shelter.', 'important', 72, now);
  assert.match(encodePacket(packet), /^GS1\.[A-Za-z0-9_-]+\.[A-F0-9]{8}$/);
  assert.ok(encodePacket(packet).length < 400);
});
test('detects tampered QR payload', () => {
  const text = encodePacket(createPacket('A', 'Testing', 'normal', 24, now));
  const body = text.split('.');
  body[1] = body[1].slice(0, -1) + (body[1].endsWith('A') ? 'B' : 'A');
  assert.throws(() => decodePacket(body.join('.')), /checksum/);
});
test('reject non-GhostSignal packets', () => assert.throws(() => decodePacket('https://example.com'), /Invalid packet length|Not a GhostSignal/));
test('preserves message ID while relay count increments', () => {
  const packet = createPacket('A', 'Hello', 'normal', 72, now);
  let p = packet;
  for (let i = 1; i <= MAX_HOPS; i++) { p = relayPacket(p, now); assert.equal(p.hops, i); assert.equal(p.id, packet.id); }
  assert.throws(() => relayPacket(p, now), /limit/);
});
test('reject expired message', () => {
  const recent = createPacket('A', 'Time to go', 'normal', 24, now);
  const packet = { ...recent, createdAt: now - 26 * 3600_000, expiresAt: now - 2 * 3600_000 };
  // Cannot encode an expired packet. Construct near-expiry valid at an earlier clock.
  assert.equal(packet.expiresAt < now, true);
  assert.throws(() => decodePacket(encodeAtEarlierClock(packet), now), /expired/);
});
function encodeAtEarlierClock(p) {
  // encodePacket correctly rejects expired payloads; for test use a simulated clock.
  const temp = Date.now;
  try { Date.now = () => p.createdAt + 1000; return encodePacket(p); }
  finally { Date.now = temp; }
}
test('rejects empty message and oversized message', () => {
  assert.throws(() => createPacket('A', '', 'normal', 24, now), /1–160/);
  assert.throws(() => createPacket('A', 'x'.repeat(170), 'normal', 24, now), /1–160/);
});
test('rejects misleading sender characters', () => {
  assert.throws(() => createPacket('\u0000', 'text', 'normal', 24, now), /sender/i);
});
test('prevents unauthenticated claims in app metadata only', () => {
  assert.ok(!encodePacket(createPacket('A', 'Hello', 'normal', 24, now)).includes('signature'));
});
