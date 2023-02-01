const express = require('express');

const env = require('./libs/env');

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
    } else {
      res.json({
        names: {
          [name]: env.preferences.pubkey,
        },
        relays: env.preferences.pubkey
          ? {
              [env.preferences.pubkey]: (env.preferences.relays || []).map((x) => x.relay).filter(Boolean),
            }
          : {},
      });
    }
  } else {
    res.json({ names: {}, relays: {} });
  }
});

app.listen(port, () => {
  console.log(`Blocklet app listening on port ${port}`);
});
