const hre = require("hardhat");

async function main() {
    const { ethers } = hre;
    const [deployer] = await ethers.getSigners();

    console.log("Deployer address:", deployer.address);
    console.log("Network:", await deployer.provider.getNetwork());
    console.log("ETH balance:", ethers.utils.formatEther(await deployer.getBalance()));
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
