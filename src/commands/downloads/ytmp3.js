import { SaveTube } from '../../lib/scrape/savetube.js';
import { YT } from '../../lib/scrape/yt2.js';
import { fetchBuffer, secondsConvert, isUrl } from '../../lib/function.js';
import { inlineCode } from '../../lib/formatter.js';

export default {
    name: 'ytmp3',
    aliases: ['ytmp3', 'ytmp3dl'],
    category: 'Downloads',
    usage: 'link',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        try {
            if (!args.length || !isUrl(url) || !YT.isYTUrl(url)) {
                return m.reply(`*Usage:*
${prefix}${cmd} url --args
*args* is optional (can be filled in or not)

*list args:*
--metadata: download mp3 with metadata tags
--vn can be played directly via WA

example: ${prefix}ytmp3 https://youtu.be/0Mal8D63Zew --vn`);
            }

            await m.react('🕒');

            const anu = await SaveTube(url, 'mp3');
            if (!anu || !anu.result) throw new Error('Failed to fetch audio data.');

            let obj = anu.result;
            let caption = `${inlineCode('Successfully downloaded YouTube MP3')}

` +
                `*Title :* ${obj.title}
` +
                `*Duration :* ${secondsConvert(obj.duration)}

` +
                `⚡️ _by violet-rzk_`;

            //   await client.sendMessage(m.from, { image: { url: obj.thumbnail } }, { quoted: m });

            let options = {
                fileName: `${obj.title}.mp3`,
                mimetype: 'audio/mpeg',
                jpegThumbnail: (await fetchBuffer(obj.thumbnail)).buffer
            };

            if (flags.some(v => v.toLowerCase() === 'vn')) {
                options.audio = true;
            } else {
                options.document = true;
            }

            // await client.sendFile(m.from, obj.download, m, options);
            await client.sendMessage(m.from, { audio: { url: obj.download }, options }, { quoted: m });

            await m.react('✅');
        } catch (e) {
            console.error(e);
            await m.react('🍉');
            await m.reply('An error occurred while processing your request. Please try again.');
        }
    }
};
