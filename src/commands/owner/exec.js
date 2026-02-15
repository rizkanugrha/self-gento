import { exec } from 'child_process';
import util from 'util'
export default {
    name: 'exec',
    aliases: ['$', 'exec'],
    category: 'Owner',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: true,
    execute: async (m) => {
        try {
            exec(m.text, async (err, stdout) => {
                if (err) return m.reply(util.format(err));
                if (stdout) return m.reply(util.format(stdout));
            });
        } catch (e) {
            await m.reply(util.format(e));
        }
    }
}
