import { exec } from 'child_process';
import util from 'util'
export default {
    name: 'eval',
    aliases: ['>', 'eval'],
    category: 'Owner',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: true,
    execute: async (m, client) => {
        let evalCmd = '';
        try {
            evalCmd = /await/i.test(m.text) ? eval('(async() => { ' + m.text + ' })()') : eval(m.text);
        } catch (e) {
            evalCmd = e;
        }
        new Promise((resolve, reject) => {
            try {
                resolve(evalCmd);
            } catch (err) {
                reject(err);
            }
        })
            ?.then(res => m.reply(util.format(res)))
            ?.catch(err => m.reply(util.format(err)));
    }
}
