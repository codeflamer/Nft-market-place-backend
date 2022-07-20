const { network, getNamedAccounts, deployments } = require("hardhat");
const { developmentChain } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async () => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;

    const args = [];

    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChain.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying----------------------------");
        await verify(basicNft.address, args);
    }
};

module.exports.tags = ["all", "basicnft"];
