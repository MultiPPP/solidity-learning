import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { DECIMALS, MINTING_AMOUNT } from "./constant";

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
      DECIMALS,
      MINTING_AMOUNT,
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
      expect(await myTokenC.decimals()).equal(DECIMALS);
    });
    // test totalSupply
    it("should return 1MT totalSupply", async () => {
      expect(await myTokenC.totalSupply()).equal(
        MINTING_AMOUNT * 10n ** DECIMALS
      );
    });
  });

  describe("Mint", () => {
    // test balanceOf // 1MT = 1 * 10^18
    it("should return 1MT balance for signer 0", async () => {
      const signer0 = signers[0];
      expect(await myTokenC.balanceOf(signer0)).equal(
        MINTING_AMOUNT * 10n ** DECIMALS // Big Number
      );
    });

    // TDD: Test Driven Development
    // // 테스트 코드를 먼저 개발하고, 테스트 코드가 통과가 되도록 실제 어플리케이션을 개발한다
    it("should return or revert when minting infinitely", async () => {
      const hacker = signers[2];
      const mintingAgainAmount = hre.ethers.parseUnits("10000", DECIMALS);
      await expect(
        // 권한이 없는 유저가 mint function 호출 시에는 transaction이 revert 되도록
        myTokenC.connect(hacker).mint(mintingAgainAmount, hacker.address)
      ).to.be.revertedWith("You are not authorized to manage this contract");
    });
  });

  describe("Transfer", () => {
    it("should have 0.5MT", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      await expect(
        myTokenC.transfer(
          hre.ethers.parseUnits("0.5", DECIMALS),
          signer1.address
        )
      )
        .to.emit(myTokenC, "Transfer")
        .withArgs(
          signer0.address,
          signer1.address,
          hre.ethers.parseUnits("0.5", DECIMALS)
        );
      // signer1로 0.5MT Token 전송
      expect(await myTokenC.balanceOf(signer1.address)).equal(
        hre.ethers.parseUnits("0.5", DECIMALS)
      );
    });
    it("should be reverted with insufficient balance error", async () => {
      const signer1 = signers[1];
      // exception을 확인하는 특수한 상황 -> await의 위치 중요!
      await expect(
        myTokenC.transfer(
          hre.ethers.parseUnits((MINTING_AMOUNT + 1n).toString(), DECIMALS),
          signer1.address
        )
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("TransferFrom", () => {
    it("should emit Approval event", async () => {
      const signer1 = signers[1];
      await expect(
        myTokenC.approve(signer1.address, hre.ethers.parseUnits("10", DECIMALS))
      )
        .to.emit(myTokenC, "Approval")
        .withArgs(signer1.address, hre.ethers.parseUnits("10", DECIMALS));
    });
    it("should be reverted with insufficient allowance error", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      await expect(
        myTokenC
          .connect(signer1)
          .transferFrom(
            signer0.address,
            signer1.address,
            hre.ethers.parseUnits("1", DECIMALS)
          )
      ).to.be.revertedWith("insufficient allowance");
    });
  });

  describe("Testcase", () => {
    it("should approve & transferFrom signer0 -> signer1", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];

      await expect(
        myTokenC
          .connect(signer0)
          .approve(signer1.address, hre.ethers.parseUnits("5", DECIMALS))
      )
        .to.emit(myTokenC, "Approval")
        .withArgs(signer1.address, hre.ethers.parseUnits("5", DECIMALS));

      await expect(
        myTokenC
          .connect(signer1)
          .transferFrom(
            signer0.address,
            signer1.address,
            hre.ethers.parseUnits("5", DECIMALS)
          )
      )
        .to.emit(myTokenC, "Transfer")
        .withArgs(
          signer0.address,
          signer1.address,
          hre.ethers.parseUnits("5", DECIMALS)
        );

      const balance0 = await myTokenC.balanceOf(signer0.address);
      const balance1 = await myTokenC.balanceOf(signer1.address);

      expect(balance0).to.equal(hre.ethers.parseUnits("95", DECIMALS));
      expect(balance1).to.equal(hre.ethers.parseUnits("5", DECIMALS));
    });
  });
});
