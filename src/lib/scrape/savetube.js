import axios from 'axios';
import crypto from 'crypto';

class SaveTube {
    constructor() {
        this.key = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex');
        this.baseHeaders = {
            'origin': 'https://save-tube.com',
            'referer': 'https://save-tube.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };
    }

    _decrypt(enc) {
        const b = Buffer.from(enc.replace(/\s/g, ''), 'base64');
        const iv = b.subarray(0, 16);
        const data = b.subarray(16);
        const decipher = crypto.createDecipheriv('aes-128-cbc', this.key, iv);
        return JSON.parse(Buffer.concat([decipher.update(data), decipher.final()]).toString());
    }

    async _getCDN() {
        const { data } = await axios.get('https://media.savetube.vip/api/random-cdn', { headers: this.baseHeaders });
        return data.cdn;
    }

    async _fetchDownloadUrl(cdn, id, key, type, quality) {
        try {
            const { data } = await axios.post(`https://${cdn}/download`, {
                id, key, downloadType: type, quality: String(quality)
            }, {
                headers: { 'Content-Type': 'application/json', ...this.baseHeaders }
            });
            return data?.data?.downloadUrl || null;
        } catch {
            return null;
        }
    }

    /**
     * @param {string} url - URL Video YouTube
     * @param {string} type - 'all' | 'video' | 'audio' (default: 'all')
     */
    async download(url, type = 'all') {
        try {
            const cdn = await this._getCDN();
            const infoRes = await axios.post(`https://${cdn}/v2/info`, { url }, {
                headers: { 'Content-Type': 'application/json', ...this.baseHeaders }
            });

            if (!infoRes.data?.status) return { status: false, message: "Video not found" };

            const json = this._decrypt(infoRes.data.data);
            const mediaTasks = [];

            const fetchVideo = type === 'all' || type === 'video';
            const fetchAudio = type === 'all' || type === 'audio';

            if (fetchVideo) {
                json.video_formats.forEach(v => {
                    mediaTasks.push((async () => ({
                        kind: 'video',
                        quality: v.quality,
                        label: v.label,
                        url: await this._fetchDownloadUrl(cdn, json.id, json.key, 'video', v.quality)
                    }))());
                });
            }

            if (fetchAudio) {
                json.audio_formats.forEach(a => {
                    mediaTasks.push((async () => ({
                        kind: 'audio',
                        quality: a.quality,
                        label: a.label,
                        url: await this._fetchDownloadUrl(cdn, json.id, json.key, 'audio', a.quality)
                    }))());
                });
            }

            const media = await Promise.all(mediaTasks);

            return {
                status: true,
                title: json.title,
                duration: json.duration,
                thumbnail: json.thumbnail,
                results: media.filter(m => m.url !== null)
            };

        } catch (error) {
            return { status: false, error: error.message };
        }
    }
}

export { SaveTube }