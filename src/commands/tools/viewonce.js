import { createRequire } from 'module';
const require = createRequire(import.meta.url);

var { default: makeWASocket, delay, useMultiFileAuthState, fetchLatestBaileysVersion, jidNormalizedUser, DisconnectReason, Browsers, makeCacheableSignalKeyStore } = require('baileys');
import util from 'util'

export default {
    name: 'view',
    aliases: ['view', 'viewonce', 'rvo', 'wih', 'xixi', 'ehe'],
    category: 'Tools',
    usage: '<reply viewonce>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        try {
            let quoted = m.isQuoted ? m.quoted : m;

            if (!quoted.msg.viewOnce) return;
            quoted.msg.viewOnce = false;
            // await m.reply({ forward: quoted, force: true });
            client.sendMessage(jidNormalizedUser(client.user.id), { forward: quoted, force: true })



        } catch (e) {
            console.log(e);

        }

    }
}