
import { createRequire } from 'module';
const require = createRequire(import.meta.url);


import { cropStyle, Sticker } from "../../utils/sticker.js"
import config from '../../utils/config.js'
import { Emoji } from "../../utils/exif.js"
import { isUrl } from '../../lib/function.js'
import util from 'util'
import fetch from 'node-fetch'
//import { statistics } from '../../database/database.js'
let { igApi, getCookie, shortcodeFormatter, IGPostRegex } = require("insta-fetcher");
//let ig = new igApi('');
let ig = new igApi("sessionid=3591255041%3AvSfTWmiQTOC82N%3A7%3AAYdch7AJlmYpvIzpF1uMZ943xlUMFLKi5rY8vyFohw; ds_user_id=3591255041; csrftoken=uDL9yhvBjgAWRzcmmazDX1Hu63cYehIF;", false, {
    proxy: {
        host: '198.23.239.134',
        port: 6540,
        auth: { username: 'uahfhjxe', password: 'ru7idqdbn1yf' }
    }
});
export default {
    name: 'igpost',
    aliases: ['igpost'],
    category: 'Owner',
    usage: '<send/reply media>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: true,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        let packname = /\|/i.test(body) ? arg.split('|')[0] : `${config.name} `
        let stickerAuthor = /\|/i.test(body) ? arg.split('|')[1] : `${config.author}`
        let categories = Object.keys(Emoji).includes(arg.split('|')[2]) ? arg.split('|')[2] : 'greet' || 'greet'
        try {

            await m.react('🕒')

            if (m.type == 'imageMessage' || m.quoted && m.quoted.type == 'imageMessage') {
                const message = m.quoted ? m.quoted : m
                const buff = await client.downloadMediaMessage(message)

                const uploadResponse = await ig.addPost(buff, 'feed', {
                    caption: `Test Automate Post with BOT`
                })
                await m.reply(`Success. posted here https://www.instagram.com/p/${uploadResponse.media.code}`)
                await m.react('✅')

            } else {
                m.reply(`send/reply media. media is video or image\n\nexample :\n${prefix + cmd} caption`)
            }
        } catch (error) {
            console.log(error);
            await m.react('🍉')

        }
    }
}

