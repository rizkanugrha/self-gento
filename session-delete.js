import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Sesuaikan path session Anda
const sessionDir = path.resolve(`./src/database/${process.env.SESSION_NAME || 'session'}`);

if (!fs.existsSync(sessionDir)) {
    console.log('Folder session tidak ditemukan.');
    process.exit(0);
}

const files = fs.readdirSync(sessionDir);
let deletedCount = 0;

files.forEach(file => {
    // JANGAN HAPUS creds.json, contacts.json, groupMetadata.json, dll
    if (
        file.startsWith('pre-key') ||
        file.startsWith('sender-key') ||
        file.startsWith('session-') ||
        file.startsWith('app-state') ||
        file.startsWith('lid-mapping') ||
        file.startsWith('tc-token')

    ) {
        fs.unlinkSync(path.join(sessionDir, file));
        deletedCount++;
    }
});

console.log(`✅ Berhasil menghapus ${deletedCount} file sampah session.`);