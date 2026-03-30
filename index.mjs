import express from 'express';
import fetch from 'node-fetch';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// pull in the cjs solar package
const require = createRequire(import.meta.url);
const solar = require('npm-solarsystem');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const NASA_KEY = process.env.NASA_KEY || '9mUzIkhlZCZaOoMfspg7jMmwZCZ4LiRHtkgkambD';

// load random bg image on each visit.. picsum can work
app.get('/', (req, res) => {
  const seed = Math.floor(Math.random() * 1000);
  res.render('index', {
    planets,
    bgImage: `https://picsum.photos/seed/${seed}/1920/1080`
  });
});

// planet detail page via query string e.g. /planet?name=Earth
app.get('/planet', (req, res) => {
  const { name } = req.query;
  const planetInfo = solar[`get${name}`]();
  res.render('planet', { planets, name, planetInfo });
});

// nasa picture of the day
app.get('/nasa', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const resp = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&date=${today}`);
    const apod = await resp.json();
    if (apod.error || apod.code) {
      console.error('NASA API error:', apod);
      return res.render('nasa', { planets, apod: {} });
    }
    res.render('nasa', { planets, apod });
  } catch (err) {
    console.error('NASA fetch failed:', err);
    res.render('nasa', { planets, apod: {} });
  }
});

// needed ability to run locally for testing...
if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => console.log('running on http://localhost:3000'));
}

export default app;
