import { asStored, createPacket, decodePacket, encodePacket, MAX_BODY_CHARS, relayPacket } from './codec.js';
import { allMessages, deleteMessage, getPreferredAlias, putMessage, setPreferredAlias } from './store.js';
import { qrCanvas } from './qr.js';
import { canScanNatively, CameraScanner, decodeImage } from './scanner.js';
const labels = { compose: 'Compose a signal', inbox: 'Your message archive', receive: 'Receive a signal', guide: 'How it works' };
const order = ['compose', 'inbox', 'receive', 'guide'];
const $ = (selector) => {
    const element = document.querySelector(selector);
    if (!element)
        throw new Error(`Missing UI element: ${selector}`);
    return element;
};
const icon = (id) => `<svg class="ico"><use href="#i-${id}"/></svg>`;
const escapeHtml = (s) => s.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char);
const prettyTime = (time) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(time);
const pad2 = (number) => String(number).padStart(2, '0');
const scanner = new CameraScanner();
let messages = [];
let active = null;
let filter = 'all';
let search = '';
let viewedId = null;
let toastTimeout = 0;
function toast(message, error = false) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.toggle('error', error);
    el.hidden = false;
    if (toastTimeout)
        clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => { el.hidden = true; }, 4300);
}
function setView(view) {
    document.querySelectorAll('[data-view]').forEach(element => {
        const selected = element.dataset.view === view;
        element.classList.toggle('active', selected);
        element.hidden = !selected;
    });
    document.querySelectorAll('[data-nav]').forEach(element => {
        element.classList.toggle('active', element.dataset.nav === view);
        if (element instanceof HTMLButtonElement)
            element.setAttribute('aria-current', element.dataset.nav === view ? 'page' : 'false');
    });
    $('#breadcrumb-current').textContent = view.toUpperCase();
    $('#view-heading').textContent = labels[view];
    $('#view-index').textContent = `${pad2(order.indexOf(view) + 1)} / 04`;
    if (view !== 'receive' && scanner.isRunning())
        stopCamera();
    if (view === 'inbox')
        renderInbox();
    if (view === 'receive')
        updateCameraSupport();
    if (window.innerWidth <= 740)
        window.scrollTo({ top: 0, behavior: 'smooth' });
}
function updateNetwork() {
    const online = navigator.onLine;
    $('#network-text').textContent = online ? 'BROWSER ONLINE' : 'BROWSER OFFLINE';
    const indicator = $('#network-indicator');
    indicator.style.backgroundColor = online ? 'var(--lime)' : 'var(--amber)';
    $('#side-status').textContent = navigator.serviceWorker?.controller ? 'OFFLINE CACHE ACTIVE' : 'LOCAL STORAGE READY';
}
function runClock() {
    $('#utc-time').textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()) + ' UTC';
}
function renderStats() {
    $('#stat-total').textContent = pad2(messages.length);
    $('#stat-sos').textContent = pad2(messages.filter(msg => msg.priority === 'sos').length);
    $('#nav-inbox-count').textContent = String(messages.length);
    $('#inbox-total').textContent = `${messages.length} MESSAGE${messages.length === 1 ? '' : 'S'}`;
}
function renderInbox() {
    const box = $('#message-list');
    const results = messages.filter(msg => {
        if (filter !== 'all' && msg.priority !== filter)
            return false;
        if (search && !`${msg.body} ${msg.alias} ${msg.id}`.toLowerCase().includes(search.toLowerCase()))
            return false;
        return true;
    });
    if (!results.length) {
        box.innerHTML = `<div class="empty-inbox">${icon('inbox')}<strong>${messages.length ? 'No matching signals' : 'The archive is quiet'}</strong><p>${messages.length ? 'Try adjusting your search or filter.' : 'New and received messages will appear here — saved locally, ready to relay.'}</p><button class="secondary-btn" data-nav="compose">${icon('pencil')} Create a message</button></div>`;
        return;
    }
    box.innerHTML = results.map(msg => {
        const mark = msg.priority === 'sos' ? '✳' : msg.priority === 'important' ? '◆' : '◉';
        const expired = msg.expiresAt <= Date.now();
        return `<div class="message-row"><div class="message-priority ${msg.priority}" title="${msg.priority}">${mark}</div><div class="message-main"><strong>${escapeHtml(msg.alias)} ${expired ? '<small>· EXPIRED</small>' : ''}</strong><p>${escapeHtml(msg.body)}</p><small>${msg.direction === 'incoming' ? 'RECEIVED' : 'CREATED'} <span>·</span> ${escapeHtml(prettyTime(msg.receivedAt))} <span>·</span> ${msg.hops}/${msg.maxHops} hops</small></div><button class="secondary-btn" data-open-id="${msg.id}" aria-label="View message ${msg.id}">${icon('eye')} View</button></div>`;
    }).join('');
}
function renderQr() {
    const empty = $('#qr-placeholder');
    const ready = $('#qr-ready');
    if (!active) {
        empty.hidden = false;
        ready.hidden = true;
        $('#qr-status').textContent = 'NO ACTIVE SIGNAL';
        return;
    }
    const canvas = qrCanvas(active);
    empty.hidden = true;
    ready.hidden = false;
    $('#qr-status').textContent = active.priority.toUpperCase() + ' / GS1';
    $('#qr-mount').replaceChildren(canvas);
    $('#qr-packet-id').textContent = active.id.slice(0, 9) + '…';
    $('#qr-hops').textContent = `${active.hops} / ${active.maxHops}`;
    $('#qr-expiry').textContent = prettyTime(active.expiresAt);
}
async function reload() { messages = await allMessages(); renderStats(); renderInbox(); }
async function makeMessage(event) {
    event.preventDefault();
    const alias = $('#alias');
    const message = $('#message');
    const expiry = $('#expiry');
    const priority = document.querySelector('input[name=priority]:checked').value;
    try {
        const packet = createPacket(alias.value || 'Anonymous', message.value, priority, Number(expiry.value));
        await putMessage(asStored(packet, 'outgoing'));
        setPreferredAlias(alias.value.trim());
        active = packet;
        renderQr();
        await reload();
        toast('Signal created and saved. Show the QR to another device.');
        if (window.innerWidth <= 740)
            showLargeQr();
    }
    catch (error) {
        toast(error instanceof Error ? error.message : 'Could not create this signal.', true);
    }
}
async function importText(value) {
    try {
        const packet = decodePacket(value);
        if (messages.find(msg => msg.id === packet.id)) {
            toast('Duplicate packet: this message is already in your inbox.', true);
            return;
        }
        await putMessage(asStored(packet, 'incoming'));
        await reload();
        $('#packet-import').value = '';
        active = packet;
        renderQr();
        setView('inbox');
        toast('Signal received and stored offline.');
    }
    catch (error) {
        toast(error instanceof Error ? error.message : 'Invalid GhostSignal packet.', true);
    }
}
async function shareAsQr(message) {
    try {
        const packet = relayPacket(message);
        await putMessage({ ...message, relayCount: message.relayCount + 1 });
        active = packet;
        renderQr();
        await reload();
        $('#message-dialog').close();
        toast('Relay QR ready. Show it to the next person.');
        if (window.innerWidth <= 740)
            showLargeQr();
    }
    catch (error) {
        toast(error instanceof Error ? error.message : 'Could not relay message.', true);
    }
}
function openMessage(id) {
    const msg = messages.find(m => m.id === id);
    if (!msg)
        return;
    viewedId = id;
    $('#message-dialog-content').innerHTML = `<div class="dialog-body"><div class="dialog-top"><span>${escapeHtml(msg.priority.toUpperCase())} TRANSMISSION</span><span>${msg.direction === 'incoming' ? 'RECEIVED LOCALLY' : 'CREATED LOCALLY'}</span></div><h2>${escapeHtml(msg.alias)}</h2><p>${escapeHtml(msg.body)}</p><div class="dialog-meta"><div><small>MESSAGE ID</small><strong>${escapeHtml(msg.id)}</strong></div><div><small>RELAY HOPS</small><strong>${msg.hops} / ${msg.maxHops}</strong></div><div><small>CREATED</small><strong>${escapeHtml(prettyTime(msg.createdAt))}</strong></div><div><small>EXPIRES</small><strong>${escapeHtml(prettyTime(msg.expiresAt))}</strong></div></div></div>`;
    $('#dialog-relay').disabled = msg.expiresAt <= Date.now() || msg.hops >= msg.maxHops;
    $('#message-dialog').showModal();
}
async function copyPacket() {
    if (!active)
        return;
    const value = encodePacket(active);
    try {
        if (navigator.clipboard?.writeText)
            await navigator.clipboard.writeText(value);
        else
            throw new Error('Clipboard API unavailable');
        toast('GS1 packet copied. Share it with another device.');
    }
    catch {
        setView('receive');
        const input = $('#packet-import');
        input.value = value;
        input.focus();
        input.select();
        toast('Clipboard unavailable. Packet selected below for manual copying.');
    }
}
function showLargeQr() {
    if (!active)
        return;
    $('#qr-dialog-mount').replaceChildren(qrCanvas(active, 1024));
    $('#qr-dialog').showModal();
}
function downloadQr() {
    if (!active)
        return;
    const image = $('#qr-mount canvas');
    if (!image)
        return;
    const link = document.createElement('a');
    link.href = image.toDataURL('image/png');
    link.download = `ghostsignal-${active.id}.png`;
    link.click();
    toast('QR image saved.');
}
function updateCameraSupport() {
    const available = canScanNatively();
    $('#toggle-camera').disabled = !available;
    $('#scanner-capability').textContent = available ? 'Native QR scanning is supported by your browser.' : 'Native camera QR scanning is unavailable here. Use import below or copy the GS1 text with your phone camera.';
}
function stopCamera() {
    scanner.stop();
    $('#camera-video').srcObject = null;
    $('#camera-placeholder').hidden = false;
    $('#toggle-camera').innerHTML = `${icon('scan')} Start camera scanner`;
}
async function toggleCamera() {
    if (scanner.isRunning()) {
        stopCamera();
        return;
    }
    try {
        $('#toggle-camera').innerHTML = `${icon('close')} Stop scanning`;
        $('#camera-placeholder').hidden = true;
        await scanner.start($('#camera-video'), value => { stopCamera(); void importText(value); }, message => { stopCamera(); toast(message, true); });
    }
    catch (error) {
        stopCamera();
        toast(error instanceof Error ? error.message : 'Could not open camera.', true);
    }
}
function wireEvents() {
    document.addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof Element))
            return;
        const navigation = target.closest('[data-nav]');
        if (navigation?.dataset.nav && order.includes(navigation.dataset.nav))
            setView(navigation.dataset.nav);
        const open = target.closest('[data-open-id]');
        if (open?.dataset.openId)
            openMessage(open.dataset.openId);
        const filtr = target.closest('[data-filter]');
        if (filtr?.dataset.filter) {
            filter = filtr.dataset.filter;
            document.querySelectorAll('[data-filter]').forEach(el => el.classList.toggle('active', el === filtr));
            renderInbox();
        }
    });
    $('#compose-form').addEventListener('submit', event => { void makeMessage(event); });
    $('#message').addEventListener('input', event => {
        $('#char-count').textContent = `${[...event.target.value].length} / ${MAX_BODY_CHARS}`;
    });
    document.querySelectorAll('input[name=priority]').forEach(input => {
        input.addEventListener('change', () => {
            document.querySelectorAll('[data-priority-card]').forEach(el => el.classList.toggle('selected', el.dataset.priorityCard === input.value));
        });
    });
    $('#demo-compose').addEventListener('click', () => {
        $('#alias').value = 'Station Alpha';
        const msg = $('#message');
        msg.value = 'Signal check: we are safe at the community center. Need drinking water. Please relay this to the next station.';
        msg.dispatchEvent(new Event('input', { bubbles: true }));
        const sos = document.querySelector('input[name=priority][value=sos]');
        sos.checked = true;
        sos.dispatchEvent(new Event('change'));
        $('#expiry').value = '24';
        toast('Demo message loaded. Press Generate signal to create its QR.');
    });
    $('#search-messages').addEventListener('input', event => { search = event.target.value; renderInbox(); });
    $('#import-packet').addEventListener('click', () => { void importText($('#packet-import').value); });
    $('#toggle-camera').addEventListener('click', () => { void toggleCamera(); });
    $('#qr-upload').addEventListener('change', event => {
        const input = event.target;
        const file = input.files?.[0];
        if (file)
            void decodeImage(file).then(importText).catch(e => toast(e instanceof Error ? e.message : 'QR image not recognized.', true));
        input.value = '';
    });
    $('#copy-packet').addEventListener('click', () => { void copyPacket(); });
    $('#download-qr').addEventListener('click', downloadQr);
    $('#expand-qr').addEventListener('click', showLargeQr);
    $('#dialog-relay').addEventListener('click', () => {
        const message = messages.find(m => m.id === viewedId);
        if (message)
            void shareAsQr(message);
    });
    $('#dialog-delete').addEventListener('click', () => {
        const id = viewedId;
        if (!id || !confirm('Delete this local message? This cannot be undone.'))
            return;
        void deleteMessage(id).then(async () => {
            $('#message-dialog').close();
            if (active?.id === id) {
                active = null;
                renderQr();
            }
            await reload();
            toast('Message deleted from this device.');
        });
    });
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    document.addEventListener('visibilitychange', () => { if (document.hidden && scanner.isRunning())
        stopCamera(); });
}
async function registerServiceWorker() {
    if (!('serviceWorker' in navigator))
        return;
    try {
        await navigator.serviceWorker.register('./sw.js');
        await navigator.serviceWorker.ready;
        updateNetwork();
    }
    catch { /* Secure origin required; core local messaging still works. */ }
}
async function init() {
    wireEvents();
    $('#alias').value = getPreferredAlias();
    updateCameraSupport();
    updateNetwork();
    runClock();
    setInterval(runClock, 1000);
    await reload();
    void registerServiceWorker();
}
void init().catch(e => toast(`Startup error: ${e instanceof Error ? e.message : String(e)}`, true));
