// Dependencies
const readline = require('readline');
const readlineSync = require('readline-sync');
const chalk = require('chalk');
const { printName } = require('./utils/name');
const {
    checkIn,
    faucetETH,
    faucetGOON,
    swapTokens,
    LandShare,
    stake,
    predict,
    KumaBond,
    createToken,
    runAllTasks
} = require('./src/main');

// Function to prompt user input asynchronously
async function promptUser(question) {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(chalk.blueBright(question), answer => {
            rl.close();
            resolve(answer);
        });
    });
}

// Function to input password
function inputPassword() {
    const correctPassword = 'nananunu'; // Replace with actual password
    const enteredPassword = readlineSync.question('Enter password: ', {
        hideEchoBack: false // Hide password input
    });

    if (enteredPassword !== correctPassword) {
        console.error(chalk.red('Incorrect password. Access denied.'));
        console.error(chalk.red('Exiting program. Goodbye!'));
        process.exit(1); // Exit with error code 1
    }
}

// Main function
async function main() {
    printName(); // Print application name or header
    inputPassword(); // Prompt user for password and verify

    async function runScriptMenu() {
        console.log(chalk.green('Available Scripts:'));
        console.log('1. CheckIn');
        console.log('2. Claim Faucet ETH');
        console.log('3. Claim Faucet GOON');
        console.log('4. Swap GOON/goonUSD');
        console.log('5. Stake goonUSD');
        console.log('6. Predict ETH/BTC/ARB Price');
        console.log('7. Create Asset Tokenized');
        console.log('8. Swap and Stake LAND');
        console.log('9. Mint and Sell KumaBond');
        console.log('10. Run All Tasks Sequentially');
        console.log('0. Exit Program');

        const choice = await promptUser('Choose the script to run: ');

        switch (choice) {
            case '1':
                await checkIn();
                break;
            case '2':
                await faucetETH();
                break;
            case '3':
                await faucetGOON();
                break;
            case '4':
                await swapTokens();
                break;
            case '5':
                await stake();
                break;
            case '6':
                await predict();
                break;
            case '7':
                await createToken();
                break;
            case '8':
                await LandShare();
                break;
            case '9':
                await KumaBond();
                break;
            case '10':
                await runAllTasks();
                break;
            case '0':
                console.log(chalk.blueBright('Exiting program. Goodbye!'));
                process.exit(0);
                break;
            default:
                console.log(chalk.red('Invalid choice. Please restart and choose 1 - 10.'));
                break;
        }
    }

    await runScriptMenu();
}

main().catch(error => {
    console.error(error);
});