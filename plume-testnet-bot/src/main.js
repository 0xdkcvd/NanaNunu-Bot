const axios = require('axios');
const { ethers } = require('ethers');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const fs = require('fs');
const path = require('path');
const { createWallet, getAddress } = require('../config/wallet');
const { provider, PRIVATE_KEYS, CONTRACT_ADDRESS, MIN_SWAP, MAX_SWAP } = require('../config/config');
const { log } = require('../utils/logger');
const { CrocEnv } = require('@crocswap-libs/sdk');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Read proxy settings from a file
const proxies = fs.readFileSync(path.join(__dirname, '../config/proxy.txt'), 'utf-8').trim().split('\n');

// Contract addresses and ABIs
const contract_goonusd = '0x5c1409a46cd113b3a667db6df0a8d7be37ed3bb3';
const contract_goon = '0x5374Cf69C5610950526C668A7B540df6686531b4';
const contract_stake = '0xA34420e04DE6B34F8680EE87740B379103DC69f6';
const contract_nest = '0xd806259C3389Da7921316fb5489490EA5E2f88C6';
const contract_land = '0x8Dc5b3f1CcC75604710d9F464e3C5D2dfCAb60d8';
const contract_stakeLAND = '0x45934E0253955dE498320D67c0346793be44BEC0';

const stakeABI = [
    { 'inputs': [{ 'internalType': 'uint256', 'name': 'amount', 'type': 'uint256' }], 'name': 'stake', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function' },
    { 'inputs': [], 'name': 'claim', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function' }
];

const ERC20_ABI = [
    { 'constant': true, 'inputs': [{ 'name': 'account', 'type': 'address' }], 'name': 'balanceOf', 'outputs': [{ 'name': 'balance', 'type': 'uint256' }], 'type': 'function' },
    { 'constant': false, 'inputs': [{ 'name': 'recipient', 'type': 'address' }, { 'name': 'amount', 'type': 'uint256' }], 'name': 'transfer', 'outputs': [{ 'name': 'success', 'type': 'bool' }], 'type': 'function' }
];

// Parse proxy from a string
function parseProxy(proxyString) {
    const parts = proxyString.split(':');
    if (parts.length === 4) {
        const [username, password, host, port] = parts;
        return { username, password, host, port };
    } else if (parts.length === 2) {
        const [host, port] = parts;
        return { host, port };
    } else {
        throw new Error(`Invalid proxy format: ${proxyString}`);
    }
}

// Get authentication headers
async function getAuth(walletAddress, token) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        'Content-Type': 'application/json',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://faucet.plumenetwork.xyz',
        'accept-language': 'en-US,en;q=0.9',
        'pragma': 'no-cache',
        'origin': 'https://faucet.plumenetwork.xyz'
    };

    const response = await axios.post('https://faucet.plumenetwork.xyz/api/faucet', { walletAddress, token }, { headers });
    return response.data;
}

// Get token balance
async function getTokenBalance(wallet, contractAddress) {
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, wallet);
    const balance = await contract.balanceOf(wallet.address);
    return ethers.utils.formatUnits(balance, 18);
}

// Handle errors and retry if necessary
function handleError(error, attempt, maxAttempts, callback) {
    if (attempt < maxAttempts) {
        log('ERROR', `Error occurred: ${error.message}. Retrying in ${attempt + 1}/${maxAttempts} attempts...`);
        setTimeout(callback, 2000);
    } else {
        log('ERROR', `Max attempts reached. Error: ${error.message}`);
    }
}

// Check in with a specific key
async function callCheckInForKey(privateKey) {
    const wallet = createWallet(privateKey, provider);
    const address = getAddress(privateKey, provider);
    log('INFO', `Wallet address: ${address}`);

    const stakeContract = new ethers.Contract(contract_stake, stakeABI, wallet);
    log('INFO', 'CheckIn and Claiming Nest Staking rewards');

    try {
        const stakeTransaction = await stakeContract.claim();
        const stakeReceipt = await stakeTransaction.wait();
        log('SUCCESS', `Staking reward claimed: ${stakeReceipt.transactionHash}`);

        const nestBalance = await getTokenBalance(wallet, contract_nest);
        log('DEBUG', `NEST balance: ${nestBalance}`);

        const checkInTransaction = await stakeContract.checkIn();
        const checkInReceipt = await checkInTransaction.wait();
        log('SUCCESS', `CheckIn successful: ${checkInReceipt.transactionHash}`);
    } catch (error) {
        if (error.message.includes('execution reverted: "Wallet already minted"')) {
            log('ERROR', 'Wallet already minted.');
        } else {
            log('ERROR', `Error: ${error.message}`);
        }
    }
}

// Check in for all keys
async function checkIn() {
    for (const key of PRIVATE_KEYS) {
        await callCheckInForKey(key);
        await delay(2000);
    }
    log('INFO', 'Check-in completed for all wallets.');
}

// Claim ETH from the faucet
async function claimFaucetETH(privateKey, proxy) {
    try {
        const walletAddress = getAddress(privateKey, provider);
        log('INFO', `Wallet address: ${walletAddress}`);
        log('INFO', 'Requesting ETH tokens from the faucet...');

        const { host, port, username, password } = parseProxy(proxy);
        const proxyUrl = `http://${username}:${password}@${host}:${port}`;
        const httpsAgent = new HttpsProxyAgent(proxyUrl);

        axios.defaults.httpAgent = httpsAgent;
        axios.defaults.httpsAgent = httpsAgent;

        log('DEBUG', 'Proxy is connected!');

        const { salt, signature } = await getAuth(walletAddress, 'token');
        const wallet = createWallet(privateKey, provider);

        const txData = `0x103fc452000000000000000000000000${walletAddress.slice(2)}${salt.slice(2)}0000000000000000000000000000000000000000000000000000000000000000${signature.slice(2)}00000000000000000000000000000000000000000000000000000000000000`;
        const transaction = { data: txData, to: CONTRACT_ADDRESS, value: 0 };
        const tx = await wallet.sendTransaction(transaction);
        await tx.wait();

        log('SUCCESS', `Transaction successful: https://testnet-explorer.plumenetwork.xyz/tx/${tx.hash}`);
    } catch (error) {
        if (error.message.includes('Please try again the next day.') || error.message.includes('Please try again in 2 hours.')) {
            log('ERROR', 'Faucet request limit reached.');
        } else {
            log('ERROR', `Failed to claim faucet: ${error.message}`);
        }
    }
}

// Claim ETH from the faucet for all keys
async function faucetETH() {
    for (let i = 0; i < PRIVATE_KEYS.length; i++) {
        const privateKey = PRIVATE_KEYS[i];
        const proxy = proxies[i % proxies.length];
        await claimFaucetETH(privateKey, proxy);
        await delay(2000);
    }
    log('INFO', 'Faucet ETH completed for all wallets.');
}

// Main function to execute all tasks
(async function main() {
    await checkIn();
    await faucetETH();
    log('INFO', 'All tasks completed.');
})();
