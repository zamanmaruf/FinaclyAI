-- Create exchange_rates table for caching FX data
CREATE TABLE IF NOT EXISTS exchange_rates (
  id SERIAL PRIMARY KEY,
  currency_pair VARCHAR(10) NOT NULL UNIQUE,
  rate DECIMAL(10, 6) NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_pair ON exchange_rates(currency_pair);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_cached_at ON exchange_rates(cached_at);

-- Add comment
COMMENT ON TABLE exchange_rates IS 'Cached exchange rates from external API to minimize API calls';
COMMENT ON COLUMN exchange_rates.currency_pair IS 'Currency pair in format FROM_TO (e.g., USD_CAD)';
COMMENT ON COLUMN exchange_rates.rate IS 'Exchange rate from FROM to TO currency';
COMMENT ON COLUMN exchange_rates.cached_at IS 'When this rate was cached (used for expiration)';
