const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const PRICE = ethers.utils.parseEther("0.1");

const mint = async () => {
    await deployments.fixture(["all"]);
    const basicNft = await ethers.getContract("BasicNft");
    console.log("Minting.........");
    const mintTx = await basicNft.mintNft();
    const minTxReceipt = await mintTx.wait(1);
    const tokenId = minTxReceipt.events[0].args.tokenId;
    console.log(`Got TokenID: ${tokenId}`);
    console.log(`NFT ADDRESS: ${basicNft.address}`);
};

mint()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
