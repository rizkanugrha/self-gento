import { createRequire } from 'module';
import moment from 'moment-timezone';
import { inlineCode } from '../../lib/formatter.js';
const require = createRequire(import.meta.url);
import { SnapSave } from '../../lib/scrape/snapsave.js';
import { delay } from 'baileys';

export default {
    name: 'ig',
    aliases: ['ig', 'igdl', 'insta'],
    category: 'Downloads',
    usage: 'link',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd }) => {
        await m.react('🕒');
        let text = args[0];
        if (!text) {
            return m.reply(`Please enter the Instagram URL. Example: ${prefix}${cmd} https://www.instagram.com/reels/xxxxx`);
        }
        if (!/(?:https?:\/\/)?(?:www\.)?(instagram\.com|instagr\.am)/i.test(text)) {
            return m.reply('The URL you entered is not a valid Instagram URL!');
        }

        try {
            const hasil = await SnapSave(text);

            if (!hasil.status || !hasil.data || hasil.data.length === 0) {
                await m.react('🍉');
                return m.reply('No media found for the provided Instagram URL.');
            }


            for (let i = 0; i < hasil.data.length; i++) {
                const fileUrl = hasil.data[i].url;
                const fileType = /^https:\/\/scontent\.cdninstagram\.com\/.*$/.test(fileUrl) ? 'jpeg' : 'mp4';
                await delay(500)
                await client.sendFileFromUrl(m.from, fileUrl, '', m, '', fileType);

            }


            await m.react('✅');
        } catch (err) {
            await m.react('🍉');
            console.error(err);
            m.reply('An error occurred while processing your request.');
        }
    },
};
