import { createCanvas, loadImage, CanvasRenderingContext2D, registerFont } from 'canvas';
import { writeFileSync, readdirSync } from 'fs';
import path from 'path';
import moment from 'moment-timezone';

let fonts = readdirSync('./src/assets/font')

fonts.map(x => {
    const fontName = x.substring(0, x.lastIndexOf("."))
    registerFont(path.join('./src/assets/font', x), { family: fontName })
})

export async function drawImage(quotes, pp, username, name) {
    const canvas = createCanvas(650, 650);
    const ctx = canvas.getContext('2d');

    // Background color (light gray)
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Message box dimensions
    const boxWidth = 420;
    const boxHeight = 300;
    const boxX = (canvas.width - boxWidth) / 2; // Center horizontally
    const boxY = (canvas.height - boxHeight) / 2; // Center vertically

    // Draw message box shadow (centered)
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#999';
    ctx.shadowBlur = 5;
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 25);
    ctx.fill();

    const profileBoxWidth = 260;
    const profileBoxHeight = 70;
    const profileBoxX = (canvas.width - profileBoxWidth) / 2;
    const profileBoxY = boxY - profileBoxHeight - -40;

    ctx.shadowBlur = 3;
    ctx.fillStyle = '#fff';
    ctx.roundRect(profileBoxX, profileBoxY, profileBoxWidth, profileBoxHeight, 35);
    ctx.fill();

    const profilePic = await loadImage(pp);

    const picSize = 50;
    const picX = profileBoxX + 20;
    const picY = profileBoxY + 10;
    ctx.drawImage(profilePic, picX, picY, picSize, picSize);

    const padding = 15;
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px MontserratBold';
    const nameX = picX + picSize + padding;
    const nameY = picY + 20;

    ctx.fillText(name, nameX, nameY);
    const usernameWidth = ctx.measureText(name).width;

    ctx.fillStyle = 'red';
    ctx.font = '20px Arial';
    const heartX = nameX + usernameWidth + padding;
    ctx.fillText('♥', heartX, nameY);

    ctx.fillStyle = '#888';
    ctx.font = '14px Montserrat';
    const handleY = nameY + 20;
    ctx.fillText(username, nameX, handleY);

    const maxWidth = boxWidth - 40;
    const lineHeight = 25;

    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px MontserratBold';
    ctx.textAlign = 'center';
    const textX = boxX + boxWidth / 2;
    wrapText(ctx, quotes, textX, boxY + 100, maxWidth, lineHeight);

    // Get the current date formatted with moment-timezone
    const today = moment.tz('Asia/Jakarta').format('D MMM YYYY'); // E.g., "3 Mar 2022"

    ctx.fillStyle = '#888';
    ctx.font = '12px Montserrat';
    ctx.textAlign = 'center';
    ctx.fillText(today, textX, boxY + boxHeight - 20);

    const createdByBoxHeight = 40;
    const createdByBoxY = boxY + boxHeight + 20;
    const createdByBoxX = (canvas.width - boxWidth) / 2;

    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 5;
    ctx.roundRect(createdByBoxX, createdByBoxY, boxWidth, createdByBoxHeight, 15);
    ctx.fill();

    ctx.fillStyle = '#888';
    ctx.font = '16px Montserrat';
    ctx.textAlign = 'center';
    ctx.fillText('Created with violet-rzk BOT', createdByBoxX + boxWidth / 2, createdByBoxY + createdByBoxHeight / 2 + 5);
    return canvas
    // console.log('Image created successfully!');
}

// Rounded rectangle utility function
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    return this;
};

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    let fontSize = 20;
    let words = text.split(' ');
    let line = '';
    let lines = [];

    do {
        ctx.font = `${fontSize}px Montserrat`;
        line = '';
        lines = [];

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const testWidth = ctx.measureText(testLine).width;

            if (testWidth > maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        if (lines.length * lineHeight > 200) {
            fontSize--;
        } else {
            break;
        }
    } while (fontSize > 10);

    ctx.font = `${fontSize}px Montserrat`;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + i * lineHeight);
    }
}
