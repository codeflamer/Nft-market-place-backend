const { deployments, ethers } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const TOKEN_ID = 0;

const buy = async () => {
    await deployments.fixture(["all"]);
    const nftMarketPlace = await ethers.getContract("NftMarketplace");
    const basicNft = await ethers.getContract("BasicNft");
    const listing = await nftMarketPlace.getListing(basicNft, TOKEN_ID);
    const price = listing.price.toString();
    const tx = await nftMarketPlace.buyItem(basicNft.address, TOKEN_ID, { value: price });
    await tx.wait(1);
    console.log("NFT BOUGHT..");
    if (network.config.chainId.toString() === "31337") {
        await moveBlocks(2, (sleepAmount = 1000));
    }
};

buy()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
