import { sendButtons, sendInteractiveMessage } from "../utils/buttons/index.js";

export default {
    name: 'otp',
    aliases: ['otp', 'kode'],
    category: 'Tools',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix }) => {

        const jid = m.from || m.key.remoteJid;

        // 2. Generate Kode Random (Contoh: 6 digit angka)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Kirim Pesan dengan Tombol Copy
        await sendInteractiveMessage(client, jid, {
            title: 'contoh OTP',
            text: `copy Kode OTP`,
            footer: 'SILIT',
            interactiveButtons: [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: otpCode,
                        copy_code: otpCode,
                        id: 'copy_otp_action'
                    })
                },

                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'MENU',
                        id: `${prefix}menu`
                    })
                }
            ]
        });
    }
}