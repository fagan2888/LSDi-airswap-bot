export const airswapExchange = [
  {
    constant: false,
    inputs: [
      {
        name: 'makerAddress',
        type: 'address',
      },
      {
        name: 'makerAmount',
        type: 'uint256',
      },
      {
        name: 'makerToken',
        type: 'address',
      },
      {
        name: 'takerAddress',
        type: 'address',
      },
      {
        name: 'takerAmount',
        type: 'uint256',
      },
      {
        name: 'takerToken',
        type: 'address',
      },
      {
        name: 'expiration',
        type: 'uint256',
      },
      {
        name: 'nonce',
        type: 'uint256',
      },
      {
        name: 'v',
        type: 'uint8',
      },
      {
        name: 'r',
        type: 'bytes32',
      },
      {
        name: 's',
        type: 'bytes32',
      },
    ],
    name: 'fill',
    outputs: [],
    payable: true,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'fills',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'makerAddress',
        type: 'address',
      },
      {
        name: 'makerAmount',
        type: 'uint256',
      },
      {
        name: 'makerToken',
        type: 'address',
      },
      {
        name: 'takerAddress',
        type: 'address',
      },
      {
        name: 'takerAmount',
        type: 'uint256',
      },
      {
        name: 'takerToken',
        type: 'address',
      },
      {
        name: 'expiration',
        type: 'uint256',
      },
      {
        name: 'nonce',
        type: 'uint256',
      },
      {
        name: 'v',
        type: 'uint8',
      },
      {
        name: 'r',
        type: 'bytes32',
      },
      {
        name: 's',
        type: 'bytes32',
      },
    ],
    name: 'cancel',
    outputs: [],
    payable: false,
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'makerAddress',
        type: 'address',
      },
      {
        indexed: false,
        name: 'makerAmount',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'makerToken',
        type: 'address',
      },
      {
        indexed: false,
        name: 'takerAddress',
        type: 'address',
      },
      {
        indexed: false,
        name: 'takerAmount',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'takerToken',
        type: 'address',
      },
      {
        indexed: false,
        name: 'expiration',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'nonce',
        type: 'uint256',
      },
    ],
    name: 'Filled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'makerAddress',
        type: 'address',
      },
      {
        indexed: false,
        name: 'makerAmount',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'makerToken',
        type: 'address',
      },
      {
        indexed: false,
        name: 'takerAddress',
        type: 'address',
      },
      {
        indexed: false,
        name: 'takerAmount',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'takerToken',
        type: 'address',
      },
      {
        indexed: false,
        name: 'expiration',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'nonce',
        type: 'uint256',
      },
    ],
    name: 'Canceled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'code',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'makerAddress',
        type: 'address',
      },
      {
        indexed: false,
        name: 'makerAmount',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'makerToken',
        type: 'address',
      },
      {
        indexed: false,
        name: 'takerAddress',
        type: 'address',
      },
      {
        indexed: false,
        name: 'takerAmount',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'takerToken',
        type: 'address',
      },
      {
        indexed: false,
        name: 'expiration',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'nonce',
        type: 'uint256',
      },
    ],
    name: 'Failed',
    type: 'event',
  },
];

export default airswapExchange;
