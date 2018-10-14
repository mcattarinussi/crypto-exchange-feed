async function main() {
  while(true) {
    console.log(`Polling Alpha Vantage cryptocurrency apis for ${process.env.CRYPTO_CURRENCY_SYMBOL}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

['SIGTERM', 'SIGINT'].map(sig => process.on(sig, process.exit));

main();
