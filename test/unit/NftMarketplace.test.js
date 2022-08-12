const { expect, assert } = require("chai");
const { network, deployments, getNamedAccounts, ethers } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");

!developmentChain.includes(network.name)
    ? describe.skip
    : describe("Nft marketplace", () => {
          let nftMarketPlace, deployer, player, basicNft;
          const tokenId = 0;
          const Price = ethers.utils.parseEther("0.1");
          beforeEach(async () => {
              //   deployer = (await getNamedAccounts()).deployer; //deployer address
              const accounts = await ethers.getSigners(); //object about the signer
              //   console.log(deployer);
              deployer = accounts[0];
              player = accounts[1];
              //   player = (await getNamedAccounts()).player;
              await deployments.fixture(["all"]);
              nftMarketPlace = await ethers.getContract("NftMarketplace");
              basicNft = await ethers.getContract("BasicNft");
              await basicNft.mintNft();
              await basicNft.approve(nftMarketPlace.address, tokenId);
          });
          describe("List Item", () => {
              it("emits an event after it has been successfully listed", async () => {
                  await expect(nftMarketPlace.listItem(basicNft.address, tokenId, Price)).to.emit(
                      nftMarketPlace,
                      "ItemListed"
                  );
              });
              it("revert when price is less than or equal to 0", async () => {
                  await expect(
                      nftMarketPlace.listItem(basicNft.address, tokenId, 0)
                  ).to.be.revertedWith("NftMarketplace__PriceMustBeAboveZero()");
              });
              it("successfully added to the listing storage", async () => {
                  const tx = await nftMarketPlace.listItem(basicNft.address, tokenId, Price);
                  const txreceipt = await tx.wait(1);
                  const listing = await nftMarketPlace.getListing(basicNft.address, 0);
                  assert.equal(listing.seller, deployer.address);
                  assert.equal(listing.price.toString(), Price);
              });
              it("Confirms if item has been already Listed", async () => {
                  await nftMarketPlace.listItem(basicNft.address, tokenId, Price);
                  //   await expect(
                  //       nftMarketPlace.listItem(basicNft.address, tokenId, Price)
                  //   ).to.be.revertedWith(
                  //       `'NftMarketplace__AlreadyListed("${basicNft.address}",${tokenId})'`
                  //   );
              });
              it("only appreved address can do transcations", async () => {
                  await basicNft.approve(ethers.constants.AddressZero, tokenId);
                  await expect(
                      nftMarketPlace.listItem(basicNft.address, tokenId, Price)
                  ).to.be.revertedWith("NftMarketplace__NotApprovedForMarketPlace()");
              });
              it("Only owner can list nft", async () => {
                  const nftAddressContractPlayer = await nftMarketPlace.connect(player);
                  await expect(
                      nftAddressContractPlayer.listItem(basicNft.address, tokenId, Price)
                  ).to.be.revertedWith("NftMarketplace__NotOwner()");
              });
          });

          describe("Buy Item", () => {
              let nftAddressContractPlayer;
              beforeEach(async () => {
                  const tx = await nftMarketPlace.listItem(basicNft.address, tokenId, Price);
                  await tx.wait(1);
                  nftAddressContractPlayer = await nftMarketPlace.connect(player);
              });
              it("emits itemBought event ", async () => {
                  await expect(
                      nftAddressContractPlayer.buyItem(basicNft.address, tokenId, { value: Price })
                  ).to.emit(nftMarketPlace, "ItemBought");
              });
              it("Revert if amount to but Nft is less tha listed price", async () => {
                  //   await expect(
                  //       nftMarketPlace.buyItem(basicNft.address, tokenId, { value: 0 })
                  //   ).to.be.revertedWith(
                  //       `"NftMarketplace__PriceNotMet("${basicNft.address}", ${tokenId}, ${Price})"`
                  //   );
              });
              it("Updates Sellers balance after purchase", async () => {
                  const SELLER = await basicNft.ownerOf(tokenId);
                  const tx = await nftAddressContractPlayer.buyItem(basicNft.address, tokenId, {
                      value: Price,
                  });
                  await tx.wait(1);
                  const amountSoldToSeller = await nftAddressContractPlayer.getProceeds(SELLER);
                  assert.equal(amountSoldToSeller.toString(), Price.toString());
              });
              it("Successfully deleted from listing", async () => {
                  const tx = await nftAddressContractPlayer.buyItem(basicNft.address, tokenId, {
                      value: Price,
                  });
                  await tx.wait(1);
                  const listing = await nftAddressContractPlayer.getListing(
                      basicNft.address,
                      tokenId
                  );
                  assert(listing);
              });
          });

          describe("Cancel Listing", () => {
              beforeEach(async () => {
                  const tx = await nftMarketPlace.listItem(basicNft.address, tokenId, Price);
                  await tx.wait(1);
              });
              it("Emit Item Cancelled event", async () => {
                  await expect(nftMarketPlace.cancelListing(basicNft.address, tokenId)).to.emit(
                      nftMarketPlace,
                      "ItemCanceled"
                  );
              });
              it("Deleted successfully from Listing", async () => {
                  const tx = await nftMarketPlace.cancelListing(basicNft.address, tokenId);
                  await tx.wait(1);
                  const listing = await nftMarketPlace.getListing(basicNft.address, tokenId);
                  assert(listing);
              });
              it("only owner can cancel Listing", async () => {
                  const nftAddressContractPlayer = await nftMarketPlace.connect(player);
                  await expect(
                      nftAddressContractPlayer.cancelListing(basicNft.address, tokenId)
                  ).to.be.revertedWith(`NftMarketplace__NotOwner()`);
              });
              it("Cancel only when it has already been listed", async () => {
                  //   await nftMarketPlace.cancelListing(basicNft.address, tokenId);
                  //   await expect(
                  //       nftMarketPlace.cancelListing(basicNft.address, tokenId)
                  //   ).to.be.revertedWith(
                  //       `'NftMarketplace__NotListed("${basicNft.address}",${tokenId})'`
                  //   );
              });
          });
          describe("Update Listing", () => {
              const NEW_PRICE = ethers.utils.parseEther("0.2");
              beforeEach(async () => {
                  const tx = await nftMarketPlace.listItem(basicNft.address, tokenId, NEW_PRICE);
                  await tx.wait(1);
              });
              it("Emits an event when updated", async () => {
                  await expect(
                      nftMarketPlace.updateListing(basicNft.address, tokenId, NEW_PRICE)
                  ).to.emit(nftMarketPlace, "ItemListed");
              });
              it("Successfully Updates the price of the item", async () => {
                  const priceUpdate = await nftMarketPlace.updateListing(
                      basicNft.address,
                      tokenId,
                      NEW_PRICE
                  );
                  await priceUpdate.wait(1);
                  const listing = await nftMarketPlace.getListing(
                      basicNft.address,
                      basicNft.address
                  );
                  assert(listing.price.toString(), NEW_PRICE);
              });
              it("only owner can update the price of an item", async () => {
                  //   await nftMarketPlace.updateListing(basicNft.address, tokenId,NEW_PRICE);
                  const nftAddressContractPlayer = await nftMarketPlace.connect(player);
                  await expect(
                      nftAddressContractPlayer.updateListing(basicNft.address, tokenId, NEW_PRICE)
                  ).to.be.revertedWith(`NftMarketplace__NotOwner()`);
              });
          });

          describe("WIthdraw Proceeds", () => {
              it("doesnt allow zero proceeds withdrawal", async () => {
                  await expect(nftMarketPlace.withdrawProceeds()).to.be.revertedWith(
                      "NftMarketplace__noProceeds()"
                  );
              });
              it("Withdraws proceeds", async () => {
                  const SELLER = await basicNft.ownerOf(tokenId);
                  const listTx = await nftMarketPlace.listItem(basicNft.address, tokenId, Price);
                  await listTx.wait(1);
                  const nftAddressContractPlayer = await nftMarketPlace.connect(player);
                  const butTx = await nftAddressContractPlayer.buyItem(basicNft.address, tokenId, {
                      value: Price,
                  });
                  await butTx.wait(1);
                  const deployerProceedsBefore = await nftMarketPlace.getProceeds(deployer.address);
                  const deployerBalanceBefore = await deployer.getBalance();
                  const withdrawTx = await nftMarketPlace.withdrawProceeds();
                  const transactionReceipt = await withdrawTx.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const sellerAmountInContract = await nftMarketPlace.getProceeds(SELLER);
                  const deployerBalanceAfter = await deployer.getBalance();
                  assert.equal(sellerAmountInContract, 0);
                  assert(
                      deployerBalanceAfter.add(gasCost).toString() ===
                          deployerProceedsBefore.add(deployerBalanceBefore).toString()
                  );
              });
          });
      });
