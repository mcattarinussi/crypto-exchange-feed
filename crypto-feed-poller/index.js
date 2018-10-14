const fetch = require('node-fetch');

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co';
const POLL_INTERVAL_SECONDS = process.env.POLL_INTERVAL_SECONDS || 30;

const fetchCurrencyExchangeRate = async currencySymbol => {
  const resp = await fetch(`${ALPHA_VANTAGE_BASE_URL}/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${currencySymbol}&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
  const data = await resp.json();
  return data['Realtime Currency Exchange Rate'];
}

async function main() {
  while(true) {
    try {
      const data = await fetchCurrencyExchangeRate(process.env.CRYPTO_CURRENCY_SYMBOL);
      console.log(`Exchange rate at ${data['6. Last Refreshed']}: 1 ${data['2. From_Currency Name']} => ${data['5. Exchange Rate']} ${data['4. To_Currency Name']}`);
    } catch(err) {
      console.log('Error fetching from Alpha Vantage api', err);
    }
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_SECONDS * 1000));
  }
}

['SIGTERM', 'SIGINT'].map(sig => process.on(sig, process.exit));

main();
