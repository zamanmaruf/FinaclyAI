const { PlaidApi, Configuration, PlaidEnvironments } = require('plaid');
require('dotenv').config({ path: '.env.local' });

async function createSandboxToken() {
  try {
    const configuration = new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });

    const client = new PlaidApi(configuration);

    // Create a sandbox public token
    const response = await client.sandboxPublicTokenCreate({
      institution_id: 'ins_109508',
      initial_products: ['transactions'],
    });

    console.log('Public token created:', response.data.public_token);

    // Exchange public token for access token
    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token: response.data.public_token,
    });

    console.log('Access token:', exchangeResponse.data.access_token);
    console.log('Item ID:', exchangeResponse.data.item_id);

    return {
      access_token: exchangeResponse.data.access_token,
      item_id: exchangeResponse.data.item_id,
      public_token: response.data.public_token
    };

  } catch (error) {
    console.error('Error creating Plaid token:', error);
    throw error;
  }
}

createSandboxToken()
  .then(result => {
    console.log('\n✅ Successfully created new Plaid credentials:');
    console.log('Access Token:', result.access_token);
    console.log('Item ID:', result.item_id);
    console.log('\nYou can now use this access token in your application.');
  })
  .catch(error => {
    console.error('Failed to create Plaid token:', error);
    process.exit(1);
  });
