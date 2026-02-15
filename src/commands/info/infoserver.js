import * as Func from '../../lib/function.js';

export default {
    name: 'infoserver',
    aliases: ['info', 'infoserver', 'os'],
    category: 'Info',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        let os = (await import('os')).default;
        let v8 = (await import('v8')).default;
        let { performance } = (await import('perf_hooks')).default;
        let eold = performance.now();

        const used = process.memoryUsage();
        const cpus = os.cpus().map(cpu => {
            cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0);
            return cpu;
        });
        const cpu = cpus.reduce(
            (last, cpu, _, { length }) => {
                last.total += cpu.total;
                last.speed += cpu.speed / length;
                last.times.user += cpu.times.user;
                last.times.nice += cpu.times.nice;
                last.times.sys += cpu.times.sys;
                last.times.idle += cpu.times.idle;
                last.times.irq += cpu.times.irq;
                return last;
            },
            {
                speed: 0,
                total: 0,
                times: {
                    user: 0,
                    nice: 0,
                    sys: 0,
                    idle: 0,
                    irq: 0,
                },
            }
        );
        let heapStat = v8.getHeapStatistics();
        let neow = performance.now();

        let teks = `
*Ping :* *_${Number(neow - eold).toFixed(2)} milisecond(s)_*

💻 *_Info Server_*
*- Hostname :* ${os.hostname() || sockk.user?.name}
*- Platform :* ${os.platform()}
*- OS :* ${os.version()} / ${os.release()}
*- Arch :* ${os.arch()}
*- RAM :* ${Func.formatSize(os.totalmem() - os.freemem(), false)} / ${Func.formatSize(os.totalmem(), false)}

*_Runtime OS_*
${Func.runtime(os.uptime())}

*_Runtime Bot_*
${Func.runtime(process.uptime())}

*_NodeJS Memory Usage_*
${Object.keys(used)
                .map((key, _, arr) => `*- ${key.padEnd(Math.max(...arr.map(v => v.length)), ' ')} :* ${Func.formatSize(used[key])}`)
                .join('\n')}
*- Heap Executable :* ${Func.formatSize(heapStat?.total_heap_size_executable)}
*- Physical Size :* ${Func.formatSize(heapStat?.total_physical_size)}
*- Available Size :* ${Func.formatSize(heapStat?.total_available_size)}
*- Heap Limit :* ${Func.formatSize(heapStat?.heap_size_limit)}
*- Malloced Memory :* ${Func.formatSize(heapStat?.malloced_memory)}
*- Peak Malloced Memory :* ${Func.formatSize(heapStat?.peak_malloced_memory)}
*- Does Zap Garbage :* ${Func.formatSize(heapStat?.does_zap_garbage)}
*- Native Contexts :* ${Func.formatSize(heapStat?.number_of_native_contexts)}
*- Detached Contexts :* ${Func.formatSize(heapStat?.number_of_detached_contexts)}
*- Total Global Handles :* ${Func.formatSize(heapStat?.total_global_handles_size)}
*- Used Global Handles :* ${Func.formatSize(heapStat?.used_global_handles_size)}
${cpus[0]
                ? `

*_Total CPU Usage_*
${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times)
                    .map(type => `*- ${(type + '*').padEnd(6)}: ${((100 * cpu.times[type]) / cpu.total).toFixed(2)}%`)
                    .join('\n')}

*_CPU Core(s) Usage (${cpus.length} Core CPU)_*
${cpus
                    .map(
                        (cpu, i) =>
                            `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times)
                                .map(type => `*- ${(type + '*').padEnd(6)}: ${((100 * cpu.times[type]) / cpu.total).toFixed(2)}%`)
                                .join('\n')}`
                    )
                    .join('\n\n')}`
                : ''
            }
`.trim();
        await m.reply(teks);
    }
}