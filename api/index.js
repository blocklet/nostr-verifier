const express = require('express');

const env = require('./libs/env');
const { converter, npubPrefix } = require('./libs/utils');
const logger = require('./libs/logger');

const app = express();

const port = process.env.BLOCKLET_PORT || process.env.PORT || 3030;

const getResponse = () => {
  const hasPubkey = !!env.preferences.pubkey;
  if (hasPubkey) {
    let { pubkey } = env.preferences;
    const needFormatToHex = pubkey.startsWith(npubPrefix);
    if (needFormatToHex) {
      pubkey = converter('npub').toHex(pubkey);
    }

    // try to remove 0x flag and to lower case
    pubkey = pubkey.replace('0x', '').toLowerCase();

    return {
      names: {
        [env.preferences.username]: pubkey,
      },
      relays: {
        [pubkey]: (env.preferences.relays || []).map((x) => x.relay).filter(Boolean),
      },
    };
  }

  return { names: {}, relays: {} };
};

app.get('/', (req, res) => {
  try {
    res.json(getResponse());
  } catch (error) {
    logger.error('gen response failed: ', error);
    res.json({ error: 'gen response failed' });
  }
});

app.get('/.well-known/nostr.json', (req, res) => {
  const { name = '' } = req.query;
  if (name) {
    if (env.preferences.username !== name) {
      res.json({ names: {}, relays: {} });
      return;
    }

    try {
      res.json(getResponse());
    } catch (error) {
      logger.error('gen response failed: ', error);
      res.json({ error: 'gen response failed' });
    }
  } else {
    res.json({ names: {}, relays: {} });
  }
});

app.listen(port, () => {
  console.log(`ready on port ${port}`);
});
