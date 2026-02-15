// Source: Optimized from https://github.com/pkrumins/node-tree-kill
'use strict';
import { spawn, exec } from 'child_process';

export default function treeKill(pid, signal = 'SIGTERM', callback) {
    if (typeof signal === 'function') {
        callback = signal;
        signal = 'SIGTERM';
    }

    pid = parseInt(pid);
    if (Number.isNaN(pid)) {
        const error = new Error('pid must be a number');
        return callback ? callback(error) : Promise.reject(error);
    }

    const tree = { [pid]: [] };
    const pidsToProcess = { [pid]: 1 };

    const done = (err) => callback ? callback(err) : err ? Promise.reject(err) : Promise.resolve();

    const buildTreeAndKill = (spawner) => {
        buildProcessTree(pid, tree, pidsToProcess, spawner, () => {
            try {
                killAll(tree, signal);
                return done();
            } catch (err) {
                return done(err);
            }
        });
    };

    switch (process.platform) {
        case 'win32':
            return exec(`taskkill /pid ${pid} /T /F`, (err) => done(err));
        case 'darwin':
            return buildTreeAndKill((ppid) => spawn('pgrep', ['-P', ppid]));
        default: // linux
            return buildTreeAndKill((ppid) => spawn('ps', ['-o', 'pid', '--no-headers', '--ppid', ppid]));
    }
}

function killAll(tree, signal) {
    const killed = new Set();

    for (const pid in tree) {
        for (const childPid of tree[pid]) {
            if (!killed.has(childPid)) {
                killPid(childPid, signal);
                killed.add(childPid);
            }
        }
        if (!killed.has(pid)) {
            killPid(pid, signal);
            killed.add(pid);
        }
    }
}

function killPid(pid, signal) {
    try {
        process.kill(Number(pid), signal);
    } catch (err) {
        if (err.code !== 'ESRCH') throw err;
    }
}

function buildProcessTree(parentPid, tree, pidsToProcess, spawner, cb) {
    const ps = spawner(parentPid);
    let allData = '';

    ps.stdout.on('data', (data) => {
        allData += data.toString('ascii');
    });

    ps.on('close', (code) => {
        delete pidsToProcess[parentPid];

        if (code !== 0) {
            if (Object.keys(pidsToProcess).length === 0) cb();
            return;
        }

        const matches = allData.match(/\d+/g);
        if (!matches) {
            if (Object.keys(pidsToProcess).length === 0) cb();
            return;
        }

        matches.forEach((pidStr) => {
            const pid = Number(pidStr);
            tree[parentPid].push(pid);
            tree[pid] = [];
            pidsToProcess[pid] = 1;
            buildProcessTree(pid, tree, pidsToProcess, spawner, cb);
        });
    });
}


export const safeKill = (pid, signal = 'SIGTERM', log = true) => {
    try {
        process.kill(pid, 0); // cek apakah proses hidup
        treeKill(pid, signal, (err) => {
            if (err && log) console.error('[safeKill] Error killing process:', err.message);
            else if (log) console.log('[safeKill] Process stopped.');
        });
    } catch {
        if (log) console.log('[safeKill] Process already exited.');
    }
};
