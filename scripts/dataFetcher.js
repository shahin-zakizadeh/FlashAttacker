// Importing ethers from Hardhat to interact with the Ethereum blockchain
const { ethers } = require("hardhat");

// Importing Uniswap V3 pool ABI from the @uniswap/v3-core package
// This provides access to functions such as slot0 and liquidity.
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json").abi;

// Define the address of the specific Uniswap V3 pool we want to monitor
// Replace this with the actual Uniswap V3 pool address you are interested in
const UNI_V3_POOL_ADDRESS = "0xC6962004f452bE9203591991D15f6b388e09E8D0";

// Async function to fetch data from the Uniswap V3 pool
async function fetchUniswapV3Data() {
    // Get the default provider from ethers for blockchain access
    const provider = ethers.provider;

    // Instantiate the Uniswap V3 pool contract using the pool address and ABI
    const poolContract = new ethers.Contract(UNI_V3_POOL_ADDRESS, IUniswapV3PoolABI, provider);

    try {
        // Fetch liquidity and slot0 data from the Uniswap V3 pool
        // Using Promise.all to fetch both values simultaneously for efficiency
        const [liquidity, slot0] = await Promise.all([
            poolContract.liquidity(),    // Fetch total liquidity available in the pool
            poolContract.slot0()         // Fetch slot0 data, which includes the sqrtPriceX96 and tick
        ]);

        // Extracting the square root of the current price and tick from slot0
        const sqrtPriceX96 = slot0[0];
        const tick = slot0[1];

        // Logging the data for reference
        console.log("Liquidity:", liquidity.toString());          // Current liquidity in the pool
        console.log("Sqrt Price X96:", sqrtPriceX96.toString());  // Square root price, scaled to 96 bits
        console.log("Tick:", tick);                               // Current tick, useful for determining price range

    } catch (error) {
        // Log an error message if data fetching fails
        console.error("Failed to fetch data:", error);
    }
}

// Execute the data fetcher function and handle any script-level errors
fetchUniswapV3Data().catch((error) => {
    console.error("Script error:", error);
    process.exit(1);  // Exit with a non-zero code to indicate an error occurred
});
