const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;
const DATA_FILE = './konumlar.json';

let konumlar = [];

if (fs.existsSync(DATA_FILE)) {
  const data = fs.readFileSync(DATA_FILE);
  konumlar = JSON.parse(data);
}

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/yonetici', (req, res) => {
  res.sendFile(__dirname + '/public/yönetici.html');
});

app.post('/konum-guncelle', (req, res) => {
  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Geçersiz veri formatı' });
  }

  const tarih = new Date();
  const skyMapLink = `https://virtualsky.lco.global/embed/index.html?longitude=${longitude}&latitude=${latitude}&constellations=true&gridlines_az=true&live=true`;

  const yeniVeri = { latitude, longitude, tarih, skyMapLink };
  konumlar.push(yeniVeri);

  fs.writeFileSync(DATA_FILE, JSON.stringify(konumlar, null, 2));
  res.status(200).json({ message: 'Konum kaydedildi.' });
});

app.get('/konumlar', (req, res) => {
  res.json(konumlar);
});

app.all('/konum-guncelle', (req, res, next) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  next();
});

app.all('/konumlar', (req, res, next) => {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }
  next();
});

// Sunucu başlatma kısmını değiştirin
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});