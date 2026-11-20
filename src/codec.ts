/** GhostSignal protocol v1. Human-relayed, unauthenticated, unencrypted payloads. */
export type Priority = 'normal' | 'important' | 'sos';
export const MAX_HOPS = 6;
export const MAX_BODY_CHARS = 160;
export const MAX_ALIAS_CHARS = 24;
export const MAX_WIRE_CHARS = 850;
export const MAX_TTL_HOURS = 168;
export const PRIORITIES: Priority[] = ['normal', 'important', 'sos'];

export interface Packet {
  id: string;
  createdAt: number;
  expiresAt: number;
  priority: Priority;
  alias: string;
  body: string;
  hops: number;
  maxHops: number;
}

export interface StoredMessage extends Packet {
  direction: 'outgoing' | 'incoming';
  receivedAt: number;
  relayCount: number;
}

export function makeId(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function createPacket(alias: string, body: string, priority: Priority = 'normal', ttlHours = 72, now = Date.now()): Packet {
  const packet: Packet = {
    id: makeId(), createdAt: now, expiresAt: now + ttlHours * 3600_000,
    priority, alias: alias.trim() || 'Anonymous', body: body.trim(), hops: 0, maxHops: MAX_HOPS
  };
  assertValid(packet, now);
  encodePacket(packet);
  return packet;
}

export function assertValid(packet: Packet, now = Date.now()): void {
  if (!/^[A-F0-9]{18}$/.test(packet.id)) throw new Error('Invalid message ID.');
  if (!Number.isSafeInteger(packet.createdAt) || !Number.isSafeInteger(packet.expiresAt)) throw new Error('Invalid timestamp.');
  if (packet.createdAt > now + 10 * 60_000) throw new Error('Message timestamp is too far in the future.');
  if (packet.expiresAt <= now) throw new Error('This message has expired.');
  if (packet.expiresAt - packet.createdAt > MAX_TTL_HOURS * 3600_000 || packet.expiresAt <= packet.createdAt) throw new Error('Invalid expiry window.');
  if (!PRIORITIES.includes(packet.priority)) throw new Error('Invalid priority.');
  if (typeof packet.alias !== 'string' || !packet.alias.trim() || [...packet.alias].length > MAX_ALIAS_CHARS || /[\x00-\x1f]/.test(packet.alias)) throw new Error('Sender label must be 1–24 visible characters.');
  if (typeof packet.body !== 'string' || !packet.body.trim() || [...packet.body].length > MAX_BODY_CHARS || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(packet.body)) throw new Error('Message must be 1–160 characters.');
  if (!Number.isInteger(packet.hops) || !Number.isInteger(packet.maxHops) || packet.maxHops !== MAX_HOPS || packet.hops < 0 || packet.hops > MAX_HOPS) throw new Error('Invalid relay information.');
}

function toBase64url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64url(data: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(data)) throw new Error('Invalid encoded characters.');
  const binary = atob(data.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - data.length % 4) % 4));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

// CRC32 detects accidental corruption; it is NOT a cryptographic signature.
export function crc32(text: string): string {
  let crc = 0xffffffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i);
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0').toUpperCase();
}

export function encodePacket(packet: Packet): string {
  assertValid(packet);
  const content = [1, packet.id, packet.createdAt.toString(36), packet.expiresAt.toString(36), PRIORITIES.indexOf(packet.priority), packet.alias, packet.body, packet.hops, packet.maxHops];
  const data = toBase64url(JSON.stringify(content));
  const wire = `GS1.${data}.${crc32(data)}`;
  if (wire.length > MAX_WIRE_CHARS) throw new Error('Message is too large for a reliably scannable QR. Shorten the text.');
  return wire;
}

export function decodePacket(wire: string, now = Date.now()): Packet {
  const text = wire.trim();
  if (text.length > MAX_WIRE_CHARS || text.length < 20) throw new Error('Invalid packet length.');
  const match = /^GS1\.([A-Za-z0-9_-]+)\.([A-F0-9]{8})$/.exec(text);
  if (!match) throw new Error('Not a GhostSignal v1 message. Paste the full GS1 packet.');
  if (crc32(match[1]) !== match[2]) throw new Error('Packet checksum failed. Please scan it again.');
  let tuple: unknown;
  try { tuple = JSON.parse(fromBase64url(match[1])); }
  catch { throw new Error('Unable to decode QR payload.'); }
  if (!Array.isArray(tuple) || tuple.length !== 9 || tuple[0] !== 1) throw new Error('Unsupported packet format.');
  const [,, created, expires, priority, alias, body, hops, maxHops] = tuple;
  if (typeof created !== 'string' || !/^[0-9a-z]+$/.test(created) || typeof expires !== 'string' || !/^[0-9a-z]+$/.test(expires)) throw new Error('Invalid packet timestamps.');
  if (!Number.isInteger(priority) || priority < 0 || priority >= PRIORITIES.length) throw new Error('Invalid packet priority.');
  const packet: Packet = {
    id: tuple[1], createdAt: parseInt(created, 36), expiresAt: parseInt(expires, 36),
    priority: PRIORITIES[priority], alias, body, hops, maxHops
  };
  assertValid(packet, now);
  return packet;
}

export function relayPacket(packet: Packet, now = Date.now()): Packet {
  assertValid(packet, now);
  if (packet.hops >= packet.maxHops) throw new Error('Relay limit reached. This message cannot be forwarded.');
  const relayed = { ...packet, hops: packet.hops + 1 };
  encodePacket(relayed);
  return relayed;
}

export function asStored(packet: Packet, direction: StoredMessage['direction'], now = Date.now()): StoredMessage {
  return { ...packet, direction, receivedAt: now, relayCount: 0 };
}
