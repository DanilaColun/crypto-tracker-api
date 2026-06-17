export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Crypto Tracker API',
    version: '1.0.0',
    description: 'A REST API to track currencies, addresses, prices and blockchain data.',
  },
  servers: [
    {
      url: '/',
      description: 'This server',
    },
  ],
  tags: [
    { name: 'Status', description: 'Health check' },
    { name: 'Currencies', description: 'Tracked currencies' },
    { name: 'Addresses', description: 'Tracked addresses' },
    { name: 'Prices', description: 'Current prices and price history' },
    { name: 'Blockchain', description: 'Block height and address balance' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Use the API token from your .env file.',
      },
    },
    schemas: {
      Currency: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Bitcoin' },
          ticker: { type: 'string', example: 'BTC' },
        },
      },
      CurrencyInput: {
        type: 'object',
        required: ['name', 'ticker'],
        properties: {
          name: { type: 'string', example: 'Bitcoin' },
          ticker: { type: 'string', example: 'BTC' },
        },
      },
      Address: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          chain: { type: 'string', example: 'BTC' },
          address: { type: 'string', example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
        },
      },
      AddressInput: {
        type: 'object',
        required: ['chain', 'address'],
        properties: {
          chain: { type: 'string', enum: ['BTC', 'ETH'], example: 'BTC' },
          address: { type: 'string', example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
        },
      },
      Price: {
        type: 'object',
        properties: {
          symbol: { type: 'string', example: 'BTCUSDT' },
          price: { type: 'string', example: '65000.00000000' },
        },
      },
      PriceList: {
        type: 'object',
        properties: {
          currency: { type: 'string', example: 'BTC' },
          prices: {
            type: 'array',
            items: { $ref: '#/components/schemas/Price' },
          },
        },
      },
      PriceHistoryEntry: {
        type: 'object',
        properties: {
          symbol: { type: 'string', example: 'BTCUSDT' },
          price: { type: 'string', example: '65000.00000000' },
          recordedAt: { type: 'string', format: 'date-time', example: '2026-06-17T09:20:00.000Z' },
        },
      },
      PriceHistory: {
        type: 'object',
        properties: {
          currency: { type: 'string', example: 'BTC' },
          history: {
            type: 'array',
            items: { $ref: '#/components/schemas/PriceHistoryEntry' },
          },
        },
      },
      BlockchainHeight: {
        type: 'object',
        properties: {
          chain: { type: 'string', example: 'BTC' },
          height: { type: 'integer', example: 840000 },
        },
      },
      AddressBalance: {
        type: 'object',
        properties: {
          chain: { type: 'string', example: 'BTC' },
          address: { type: 'string', example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
          balance: { type: 'string', example: '5721254457' },
          unit: { type: 'string', example: 'satoshi' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Address not found' },
          requestId: { type: 'string', example: '6c6f935e-b56c-47d0-85ee-e5b6ecc84359' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Invalid address data' },
          requestId: { type: 'string', example: '6c6f935e-b56c-47d0-85ee-e5b6ecc84359' },
          details: {
            type: 'array',
            items: { type: 'string' },
            example: ['Chain must be BTC or ETH'],
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Invalid input.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ValidationError' },
          },
        },
      },
      Forbidden: {
        description: 'Missing or wrong API token.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Not found.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Conflict: {
        description: 'Already exists.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/status': {
      get: {
        tags: ['Status'],
        summary: 'Check that the API is running.',
        security: [],
        responses: {
          '200': {
            description: 'The API is running.',
            content: {
              'text/plain': {
                schema: { type: 'string', example: 'ok' },
              },
            },
          },
        },
      },
    },
    '/api/currencies': {
      get: {
        tags: ['Currencies'],
        summary: 'Get all tracked currencies.',
        responses: {
          '200': {
            description: 'List of currencies.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Currency' },
                },
              },
            },
          },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Currencies'],
        summary: 'Add a new currency to track.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CurrencyInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Currency created.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Currency' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '409': { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/api/currencies/{ticker}': {
      parameters: [
        {
          name: 'ticker',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          example: 'BTC',
        },
      ],
      get: {
        tags: ['Currencies'],
        summary: 'Get one currency by ticker.',
        responses: {
          '200': {
            description: 'The currency.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Currency' },
              },
            },
          },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Currencies'],
        summary: 'Update a currency.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CurrencyInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Currency updated.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Currency' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Currencies'],
        summary: 'Stop tracking a currency.',
        responses: {
          '204': { description: 'Currency deleted.' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/addresses': {
      get: {
        tags: ['Addresses'],
        summary: 'Get all tracked addresses.',
        responses: {
          '200': {
            description: 'List of addresses.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Address' },
                },
              },
            },
          },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Addresses'],
        summary: 'Add a new address to track.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddressInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Address created.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Address' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '409': { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/api/addresses/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          example: 1,
        },
      ],
      get: {
        tags: ['Addresses'],
        summary: 'Get one address by id.',
        responses: {
          '200': {
            description: 'The address.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Address' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Addresses'],
        summary: 'Update an address.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddressInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Address updated.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Address' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Addresses'],
        summary: 'Stop tracking an address.',
        responses: {
          '204': { description: 'Address deleted.' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/price': {
      get: {
        tags: ['Prices'],
        summary: 'Get current prices for a currency.',
        parameters: [
          {
            name: 'currency',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            example: 'BTC',
          },
        ],
        responses: {
          '200': {
            description: 'Current prices.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PriceList' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/price/history': {
      get: {
        tags: ['Prices'],
        summary: 'Get saved price history for a currency.',
        parameters: [
          {
            name: 'currency',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            example: 'BTC',
          },
          {
            name: 'symbol',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            example: 'BTCUSDT',
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            example: 10,
          },
        ],
        responses: {
          '200': {
            description: 'Price history, newest first.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PriceHistory' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/blockchain/height': {
      get: {
        tags: ['Blockchain'],
        summary: 'Get the current block height of a chain.',
        parameters: [
          {
            name: 'chain',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['BTC', 'ETH'] },
            example: 'BTC',
          },
        ],
        responses: {
          '200': {
            description: 'The block height.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BlockchainHeight' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '502': {
            description: 'The blockchain node is not available.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/blockchain/balance': {
      get: {
        tags: ['Blockchain'],
        summary: 'Get the balance of an address on a chain.',
        parameters: [
          {
            name: 'chain',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['BTC', 'ETH'] },
            example: 'BTC',
          },
          {
            name: 'address',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          },
        ],
        responses: {
          '200': {
            description: 'The address balance.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AddressBalance' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '502': {
            description: 'The blockchain node is not available.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
};
