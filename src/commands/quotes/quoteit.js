import { drawImage } from "../../lib/quotesGen.js"
import { inlineCode } from "../../lib/formatter.js"
import { fetchBuffer, upload } from "../../lib/function.js"
export default {
    name: 'quoteit',
    aliases: ['quoteit', 'quotemaker', 'makequote', 'q'],
    category: 'Quotes',
    usage: 'quotesmu',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags, arg }) => {
        try {
            await m.react('🕒')
            //quotes, pp, username, name
            if (args.length === 0) return m.reply('text quotes tidak boleh kosong')
            arg = flags.length ? arg.replace(`--${flags[0]}`, '') : arg
            let _text = arg.split('|')[0]
            let wm = arg.split('|')[1]
            wm = wm ? `@${wm}` : ''
            if (_text.length > 250) return m.reply('No more spaces! text quotes too longest... max 250 character')
            if (wm.length > 30) return m.reply('No more spaces! text username ig too longest...')
            let captionnews = `Quotes today`
            let dp = "https://raw.githubusercontent.com/rizkanugrha/datascrep/refs/heads/main/pp.png"
            let caption = ''
            try {
                dp = await client.profilePictureUrl(m.sender, 'image')
                let gas = await drawImage(_text, dp, wm, m.pushName)
                caption += `${inlineCode('Successfully make quotes')}`
                await client.sendMessage(m.from, { image: gas.toBuffer(), caption }, { quoted: m })
                await client.sendMessage('120363337300885431@newsletter', { image: gas.toBuffer(), captionnews })
                await m.react('✅')
            } catch (error) { } finally {
                console.log(dp);
                let gas = await drawImage(_text, (await fetchBuffer(dp)).buffer, wm, m.pushName)
                caption += `${inlineCode('Successfully make quotes')}`
                await client.sendMessage(m.from, { image: gas.toBuffer(), caption }, { quoted: m })
                await client.sendMessage('120363337300885431@newsletter', { image: gas.toBuffer(), captionnews })
                await m.react('✅')
            }
        } catch (e) {
            console.log(e);
            await m.react('🍉')
        }

    }
}