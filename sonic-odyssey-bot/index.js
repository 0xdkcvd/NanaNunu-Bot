const fs = require('fs');
const readlineSync = require('readline-sync');
const colors = require('colors');

const {
  sendSol,
  generateRandomAddresses,
  getKeypairFromPrivateKey,
  PublicKey,
  connection,
  LAMPORTS_PER_SOL,
  delay,
} = require('./src/solanaUtils');

const { displayHeader } = require('./src/displayUtils');

// Fungsi untuk menjalankan proses utama
const runProcess = async () => {
  displayHeader();

  let seedPhrasesOrKeys;
  seedPhrasesOrKeys = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));
  if (!Array.isArray(seedPhrasesOrKeys) || seedPhrasesOrKeys.length === 0) {
    throw new Error(
      colors.red('privateKeys.json is not set correctly or is empty')
    );
  }

  const defaultAddressCount = 100;
  const randomAddresses = generateRandomAddresses(defaultAddressCount);

  let rentExemptionAmount;
  try {
    rentExemptionAmount =
      (await connection.getMinimumBalanceForRentExemption(0)) /
      LAMPORTS_PER_SOL;
    console.log(
      colors.yellow(
        `Minimum balance required for rent exemption: ${rentExemptionAmount} SOL`
      )
    );
  } catch (error) {
    console.error(
      colors.red(
        'Failed to fetch minimum balance for rent exemption. Using default value.'
      )
    );
    rentExemptionAmount = 0.001;
  }

  const amountToSend = 0.001; // Default amount to send
  const delayBetweenTx = 1000; // Default delay between transactions in milliseconds

  for (const [index, privateKey] of seedPhrasesOrKeys.entries()) {
    let successfulTxCount = 0; // Penomoran dimulai dari awal untuk setiap akun

    const fromKeypair = getKeypairFromPrivateKey(privateKey);
    console.log(
      colors.yellow(
        `Sending SOL from account ${
          index + 1
        }: ${fromKeypair.publicKey.toString()}`
      )
    );

    for (const [txIndex, address] of randomAddresses.entries()) {
      const toPublicKey = new PublicKey(address);
      try {
        await sendSol(fromKeypair, toPublicKey, amountToSend);
        successfulTxCount++;
        console.log(
          colors.green(
            `Transaction ${successfulTxCount}: Successfully sent ${amountToSend} SOL to ${address} from ${fromKeypair.publicKey.toString()}`
          )
        );
      } catch (error) {
        console.error(colors.red(`Failed to send SOL to ${address}:`), error);
      }
      await delay(delayBetweenTx);
    }
  }

  // Setelah semua proses selesai, jadwalkan untuk menjalankan kembali setelah 24 jam
  const nextRun = new Date();
  nextRun.setDate(nextRun.getDate() + 1); // Tambah 1 hari
  console.log(colors.yellow(`Next run scheduled at: ${nextRun}`));

  // Menunggu selama 24 jam sebelum menjalankan proses lagi
  setTimeout(runProcess, 24 * 60 * 60 * 1000); // 24 jam dalam milidetik
};

// Jalankan proses pertama kali
runProcess();
