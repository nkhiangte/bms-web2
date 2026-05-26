import https from 'https';
import fs from 'fs';
import path from 'path';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        return reject(new Error('Status: ' + res.statusCode));
      }
      
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  await downloadFile('https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png', 'assets/icon.png');
  await downloadFile('https://placehold.jp/1024x1024/ffffff/ffffff.png', 'assets/icon-background.png');
  console.log('Downloaded raw bytes');
  console.log('icon.png bytes:', fs.readFileSync('assets/icon.png').slice(0, 16).toString('hex'));
}
run();
