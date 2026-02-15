import { sendInteractiveMessage, sendButtons } from "../utils/buttons/index.js"

export default {
    name: 'tesbutton',
    aliases: ['tesbutton', 'tesbutton'],
    category: 'General',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        await sendButtons(client, m.from, {
            text: 'COba beton',
            footer: 'anu',
            buttons: [
                { id: `${prefix}menu`, text: 'Menu' },
                { id: `${prefix}infoserver`, text: 'Info Server' }
            ]
        });
    }
}
