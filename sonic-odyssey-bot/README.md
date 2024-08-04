# Sonic Odyssey Bot

Sonic Odyssey Bot is an application designed to interact with the Sonic Odyssey platform. It supports various features including sending SOL (Solana) cryptocurrency transactions, claiming rewards, opening mystery boxes, and daily login operations. The bot has been modified to run continuously for 24 hours.

## Thanks to

Special thanks to @dante4rt for creating this project. Your contributions and hard work are greatly appreciated.

## Features

- **Transaction Sending**: Sends SOL transactions from multiple accounts to random addresses.
- **Claim Box**: Automates the process of claiming rewards boxes.
- **Open Box**: Automates the process of opening mystery boxes.
- **Daily Login**: Automates the daily login process.
- **Input Methods**: Supports input via seed phrases or private keys.
- **Random Address Generation**: Generates a specified number of random addresses for sending transactions.
- **Adjustable Amount of SOL**: Allows users to specify the amount of SOL to send in each transaction.
- **Transaction Delay**: Allows users to specify a delay between each transaction.

## Prerequisites

- Node.js installed on your machine
- `npm` or `yarn` package manager

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/0xdkcvd/NanaNunu-Bot/sonic-odyssey-bot.git
   ```

2. Navigate into the project directory:

   ```bash
   cd sonic-odyssey-bot
   ```

3. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

4. Prepare input files:

   - Create `privateKeys.json` with an array of private keys (base58 encoded).

   Example `privateKeys.json`:
   ```json
   [
     "your_private_key_1",
     "your_private_key_2"
   ]
   ```

## Usage

Run the bot using Node.js:

```bash
npm start
```

or

```bash
npm run claim
```

Follow the prompts to:

1. Select the input method (0 for seed phrase, 1 for private key).
2. Specify the number of random addresses to generate.
3. Enter the amount of SOL to send in each transaction.
4. Enter the delay between each transaction in milliseconds (default is 1000ms).
5. Choose an operation:
   - 1: Claim Box
   - 2: Open Box
   - 3: Daily Login

## Contributing

Contributions are welcome! Feel free to open issues or pull requests for any improvements or fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
