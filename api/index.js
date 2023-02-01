const express = require('express');

const env = require('./libs/env');
const { converter, npubPrefix } = require('./libs/utils');
const logger = require('./libs/logger');

const app = express();

const port = process.env.BLOCKLET_PORT || process.env.PORT || 3030;

app.get('/', (req, res) => {
  res.json(env.preferences);
});

app.get('/.well-known/nostr.json', (req, res) => {
  const { name = '' } = req.query;
  if (name) {
    if (env.preferences.username !== name) {
      res.json({
        names: {
          [name]: '',
        },
        relays: {
          [name]: [],
        },
      });
      return;
    }

    const hasPubkey = !!env.preferences.pubkey;

    if (hasPubkey) {
      let { pubkey } = env.preferences;
      const needFormatToHex = pubkey.startsWith(npubPrefix);
      if (needFormatToHex) {
        try {
          // format npub to hex
          pubkey = converter('npub').toHex(pubkey);
        } catch (error) {
          logger.error('format npub to hex failed: ', error);
          res.send('format npub to hex failed');
          return;
        }
      }

      // try to remove 0x flag and to lower case
      pubkey = pubkey.replace('0x', '').toLowerCase();

      res.json({
        names: {
          [name]: pubkey,
        },
        relays: hasPubkey
          ? {
              [pubkey]: (env.preferences.relays || []).map((x) => x.relay).filter(Boolean),
            }
          : {},
      });

      return;
    }
  }

  res.json({ names: {}, relays: {} });
});

app.listen(port, () => {
  console.log(`Blocklet app listening on port ${port}`);
});
