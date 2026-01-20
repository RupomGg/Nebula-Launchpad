const hre = require("hardhat");

const FACTORY_ADDRESS = "0x55bf0507ff847f4f38Fe18EcAf6Ee1ADcC012a9c"; // Your deployed address

async function main() {
  const LaunchpadFactory = await hre.ethers.getContractFactory("LaunchpadFactory");
  const factory = LaunchpadFactory.attach(FACTORY_ADDRESS);

  console.log("Fetching events from:", FACTORY_ADDRESS);

  const events = await factory.queryFilter("TokenLaunched");
  console.log(`Found ${events.length} events.`);

  events.forEach((event, i) => {
    console.log(`\nEvent ${i + 1}:`);
    console.log("  Token:", event.args[0]); // token
    console.log("  Name:", event.args[2]); // name
    console.log("  Symbol:", event.args[3]); // symbol
    console.log("  Metadata:", event.args[4]); // metadataURI
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
