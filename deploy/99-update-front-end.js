const { ethers, network } = require("hardhat");
const fs = require("fs");

const frontEndContractsfile = "../nextjs-nft-marketplace-moralis/constants/networkMapping.json";
const frontEndAbiLocation = "../nextjs-nft-marketplace-moralis/constants/";

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("updating front end");
        await updateContractAdddresses();
        await updateAbi();
    }
};

const updateAbi = async () => {
    const nftMarketPlace = await ethers.getContract("NftMarketplace");
    fs.writeFileSync(
        `${frontEndAbiLocation}nftMarketPlace.json`,
        nftMarketPlace.interface.format(ethers.utils.FormatTypes.json)
    );
    const basicNft = await ethers.getContract("BasicNft");
    fs.writeFileSync(
        `${frontEndAbiLocation}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    );
};

const updateContractAdddresses = async () => {
    const nftMarketPlace = await ethers.getContract("NftMarketplace");
    console.log(nftMarketPlace.address);
    const chainId = network.config.chainId?.toString();
    // console.log("ChainID", network.config);
    const contractAddresses = JSON.parse(
        fs.readFileSync(frontEndContractsfile, { encoding: "utf-8" })
    );
    console.log(contractAddresses);
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketPlace.address)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketPlace.address);
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketPlace.address] };
    }
    fs.writeFileSync(frontEndContractsfile, JSON.stringify(contractAddresses));
    console.log(JSON.stringify(contractAddresses));
};

module.exports.tags = ["all", "frontend"];

// module.exports = {};

// module.exports.tags = ["all", "frontend"];
