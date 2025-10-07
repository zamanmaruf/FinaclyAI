import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { env } from '@/env';

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': env.PLAID_CLIENT_ID,
      'PLAID-SECRET': env.PLAID_SECRET,
      'PLAID-VERSION': '2020-09-14',
    },
  },
});

export const plaidClient = new PlaidApi(configuration);
