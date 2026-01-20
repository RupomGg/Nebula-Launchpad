const hre = require("hardhat");

async function main() {
  const txHash = "0x53c43908f3476c03bc74bf5908545a32774ac160cfc5d8c5cab94ecf3a34bcd0";
  const provider = hre.ethers.provider;

  console.log(`Checking transaction: ${txHash}`);

  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      console.log("Transaction not found.");
      return;
    }

    console.log("Transaction found!");
    console.log(`To: ${tx.to}`);
    console.log(`From: ${tx.from}`);

    const receipt = await provider.getTransactionReceipt(txHash);
    console.log(`Status: ${receipt.status === 1 ? "Success" : "Failed"}`);
    console.log(`Block Number: ${receipt.blockNumber}`);

    const factoryAddress = "0xE7F8efC835672c7922075c329e431Bf0DD0Eb4E8";
    console.log(`Target Factory Address: ${factoryAddress}`);

    if (tx.to && tx.to.toLowerCase() === factoryAddress.toLowerCase()) {
      console.log("MATCH: Transaction was sent to the new Factory contract.");
    } else {
      console.log("MISMATCH: Transaction was NOT sent to the new Factory contract.");
      console.log(`It was sent to: ${tx.to}`);
    }

    // Check for TokenLaunched logs
    const iface = new hre.ethers.Interface([
      "event TokenLaunched(address indexed token, address indexed vendor, string name, string symbol, string metadataURI, address creator)"
    ]);

    console.log("\nParsing Logs:");
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === factoryAddress.toLowerCase()) {
         try {
           const parsedLog = iface.parseLog(log);
           if (parsedLog.name === "TokenLaunched") {
             console.log("  Event: TokenLaunched");
             console.log(`    Token Address: ${parsedLog.args.token}`);
             console.log(`    Vendor Address: ${parsedLog.args.vendor}`);
             console.log(`    Name: ${parsedLog.args.name}`);
             console.log(`    Symbol: ${parsedLog.args.symbol}`);
             console.log(`    Creator: ${parsedLog.args.creator}`);
           }
         } catch (e) {
           console.log("  Log from Factory, but could not parse as TokenLaunched.");
         }
      }
    }

  } catch (error) {
    console.error("Error checking transaction:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
