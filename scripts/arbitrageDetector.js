const { ethers } = require("hardhat");
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json").abi;

// Define pool addresses for Uniswap and SushiSwap
const UNI_V3_POOL_ADDRESS = "0xC6962004f452bE9203591991D15f6b388e09E8D0";
const SUSHI_V3_POOL_ADDRESS = "0xf3eb87c1f6020982173c908e7eb31aa66c1f0296";

// Use Uniswap V3 ABI for both pools, as SushiSwap V3 is compatible with it
const SUSHI_V3_POOL_ABI = IUniswapV3PoolABI;

// Set configurable parameters
const ARBITRAGE_THRESHOLD = 0.005; // Lowered threshold to 0.5%
const MONITOR_INTERVAL = 10000; // 0.1 minute interval for automated monitoring
const GAS_LIMIT_ESTIMATE = 200000; // Estimated gas limit for the transaction

// Function to fetch and scale price with corrected BigNumber handling
async function fetchPriceFromSqrt(poolAddress, abi) {
    const provider = ethers.provider;
    const poolContract = new ethers.Contract(poolAddress, abi, provider);

    const DECIMALS_ADJUSTMENT = ethers.BigNumber.from("1000000000000000000");

    try {
        const slot0 = await poolContract.slot0();
        const sqrtPriceX96 = ethers.BigNumber.from(slot0[0]);
        const price = sqrtPriceX96
            .mul(sqrtPriceX96)
            .mul(DECIMALS_ADJUSTMENT)
            .div(ethers.BigNumber.from(2).pow(192));
        return price;
    } catch (error) {
        console.error("Error fetching price:", error);
        throw error;
    }
}

// Function to fetch prices from Uniswap and SushiSwap pools
async function fetchPrices() {
    const uniPrice = await fetchPriceFromSqrt(UNI_V3_POOL_ADDRESS, IUniswapV3PoolABI);
    const sushiPrice = await fetchPriceFromSqrt(SUSHI_V3_POOL_ADDRESS, SUSHI_V3_POOL_ABI);
    return { uniPrice, sushiPrice };
}

// Function to dynamically calculate gas costs based on current gas prices
async function calculateGasCost() {
    const provider = ethers.provider;
    const gasPrice = await provider.getGasPrice(); // Fetch current gas price
    const gasCost = gasPrice.mul(GAS_LIMIT_ESTIMATE); // Calculate gas cost based on estimated gas limit
    console.log("Current gas cost in wei:", gasCost.toString());
    return gasCost;
}

// Main function to detect arbitrage opportunities by comparing prices
async function detectArbitrage() {
    try {
        const { uniPrice, sushiPrice } = await fetchPrices();
        const gasCost = await calculateGasCost(); // Get dynamic gas cost

        console.log("Uniswap Price:", uniPrice.toString());
        console.log("SushiSwap Price:", sushiPrice.toString());

        const priceDifferenceUS = uniPrice.sub(sushiPrice).abs();
        const threshold = uniPrice.mul(ethers.utils.parseUnits(ARBITRAGE_THRESHOLD.toString(), 18)).div(100);

        // Check if the opportunity exists after accounting for estimated transaction costs
        if (priceDifferenceUS.gt(threshold.add(gasCost))) {
            console.log("Arbitrage opportunity detected between Uniswap and SushiSwap!");
            console.log(`Price difference: ${priceDifferenceUS.toString()}`);
        } else {
            console.log("No significant arbitrage opportunity found.");
        }

    } catch (error) {
        console.error("Error in detecting arbitrage:", error);
    }
}

// Function to automate monitoring at regular intervals
async function startMonitoring() {
    while (true) {
        await detectArbitrage();
        console.log("Waiting for the next cycle...");
        await new Promise(resolve => setTimeout(resolve, MONITOR_INTERVAL)); // Pause for interval
    }
}

// Start the automated monitoring process
startMonitoring().catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
});
