const { ethers } = require("hardhat");

// Uniswap V3 pool ABI for accessing price and liquidity data
const UNI_V3_POOL_ABI = [
    "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    "function liquidity() external view returns (uint128)"
];

// Address of a specific Uniswap V3 pool (replace this with the pool you're interested in)
const UNI_V3_POOL_ADDRESS = "0xYourUniswapV3PoolAddressHere";

async function fetchUniswapV3Data() {
    const provider = ethers.provider;
    const poolContract = new ethers.Contract(UNI_V3_POOL_ADDRESS, UNI_V3_POOL_ABI, provider);

    try {
        // Fetching price and tick data
        const slot0 = await poolContract.slot0();
        const sqrtPriceX96 = slot0[0];  // Square root of the current price
        const tick = slot0[1];          // Current tick of the pool

        // Fetching liquidity
        const liquidity = await poolContract.liquidity();

        console.log("Sqrt Price X96:", sqrtPriceX96.toString());
        console.log("Current Tick:", tick);
        console.log("Liquidity:", liquidity.toString());
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
}

fetchUniswapV3Data().catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
});
