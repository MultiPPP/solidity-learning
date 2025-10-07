import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const mintingAmount = 100n;
const decimals = 18n;

describe("myTokenDeploy", () => {
  let myTokenC: MyToken;
  //myTokenC의 type 지정 안된 경우 ':MyToken'을 통해 type을 지정해줄 수 있다.
  let signers: HardhatEthersSigner[];

  // beforeEach -> 하위의 test들을 실행할 때마다 한 번 씩 실행시켜줘
  beforeEach("should deploy", async () => {
    signers = await hre.ethers.getSigners();
    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      18,
      100,
    ]);
  });
  describe("Basic state value check", () => {
    it("should return name", async () => {
      expect(await myTokenC.name()).equal("MyToken");
    });
    it("should return symbol", async () => {
      expect(await myTokenC.symbol()).equal("MT");
    });
    it("should return decimals", async () => {
      expect(await myTokenC.decimals()).equal(decimals);
    });
    // test totalSupply
    it("should return 1MT totalSupply", async () => {
      expect(await myTokenC.totalSupply()).equal(
        mintingAmount * 10n ** decimals
      );
    });
  });

  describe("Mint", () => {
    // test balanceOf // 1MT = 1 * 10^18
    it("should return 1MT balance for signer 0", async () => {
      const signer0 = signers[0];
      expect(await myTokenC.balanceOf(signer0)).equal(
        mintingAmount * 10n ** decimals
      ); // Big Number
    });
  });
  describe("Transfer", () => {
    it("should have 0.5MT", async () => {
      const signer1 = signers[1];
      await myTokenC.transfer(
        hre.ethers.parseUnits("0.5", decimals),
        signer1.address
      );
      // signer1로 0.5MT Token 전송
      expect(await myTokenC.balanceOf(signer1.address)).equal(
        hre.ethers.parseUnits("0.5", decimals)
      );
    });
    it("should be reverted with insufficient balance error", async () => {
      const signer1 = signers[1];
      // exception을 확인하는 특수한 상황 -> await의 위치 중요!
      await expect(
        myTokenC.transfer(
          hre.ethers.parseUnits((mintingAmount + 1n).toString(), decimals),
          signer1.address
        )
      ).to.be.revertedWith("Insufficient balance");
    });
  });
});
