import { SaveTube } from '../../lib/scrape/savetube.js';
import { YT } from '../../lib/scrape/yt2.js';
import { fetchBuffer, secondsConvert, isUrl } from '../../lib/function.js';
import { inlineCode } from '../../lib/formatter.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';

export default {
    name: 'ytmp3',
    aliases: ['ytmp3', 'ytmp3dl'],
    category: 'Downloads',
    usage: 'link',
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        try {
            // Validasi Input
            if (!args.length || !isUrl(url) || !YT.isYTUrl(url)) {
                return m.reply(`*Usage:*
${prefix}${cmd} url --args
*args* is optional (can be filled in or not)

*list args:*
--vn can be played directly via WA

example: ${prefix}ytmp3 https://youtu.be/0Mal8D63Zew --vn`);
            }

            await m.react('🕒');

            const saver = new SaveTube();
            const res = await saver.download(url, 'audio');

            if (!res.status || !res.results.length) {
                await m.react('❌');
                return m.reply('Gagal mengambil data audio dari YouTube.');
            }

            const downloadUrl = res.results[0].url;

            let caption = `${inlineCode('Successfully downloaded YouTube MP3')}\n` +
                `*Title :* ${res.title}\n` +
                `*Duration :* ${secondsConvert(res.duration)}\n\n` +
                `⚡️ _by violet-rzk_`;

            const isVn = flags.some(v => v.toLowerCase() === 'vn');
            const isDoc = flags.some(v => v.toLowerCase() === 'doc');

            let audioBuffer;
            try {
                audioBuffer = await convertAudio(downloadUrl, isVn);
            } catch (convertError) {
                console.error("FFmpeg Error:", convertError);
                await m.react('❌');
                return m.reply('Terjadi kesalahan saat mengonversi audio. Pastikan FFmpeg terinstal di server.');
            }

            if (isVn) {
                await client.sendMessage(m.from, {
                    audio: audioBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                }, { quoted: m });
            } else {
                await client.sendMessage(m.from, {
                    document: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: `${res.title}.mp3`,
                    caption: caption
                }, { quoted: m });
            }

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('🍉');
            await m.reply('An error occurred while processing your request.');
        }
    }
};

const convertAudio = async (url, isVn) => {
    return new Promise(async (resolve, reject) => {
        const time = Date.now();
        const tempIn = path.join(process.cwd(), '/src/assets/temp/audio/', `in_${time}.tmp`);
        // Format output disesuaikan apakah VN (.ogg) atau biasa (.mp3)
        const tempOut = path.join(process.cwd(), '/src/assets/temp/audio/', `out_${time}.${isVn ? 'ogg' : 'mp3'}`);

        try {
            // 1. Download file audio sementara
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(tempIn);
            response.data.pipe(writer);

            writer.on('finish', () => {
                // 2. Konversi menggunakan FFmpeg
                // Jika isVn, convert ke ogg/opus. Jika false, convert ke mp3.
                const ffmpegCommand = isVn
                    ? `ffmpeg -i "${tempIn}" -c:a libopus -b:a 128k -vbr on -compression_level 10 -frame_duration 60 -application voip "${tempOut}"`
                    : `ffmpeg -i "${tempIn}" -b:a 128k -f mp3 "${tempOut}"`;

                exec(ffmpegCommand, (err) => {
                    if (err) {
                        // Bersihkan jika error
                        if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn);
                        return reject(err);
                    }

                    // 3. Baca file hasil konversi menjadi buffer
                    const buffer = fs.readFileSync(tempOut);

                    if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn);
                    if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);

                    resolve(buffer);
                });
            });

            writer.on('error', (err) => {
                if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn);
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};