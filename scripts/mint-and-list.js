const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const PRICE = ethers.utils.parseEther("0.1");

const mintAndList = async () => {
    await deployments.fixture(["all"]);
    const nftMarketPlace = await ethers.getContract("NftMarketplace");
    const basicNft = await ethers.getContract("BasicNft");

    console.log("Minting.........");
    const mintTx = await basicNft.mintNft();
    const minTxReceipt = await mintTx.wait(1);
    const tokenId = minTxReceipt.events[0].args.tokenId;

    console.log("Approving Nft to be Listen on market place............");
    const approvalTx = await basicNft.approve(nftMarketPlace.address, tokenId);
    await approvalTx.wait(1);

    console.log("Listing Nft.......");
    const listingTx = await nftMarketPlace.listItem(basicNft.address, tokenId, PRICE);
    await listingTx.wait();
    console.log("Listed!");
    console.log(nftMarketPlace.address);

    // if (network.config.chainId.toString() === "31337") {
    //     await moveBlocks(2, (sleepAmount = 1000));
    // }
};

mintAndList()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
