const { stripHexPrefix, toChecksumAddress } = require('crypto-addr-codec');
const { bech32 } = require('bech32');

const { encode, decode, toWords, fromWords } = bech32;

const npubPrefix = 'npub';

function hexEncoder() {
  return (data) => toChecksumAddress(data.toString('hex'));
}

function hexDecoder() {
  return (data) => {
    return Buffer.from(stripHexPrefix(data), 'hex');
  };
}

function bech32Encoder(prefix) {
  return (data) => encode(prefix, toWords(data));
}

function bech32Decoder(currPrefix) {
  return (data) => {
    const { prefix, words } = decode(data);

    if (prefix !== currPrefix) {
      throw Error('Invalid Address Format');
    }

    return Buffer.from(fromWords(words));
  };
}

function hexConverter() {
  return {
    decoder: hexDecoder(),
    encoder: hexEncoder(),
  };
}

function bech32Convert(prefix) {
  return {
    decoder: bech32Decoder(prefix),
    encoder: bech32Encoder(prefix),
  };
}

function checkIsETH(address) {
  return /^0x[0-9a-fA-F]{64}$/.test(address);
}

function converter(prefix = npubPrefix) {
  return {
    // input: npub1tctw0jgmujwshn5k0r9ku906ycg0euw7vwyeca7ul7wayuyvhc3sfhx6f0
    // output: 0x5E16e7c91Be49D0BCe9678cB6E15Fa2610fCF1dE63899c77DCFf9DD2708CbE23
    toHex: (address) => hexConverter().encoder(bech32Convert(prefix).decoder(address)),
    // input: 0x5E16e7c91Be49D0BCe9678cB6E15Fa2610fCF1dE63899c77DCFf9DD2708CbE23 || 5E16e7c91Be49D0BCe9678cB6E15Fa2610fCF1dE63899c77DCFf9DD2708CbE23
    // output: npub1tctw0jgmujwshn5k0r9ku906ycg0euw7vwyeca7ul7wayuyvhc3sfhx6f0
    toBech32: (address) => bech32Convert(prefix).encoder(hexConverter().decoder(formatETHAddress(address))),
  };
}

function formatETHAddress(address) {
  if (checkIsETH(address)) {
    return address;
  }
  if (address?.length === 64 && address.startsWith('0x') === false) {
    return `0x${address}`;
  }
  throw Error('Invalid ETH Address');
}

module.exports = {
  converter,
  npubPrefix,
};

// test code
const pubKeyConverter = converter('npub');
console.log('utils.js loaded');
console.log(pubKeyConverter.toHex('npub1tctw0jgmujwshn5k0r9ku906ycg0euw7vwyeca7ul7wayuyvhc3sfhx6f0'));
console.log(pubKeyConverter.toBech32('5E16e7c91Be49D0BCe9678cB6E15Fa2610fCF1dE63899c77DCFf9DD2708CbE23'));
console.log(pubKeyConverter.toBech32('0x5E16e7c91Be49D0BCe9678cB6E15Fa2610fCF1dE63899c77DCFf9DD2708CbE23'));
console.log('utils.js ended');
