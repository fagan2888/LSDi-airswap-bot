import 'core-js/stable';
import 'regenerator-runtime/runtime';

import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import fetch from 'node-fetch';
import Router from 'airswap.js/src/protocolMessaging';

import { erc20Generic } from './abi/erc20Generic';
import { Utils } from './Utils';

console.log('Configuring maker...');

const cdai = '0xf5dce57282a584d2746faf1593d3121fcac444dc';

console.log('collateralAddress', process.env.COLLATERAL_ADDRESS);
const collateralAddress = Utils.validateHexString(process.env.COLLATERAL_ADDRESS);
const priceFeed = `https://api.compound.finance/api/v2/ctoken?addresses[]=${cdai}`;

const privateKey = process.env.PRIVATE_KEY;

const eighteen = BigNumber('1000000000000000000');
const five = BigNumber('100000');
const thirteen = '0000000000000';

const eighteenToFive = num => BigNumber(num).dividedBy(eighteen).multipliedBy(five);

console.log('tokens', process.env.TOKENS);
const tokens = process.env.TOKENS.split(',').map(token => Utils.validateHexString(token));

const config = {
  collateralAddress,
  priceFeed,
  privateKey,
  tokens,
};

const provider = ethers.getDefaultProvider();

const wallet = new ethers.Wallet(config.privateKey, provider);

const address = wallet.address.toLowerCase();
const keyspace = false;
const messageSigner = data => wallet.signMessage(data);
const requireAuthentication = true;
const jsonrpc = '2.0';
const airswapExchangeAddress = '0x8fd3121013a07c57f0d69646e86e7a4880b467b7';

// Give the AirSwap smart contract permission to transfer an ERC20 token.
// * Must call `approveTokenForTrade` one time for each token you want to trade
// * Optionally pass an object to configure gas settings
// * returns a `Promise`
const enableToken = async (tokenAddress) => {
  console.log('Enabling token', tokenAddress);
  const gasLimit = 160000;
  const gasPrice = ethers.utils.parseEther('0.000000040');

  const tokenContract = new ethers.Contract(tokenAddress, erc20Generic, wallet);

  const approved = await tokenContract.allowance(address, airswapExchangeAddress);

  if (BigNumber(approved).isGreaterThan(0)) {
    console.log('Already enabled', tokenAddress);
    return true;
  }

  console.log('Sending approve transaction', tokenAddress);

  return tokenContract.approve(
    airswapExchangeAddress,
    '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    { gasLimit, gasPrice },
  );
};

const getPrice = async () => {
  const response = await fetch(config.priceFeed);
  const feed = await response.json();
  // console.log('feed', feed);

  const { value } = feed.cToken[0].supply_rate;

  // TODO: Handle the Long position pricing
  const price = BigNumber(value).multipliedBy(100).minus(6).dp(2);
  console.log('Price is', price.toString());

  return price;
};

getPrice();

console.log('erc20', erc20Generic);

const getBalance = async (makerAddress, tokenAddress) => {
  console.log('getBalance maker:', makerAddress, 'token:', tokenAddress);
  const contract = new ethers.Contract(tokenAddress, erc20Generic, provider);
  const balance = await contract.balanceOf(makerAddress);
  return Utils.wrapAsBigNumber(balance.toString());
};

const signOrder = async (order) => {
  const types = [
    'address', // makerAddress
    'uint256', // makerAmount
    'address', // makerToken
    'address', // takerAddress
    'uint256', // takerAmount
    'address', // takertoken
    'uint256', // expiration
    'uint256', // nonce
  ];

  const {
    expiration,
    makerAddress,
    makerAmount,
    makerToken,
    nonce,
    takerAddress,
    takerAmount,
    takerToken,
  } = order;

  const hashedOrder = ethers.utils.solidityKeccak256(types, [
    makerAddress,
    makerAmount,
    makerToken,
    takerAddress,
    takerAmount,
    takerToken,
    expiration,
    nonce,
  ]);

  console.log(hashedOrder);

  const signedMsg = await wallet.signMessage(ethers.utils.arrayify(hashedOrder));
  const sig = ethers.utils.splitSignature(signedMsg);

  return {
    ...order,
    ...sig,
  };
};

const router = new Router({ address, keyspace, messageSigner, requireAuthentication });

const main = async () => {
  console.log('Connecting to Airswap...');

  await router.connect().catch((e) => {
    console.log('unable to connect to the Airswap WebSocket', e);
    process.exit(1);
  });

  const intents = [];

  await enableToken(config.collateralAddress);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < tokens.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await enableToken(tokens[i]);
  }

  config.tokens.forEach((token) => {
    intents.push({
      makerToken: token,
      role: 'maker',
      supportedMethods: ['getOrder', 'getQuote', 'getMaxQuote'],
      takerToken: config.collateralAddress,
    });
  });

  console.log('Setting intents...', intents);

  await router.setIntents(intents).catch((e) => {
    console.log('unable to set intents', e);
    process.exit(1);
  });

  router.RPC_METHOD_ACTIONS.getOrder = async (payload) => {
    console.log('getOrder called with', payload);
    const { message, sender } = payload;
    const { id, params } = message;
    const { makerToken, takerAddress, takerToken, makerAmount } = params;
    const makerAddress = address;
    const requestedMakerAmount = BigNumber(makerAmount);

    if (requestedMakerAmount.isZero()) {
      console.log('Zero amount order request halted');
      return;
    }

    // get our token balance
    const makerBalance = await getBalance(makerAddress, makerToken);

    // validate our balance
    if (makerBalance.isLessThan(requestedMakerAmount)) {
      console.log(
        'Insufficient maker balance',
        requestedMakerAmount.toString(),
        '<',
        makerBalance.toString(),
      );
      return;
    }

    const price = await getPrice();
    const takerAmount = requestedMakerAmount.multipliedBy(price).toString() + thirteen;

    // get their token balance
    const takerBalance = await getBalance(takerAddress, takerToken);

    // validate the balance
    if (takerBalance.isLessThan(takerAmount)) {
      console.log('Insufficient taker balance', takerBalance.toString(), '<', takerAmount);
      return;
    }

    // Good to go
    const expiration = Math.round(new Date().getTime() / 1000) + 600; // Expire after 5 minutes
    const nonce = Number(Math.random() * 100000).toFixed().toString();

    const order = {
      expiration,
      makerAddress,
      makerAmount,
      makerToken,
      nonce,
      takerAddress,
      takerAmount,
      takerToken,
    };

    console.log('ORDER', order);

    const result = await signOrder(order);

    const response = { id, jsonrpc, result };

    // Send the order
    router.call(sender, response);
    console.log('sent order', response);
  };

  router.RPC_METHOD_ACTIONS.getQuote = async (payload) => {
    console.log('getQuote called with', payload);
    const { message, sender } = payload;
    const { id, params } = message;
    const { makerAddress, makerToken, takerAmount, takerToken } = params;

    const price = await getPrice();
    const requestedAmount = await Utils.wrapAsBigNumber(takerAmount);
    const requiredMakerAmount = requestedAmount.dividedBy(price);
    const makerAmount = eighteenToFive(requiredMakerAmount).dp(0).toString();

    const result = { makerAddress, makerAmount, makerToken, takerAmount, takerToken };

    const response = { id, jsonrpc, result };

    // Send the quote
    router.call(sender, response);
    console.log('sent quote', response);
  };

  router.RPC_METHOD_ACTIONS.getMaxQuote = async (payload) => {
    console.log('getMaxQuote called with', payload);
    const { message, sender } = payload;
    const { id, params } = message;
    const { makerToken, takerToken } = params;
    const makerAddress = address;

    // get our token balance
    const makerBalance = await getBalance(makerAddress, makerToken);

    // get the max amount
    const price = await getPrice();
    const makerAmount = makerBalance.toString();
    const takerAmount = makerBalance.multipliedBy(price).dp(0).toString() + thirteen;

    const result = { makerAddress, makerAmount, makerToken, takerAmount, takerToken };

    const response = { id, jsonrpc, result };

    // Send the quote
    router.call(sender, response);
    console.log('sent max quote', response);
  };
};

main();
