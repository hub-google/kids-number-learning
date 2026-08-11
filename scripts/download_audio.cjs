const https = require('https');
const fs = require('fs');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const main = async () => {
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const clapText = encodeURIComponent('你好厲害！拍拍手！');
  const cheerText = encodeURIComponent('太棒了！為你拍拍手！繼續加油！');

  const clapUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=zh-TW&q=${clapText}`;
  const cheerUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=zh-TW&q=${cheerText}`;

  console.log('Downloading clap.mp3...');
  await download(clapUrl, path.join(publicDir, 'clap.mp3'));
  console.log('Downloaded clap.mp3');

  console.log('Downloading cheer.mp3...');
  await download(cheerUrl, path.join(publicDir, 'cheer.mp3'));
  console.log('Downloaded cheer.mp3');
};

main().catch(console.error);
