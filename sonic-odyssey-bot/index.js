const fs = require('fs');
const readlineSync = require('readline-sync');
const colors = require('colors');
const cron = require('node-cron');

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
  const delayBetweenTx = 2000; // Default delay between transactions in milliseconds

  for (const [index, privateKey] of seedPhrasesOrKeys.entries()) {
    let successfulTxCount = 0; 

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


  const nextRunDate = new Date(Date.now() + 24 * 60 * 60 * 1000); 
  console.log(colors.yellow(`Next run scheduled at: ${nextRunDate.toUTCString()} UTC`));
};


runProcess();

// Schedule the process to run every day at 00:30 UTC
cron.schedule('30 0 * * *', runProcess);

// Add a notification 1 hour before the next run
cron.schedule('0 23 * * *', () => {
  console.log(colors.yellow(`Script will run again in 1 hour!`));
});
