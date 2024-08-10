require('colors');
const fs = require('fs');
const { displayHeader, checkBalance } = require('./src/utils');
const { createWallet, createContract } = require('./src/wallet');
const { claimFragmentz } = require('./src/claim');
const { RPC_URL } = require('./src/utils');
const { JsonRpcProvider, ethers } = require('ethers');
const moment = require('moment');

const CONTRACT_ADDRESS = '0xeBBa6Ffff611b7530b57Ed07569E9695B98e6c82';

async function claimFragmentzAutomatically() {
  displayHeader();

  const provider = new JsonRpcProvider(RPC_URL);

  try {
    console.log('Opsi otomatis: Mengklaim Fragmentz menggunakan kunci privat'.cyan);


    const seedPhrasesOrKeys = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));
    if (!Array.isArray(seedPhrasesOrKeys) || seedPhrasesOrKeys.length === 0) {
      throw new Error('File privateKeys.json tidak diatur dengan benar atau kosong'.red);
    }

    const numClaims = 50; 

    for (const keyOrPhrase of seedPhrasesOrKeys) {
      const wallet = createWallet(keyOrPhrase, provider);
      const senderAddress = wallet.address;
      console.log(`Memproses transaksi untuk alamat: ${senderAddress}`.cyan);

      const contract = createContract(wallet, CONTRACT_ADDRESS);
      await claimFragmentz(contract, numClaims);
    }

    console.log('Klaim Fragmentz selesai.'.cyan);
  } catch (error) {
    console.log(`[ ${moment().format('HH:mm:ss')} ] Kesalahan dalam proses: ${error.message}`.red);
  }
}


claimFragmentzAutomatically();

const interval = 12 * 60 * 60 * 1000; 
setInterval(claimFragmentzAutomatically, interval);
