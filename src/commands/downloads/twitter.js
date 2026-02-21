import { delay } from 'baileys';
import twitterdl from '../../lib/scrape/tw/tw.cjs';
import { inlineCode } from '../../lib/formatter.js';

export default {
    name: 'twitter',
    aliases: ['twitter', 'tw', 'x', 'tweet', 'twt', 'twitterdl'],
    category: 'Downloads',
    usage: 'link',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd }) => {
        let text = args.join(' ');
        if (!text) {
            return m.reply(`Please enter the Twitter URL. Example: ${prefix + cmd} https://x.com/xxxxx`);
        }

        if (!/(?:https?:\/\/)?(?:www\.)?(twitter\.com|x\.com)/i.test(text)) {
            return m.reply('The URL you entered is not a valid Twitter URL.');
        }

        await m.react('🕒'); // React to indicate processing

        try {
            const data = await twitterdl(text);

            if (data?.media && data.media.length > 0) {
                // Filter and group by media type
                const photos = data.media.filter((mediaItem) => mediaItem.type === 'photo');
                const videos = data.media
                    .filter((mediaItem) => mediaItem.type === 'video')
                    .map((mediaItem) => mediaItem.videos)
                    .flat();

                // Handle photos
                if (photos.length > 0) {
                    for (const photo of photos) {
                        const captionPhoto = `${inlineCode('Successfully downloaded Twitter image')}\n\n⚡️ _by violet-rzk_`;
                        await client.sendFileFromUrl(m.from, photo.image, '', m, '', 'jpeg');
                        await m.react('✅')
                    }
                }

                // Handle videos
                if (videos.length > 0) {
                    const highestQualityVideo = videos.sort((a, b) => b.bitrate - a.bitrate)[0];
                    const captionVideo = `${inlineCode('Successfully downloaded Twitter video')}\nQuality: ${highestQualityVideo.quality}\n\n⚡️ _by violet-rzk_`;

                    await delay(500);
                    await client.sendFileFromUrl(m.from, highestQualityVideo.url, '', m, '', 'mp4');
                    await m.react('✅')
                }

                if (photos.length === 0 && videos.length === 0) {
                    m.reply('No photos or videos found in the media items.');
                }
            } else {
                m.reply('No media found in the tweet.');
            }
        } catch (error) {
            console.error(error);
            await m.react('🍉'); // React to indicate an error
            m.reply('An error occurred while processing the Twitter URL. Please try again later.');
        }
    },
};
