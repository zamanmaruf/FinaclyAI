import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { env } from '../env';

const basePath = (() => {
  const e = (env.PLAID_ENV || 'sandbox').toLowerCase();
  switch (e) {
    case 'sandbox': return PlaidEnvironments.sandbox;
    case 'development': return PlaidEnvironments.development;
    case 'production': return PlaidEnvironments.production;
    default: return PlaidEnvironments.sandbox;
  }
})();

const configuration = new Configuration({
  basePath,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': env.PLAID_CLIENT_ID,
      'PLAID-SECRET': env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);