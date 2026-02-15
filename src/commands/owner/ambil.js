import { exec } from 'child_process';
import util from 'util'
export default {
    name: 'ambil',
    aliases: ['save', 'ambil'],
    category: 'Owner',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: true,
    execute: async (m, client, { url }) => {
        try {
            let msg = m.quoted ? m.quoted : m;
            const buffer = await client.downloadMediaMessage(msg)
            if (msg.type === 'videoMessage') {
                await client.sendMessage(m.from, { video: buffer, force: true }, { quoted: m })
            } else if (msg.type === 'imageMessage') {
                await client.sendMessage(m.from, { image: buffer, force: true }, { quoted: m })
            } else if (msg.type === 'documentMessage') {
                await client.sendMessage(m.from, { image: buffer, force: true }, { quoted: m })
            } else if (msg.type === 'audioMessage') {
                await client.sendMessage(m.from, { audio: buffer, force: true }, { quoted: m })
            }
        } catch (error) {
            console.log(error)
            await m.reply(util.format(error))
        }
    }
}
