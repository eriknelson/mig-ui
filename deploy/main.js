process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const fs = require('fs');
const axios = require('axios');
const read = require('read-yaml');

const migMetaFile = process.env['MIGMETA_FILE'] || '/srv/migmeta.json';
const viewsDir = process.env['VIEWS_DIR'] || '/srv/views';
const staticDir = process.env['STATIC_DIR'] || '/srv/static';
//let migMetaStr = fs.readFileSync(migMetaFile, 'utf8')
//let migMetaStr = read.sync(migMetaFile);
//console.log('initial migMetaStr', migMetaStr)
//const migMeta = JSON.parse(migMetaStr)
const migMeta = read.sync(migMetaFile);


const app = express();
app.engine('ejs', require('ejs').renderFile);
app.set('views', viewsDir);
app.use(express.static(staticDir));
const port = 9000;

async function main(url) {
  const wellKnownUrl = `${migMeta.clusterApi}/.well-known/oauth-authorization-server`
  const wellKnownRes = await axios.get(wellKnownUrl);
  console.log('got well known: ', wellKnownRes.data);
  migMeta.oauth.wellKnown = wellKnownRes.data;
  let migMetaStr = JSON.stringify(migMeta);

  console.log('migMetaFile: ', migMetaFile);
  console.log('viewsDir: ', viewsDir);
  console.log('staticDir: ', staticDir);
  console.log('migMeta:');
  console.log(migMetaStr);

  const encodedMigMeta = Buffer.from(migMetaStr).toString('base64');

  app.get('*', (req, res) => {
    res.render('index.ejs', { migMeta: encodedMigMeta });
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

main();
