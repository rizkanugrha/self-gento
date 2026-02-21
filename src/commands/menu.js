import { getDevice } from "baileys"
import { pasaran } from "../lib/tgl.cjs"
import config from "../utils/config.js"
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)
import { secondsConvert } from "../lib/function.js"
import os from 'os'
import { readFileSync } from "fs"
import { createRequire } from 'module';
import moment from "moment-timezone"
import { commands } from "../lib/loadcmd.js"
import { join } from "path"
const require = createRequire(import.meta.url);
const uptime = secondsConvert(os.uptime, true)
import { bold, quote, inlineCode, monospace } from '../lib/formatter.js'

function garis(tes) {
    const pee = '```';
    const cirt = pee + tes + pee;
    return cirt;
}

export default {
    name: 'menu',
    aliases: ['m', 'menu', 'help'],
    category: 'General',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        try {
            if (args.length == 0) {
                let teks = `👋 *Hi ${m.pushName}*\n*Devicemu* : ${garis(`${getDevice(m.key.id)}`)}

*'${config.name}'* ~> ${garis(`build by ${config.author}`)} 
        
⌚️ : ${garis(`${moment().format('HH:mm:ss')}`)}
📅 : ${garis(`${pasaran().hijriyah}`)}
📆 : ${garis(`${pasaran().jawa}`)} `


                let cmdd = '';
                for (const category of [... new Set(commands.map((v) => v.category).sort())]) {
                    cmdd += `\n${inlineCode('『' + category + '』')}\n`


                    for (const cmd of commands.filter((v) => v.category && v.category.includes(category) && v.name).map(v => v)) {
                        const judul = commands.findKey((v) => v === cmd)
                        const anu = cmd ? cmd.usage : undefined
                        //   console.log(anu);
                        // cmdd += `* ${prefix}${judul} ${anu}\n`
                        if (anu == undefined) {
                            cmdd += `> 𖥔 ${prefix}${judul}\n`;
                        } else {
                            cmdd += `> 𖥔 ${prefix}${judul} ${anu}\n`
                        }

                    }
                }
                teks += `\n${inlineCode('『 CMD LIST 』')}\n${cmdd}${readMore}`

                const fakeProduct = {
                    key: {
                        fromMe: false,
                        participant: m.sender, // Change it to `0${S_WHATSAPP_NET}` if you want to become an official WhatsApp account.
                        ...({
                            remoteJid: "status@broadcast"
                        })
                    },
                    message: {
                        productMessage: {
                            product: {
                                title: 'haiii',
                                description: null,
                                // currencyCode: "IDR",
                                // priceAmount1000: "9999999",
                                retailerId: config.name,
                                productImageCount: 0
                            },
                            businessOwnerJid: m.sender
                        }
                    }
                };
                await client.sendMessage(m.from, {
                    text: teks,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            mediaType: 1,
                            previewType: 0,
                            mediaUrl: '',
                            title: config.author,
                            body: null,
                            renderLargerThumbnail: true,
                            thumbnailUrl: 'https://raw.githubusercontent.com/rizkanugrha/datascrep/main/img-menu.jpg',
                            sourceUrl: ''
                        }
                    },
                    mentions: [m.sender]
                });
            }
            else {
                if (commands.has(args[0])) return m.reply('radong')
                const kode = commands.get(args[0]).description
                return m.reply(kode)
            }

        } catch (err) {
            console.log(err);
        }


    }
}
