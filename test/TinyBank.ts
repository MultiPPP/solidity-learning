import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TinyBank", () => {
  let signers: HardhatEthersSigner[];
  let myTokenC: MyToken;
  let TinyBankC: TinyBank;
  beforeEach(async () => {
    signers = await hre.ethers.getSigners();
    // MyToken과 달리 TinyBank contract는 parameter로 MyToken contract의 address를 받음
    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      DECIMALS,
      MINTING_AMOUNT,
    ]);
    TinyBankC = await hre.ethers.deployContract("TinyBank", [
      await myTokenC.getAddress(),
    ]);
  });

  describe("Initialized state check", () => {
    it("should return totalStaked 0", async () => {
      expect(await TinyBankC.totalStaked()).equal(0);
    });
    it("should return staked 0 amount of signer0", async () => {
      const signer0 = signers[0];
      expect(await TinyBankC.staked(signer0.address)).equal(0);
    });
  });

  describe("Staking", () => {
    it("should return staked amount", async () => {
      // 스테이킹을 하고 나면 그 양을 제대로 return하는지
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await TinyBankC.getAddress(), stakingAmount); // approve를 받고 나서
      await TinyBankC.stake(stakingAmount); // stake를 호출 가능
      expect(await TinyBankC.staked(signer0.address)).equal(stakingAmount);
      expect(await TinyBankC.totalStaked()).equal(stakingAmount);
      expect(await myTokenC.balanceOf(TinyBankC)).equal(
        await TinyBankC.totalStaked()
      );
    });
  });

  describe("Withdraw", () => {
    it("should return 0 staked after withdrawing total token", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await TinyBankC.getAddress(), stakingAmount); // approve를 받고 나서
      await TinyBankC.stake(stakingAmount);
      await TinyBankC.withdraw(stakingAmount);
      expect(await TinyBankC.staked(signer0.address)).equal(0);
    });
  });
});
