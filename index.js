import path from 'path';
import { spawn } from 'child_process';
import { watchFile, unwatchFile } from 'fs';
import treeKill from './src/utils/tree-kill.js';

let activeProcess = null;
let lastHeartbeat = Date.now();
const file = './src/main.js';

function start() {
    if (activeProcess) return;

    console.log('[WATCHER] Starting bot...');
    const child = spawn(process.argv[0], [path.resolve(file)], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });

    activeProcess = child;

    child.on('message', (msg) => {
        if (msg === 'reset') {
            console.log('[WATCHER] Reset requested');
            restart();
        } else if (msg === 'heartbeat') {
            lastHeartbeat = Date.now();
        }
    });

    child.once('exit', (code) => {
        console.warn('[WATCHER] Bot exited:', code);
        activeProcess = null;

        watchFile(file, () => {
            unwatchFile(file);
            start();
        });
    });
}

function restart() {
    if (!activeProcess) return start();

    treeKill(activeProcess.pid, 'SIGTERM', () => {
        activeProcess = null;
        setTimeout(start, 3000);
    });
}

// Watchdog
/**setInterval(() => {
    if (Date.now() - lastHeartbeat > 3 * 60 * 1000) {
        console.warn('[WATCHDOG] No heartbeat');
        restart();
    }
}, 60_000);*/

start();
