const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy SimpleToken Implementation
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const simpleTokenRaw = await SimpleToken.deploy();
  await simpleTokenRaw.waitForDeployment();
  const simpleTokenAddress = await simpleTokenRaw.getAddress();
  
  console.log("SimpleToken Implementation deployed to:", simpleTokenAddress);

  // 2. Deploy LaunchpadFactory
  // Constructor(implementation, feeReceiver)
  // For Fee Receiver, using Deployer for now (Platform Owner)
  const LaunchpadFactory = await hre.ethers.getContractFactory("LaunchpadFactory");
  const factory = await LaunchpadFactory.deploy(simpleTokenAddress, deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("LaunchpadFactory deployed to:", factoryAddress);
  
  console.log("\n--- Frontend Config ---");
  console.log(`VITE_FACTORY_ADDRESS=${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
