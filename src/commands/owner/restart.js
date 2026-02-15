import { exec } from 'child_process';

export default {
    name: 'restart',
    aliases: ['restart', 'restart'],
    category: 'Owner',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: true,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        exec('npm run restart:pm2', err => {
            if (err) return process.send('reset');
        });
    }
}
