//editen 2:33wib optimized
/**
 * Author  : Rizka Nugraha
 * Name    : violet-rzk
 * Version : 2.8.25 (Optimized Fast Connect)
 * Update  : 20 September 2025
 */

import 'dotenv/config';

import makeWASocket, {
    delay,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    jidNormalizedUser,
    DisconnectReason,
    Browsers,
    makeCacheableSignalKeyStore
} from 'baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import os from 'os';
import cfonts from 'cfonts';
import NodeCache from "node-cache";

import config from './utils/config.js';
import { GroupParticipants } from './handlers/group-participants.js';
import { Messages } from './handlers/message.js';
import treeKill from './utils/tree-kill.js';
import serialize, { Client, initLidStore } from './utils/serialize.js';
import { formatSize, parseFileSize, sendTelegram } from './lib/function.js';
import { loadCommands } from './lib/loadcmd.js';
//import { makeInMemoryStore } from './lib/store.js';
import { makeInMemoryStore } from '@rodrigogs/baileys-store'

import { analyzeMessage } from './lib/analyzer.js'

const logger = pino({
    level: 'silent', // Ubah default ke silent
    timestamp: () => `,"time":"${new Date().toJSON()}"`
}).child({ class: 'client' });

const usePairingCode = process.env.PAIRING_NUMBER;
const store = makeInMemoryStore({ logger });
global.store = store
// NAME CACHE (ANTI UNKNOWN)
store.nameCache = {};
const msgRetryCounterCache = new NodeCache();
const pathSession = `./src/database/${process.env.SESSION_NAME}`
const pathContacts = `${pathSession}/contacts.json`;
const pathMetadata = `${pathSession}/groupMetadata.json`;
const pathStore = `${pathSession}/store.json`;
const pathNameCache = `${pathSession}/nameCache.json`;


// Baca store di awal start
if (process.env.WRITE_STORE === 'true' && fs.existsSync(pathStore)) store.readFromFile(pathStore);

const writeFileAsync = async (path, data) => {
    try {
        await fs.promises.writeFile(path, JSON.stringify(data));
    } catch (e) {
        console.error(`Gagal menyimpan ${path}:`, e);
    }
};

(async () => {
    try {
        await loadCommands();
        console.log('✅ Commands loaded successfully');
    } catch (e) {
        console.error('❌ Gagal load commands:', e);
    }
})();
let isReconnecting = false;
let lastDisconnectTime = 0;

const startBot = async () => {

    const { state, saveCreds } = await useMultiFileAuthState(pathSession);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

    const client = makeWASocket({
        version,
        logger, // Pastikan pakai logger yg levelnya 'silent' (seperti jawaban sebelumnya)
        printQRInTerminal: !usePairingCode,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        browser: Browsers.macOS('Safari'),
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        retryRequestDelayMs: 250,
        maxMsgRetryCount: 5,
        msgRetryCounterCache,
        keepAliveIntervalMs: 30000, // TAMBAHKAN INI: Menjaga koneksi tetap hidup
        defaultQueryTimeoutMs: 60000, // TAMBAHKAN INI: Mencegah timeout dadakan
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            }
            return { conversation: 'Bot is syncing...' };
        }
    });

    store?.bind(client.ev);
    await Client({ client, store });

    client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'connecting') {
            if (usePairingCode && !client.authState.creds.registered) {
                let phoneNumber = usePairingCode.replace(/[^0-9]/g, '');
                await delay(3000);
                let code = await client.requestPairingCode(phoneNumber);
                console.log(`Code: ${code}`);
            }
            return;
        }

        if (connection === 'open') {
            console.clear();
            console.log('✅ Connected ');
            client.sendMessage(jidNormalizedUser(client.user.id), { text: `${client.user?.name} Connected!` });
            isReconnecting = false;

            initLidStore(client);

            if (!store.groupMetadata || Object.keys(store.groupMetadata).length === 0) {
                client.groupFetchAllParticipating()
                    .then(g => store.groupMetadata = g)
                    .catch(() => { });
            }
            return;
        }

        if (connection !== 'close') return;

        const now = Date.now();
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

        console.warn('[DISCONNECTED]', reason);

        if (isReconnecting) return;

        if (now - lastDisconnectTime < 30000) {
            console.log('⏳ Cooldown reconnect');
            return;
        }

        isReconnecting = true;
        lastDisconnectTime = now;

        if (
            reason === DisconnectReason.loggedOut ||
            reason === DisconnectReason.multideviceMismatch ||
            reason === 440
        ) {
            console.error('❌ SESSION INVALID — EXIT');
            await delay(2000);
            process.exit(1);
        }

        console.log('🔄 Reconnecting in 10s...');
        await delay(10000);

        isReconnecting = false;
        startBot();
    });


    client.ev.on('creds.update', saveCreds);

    // Load Contacts & Metadata
    if (fs.existsSync(pathContacts)) {
        try { store.contacts = JSON.parse(fs.readFileSync(pathContacts, 'utf-8')); } catch { }
    }

    if (fs.existsSync(pathMetadata)) {
        try { store.groupMetadata = JSON.parse(fs.readFileSync(pathMetadata, 'utf-8')); } catch { }
    }

    if (fs.existsSync(pathNameCache)) {
        try {
            store.nameCache = JSON.parse(fs.readFileSync(pathNameCache));
        } catch {
            store.nameCache = {};
        }
    }


    client.ev.on('contacts.update', update => {
        if (!store.contacts) store.contacts = {};

        for (let contact of update) {
            let id = jidNormalizedUser(contact.id);
            if (store && store.contacts) store.contacts[id] = { ...(store.contacts[id] || {}), ...contact };
        }
    });

    client.ev.on('contacts.upsert', update => {
        if (!store.contacts) store.contacts = {};

        for (let contact of update) {
            let id = jidNormalizedUser(contact.id);
            if (store && store.contacts) store.contacts[id] = { ...(store.contacts[id] || {}), ...contact, isContact: true };
        }
    });

    client.ev.on('group-participants.update', async (anu) => {
        await GroupParticipants(anu, client);
    });

    client.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message) return;


        if (msg.key.remoteJid === 'status@broadcast' && msg.message.protocolMessage) return;

        try {

            let m = await serialize(client, msg, store);

            // Cekal Spam
            try {
                const res_spam = analyzeMessage(msg);
                if (res_spam.isMalicious) {
                    console.warn(`🚨 Blocked: ${res_spam.reason}`);
                    return;
                }
            } catch (e) { }


            // Auto Read Status
            if (m.key && !m.key.fromMe && m.key.remoteJid === 'status@broadcast') {
                if (m.type === 'protocolMessage' && m.message.protocolMessage.type === 0) return;

                client.readMessages([m.key]).catch(() => { });

                if (process.env.TELEGRAM_TOKEN && process.env.ID_TELEGRAM) {
                    let id = m.key.participant || m.key.remoteJid;
                    let name = m.pushName;

                    let text = `Status dari ${name} (${id.split('@')[0]})\n${m.body || ''}`;

                    if (m.isMedia) {
                        let media = await client.downloadMediaMessage(m);
                        sendTelegram(process.env.ID_TELEGRAM, media, { type: /audio/.test(m.msg.mimetype) ? 'document' : '', caption: text }).catch(() => { });
                    } else {
                        sendTelegram(process.env.ID_TELEGRAM, text).catch(() => { });
                    }
                }
                return;
            }

            // Self Mode 
            if (process.env.SELF === 'true' && !m.isOwner) return;

            await Messages(client, m);

        } catch (e) {
            console.error('Error message upsert:', e);
        }
    });

    setInterval(async () => {
        if (store.contacts) await writeFileAsync(pathContacts, store.contacts);
        if (store.groupMetadata) await writeFileAsync(pathMetadata, store.groupMetadata);
        if (store.nameCache)
            await writeFileAsync(pathNameCache, store.nameCache);


        if (process.env.WRITE_STORE === 'true') store.writeToFile(pathStore);


        /*const memoryUsage = os.totalmem() - os.freemem();
          if (memoryUsage > os.totalmem() - parseFileSize(process.env.AUTO_RESTART || '1GB', false)) {
              process.exit(1);
          }*/

        const used = process.memoryUsage().rss;
        const limit = parseFileSize(process.env.AUTO_RESTART || '800MB', false);

        if (used > limit) {
            console.warn('[MEMORY] Limit reached, waiting for auth to save, then restarting...');
            setTimeout(() => {
                process.exit(1);
            }, 5000); // Beri jeda 5 detik agar file creds aman tersimpan
        }

    }, 120000);



    process.on('uncaughtException', console.error);
    process.on('unhandledRejection', console.error);
};


/**setInterval(() => {
    fs.readdir(pathSession, (err, files) => {
        if (err) return;
        files.filter(file => file.startsWith('pre-key') ||
            file.startsWith('sender-key') ||
            file.startsWith('session-') ||
            file.startsWith('app-state') ||
            file.startsWith('lid-mapping') ||
            file.startsWith('tc-token'))
            .forEach(file => fs.unlinkSync(`${pathSession}/${file}`, () => { }));
    });
}, 60000 * 15); */

startBot();