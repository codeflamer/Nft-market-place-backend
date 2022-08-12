const { deployments, ethers } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const TOKEN_ID = 0;

const cancel = async () => {
    await deployments.fixture(["all"]);
    const nftMarketPlace = await ethers.getContract("NftMarketplace");
    const basicNft = await ethers.getContract("BasicNft");
    const tx = await nftMarketPlace.cancelListing(basicNft.address, TOKEN_ID);
    await tx.wait(1);
    console.log("NFT CANCELLED..");
    if (network.config.chainId.toString() === "31337") {
        await moveBlocks(2, (sleepAmount = 1000));
    }
};

cancel()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
