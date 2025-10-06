/* eslint-disable */
console.log(`
Use Stripe CLI to simulate events:

1) Start webhook forwarding:
   npm run stripe:listen

2) Create a test PaymentIntent + charge:
   stripe trigger payment_intent.succeeded

3) Create a test payout (test mode):
   stripe trigger payout.paid

Then run:
   npm run stripe:sync
`);
