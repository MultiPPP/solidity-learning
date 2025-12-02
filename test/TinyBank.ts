import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TinyBank", () => {
  let signers: HardhatEthersSigner[];
  let myTokenC: MyToken;
  let TinyBankC: TinyBank;

  // MultiManagedAccess 적용을 위한 추가 변수
  const MANAGER_NUMBERS = 5;
  let owner: HardhatEthersSigner;
  let managers: HardhatEthersSigner[] = [];
  let hacker: HardhatEthersSigner;

  beforeEach(async () => {
    signers = await hre.ethers.getSigners();

    owner = signers[0];
    for (let i = 0; i < MANAGER_NUMBERS; i++) {
      managers[i] = signers[i + 1];
    }
    hacker = signers[MANAGER_NUMBERS + 1];

    // MyToken과 달리 TinyBank contract는 parameter로 MyToken contract의 address를 받음
    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      DECIMALS,
      MINTING_AMOUNT,
    ]);

    // 주소 배열 생성
    const managerAddress: string[] = [];
    for (let i = 0; i < MANAGER_NUMBERS; i++) {
      managerAddress[i] = managers[i].address;
    }

    TinyBankC = await hre.ethers.deployContract("TinyBank", [
      await myTokenC.getAddress(),
      // owner.address,
      // managerAddress,
      // MANAGER_NUMBERS,
    ]);
    await myTokenC.setManager(TinyBankC.getAddress());
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
      await expect(TinyBankC.stake(stakingAmount))
        .to.emit(TinyBankC, "Staked")
        .withArgs(signer0.address, stakingAmount); // stake를 호출 가능
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
      await expect(TinyBankC.withdraw(stakingAmount))
        .to.emit(TinyBankC, "Withdraw")
        .withArgs(stakingAmount, signer0.address);
      expect(await TinyBankC.staked(signer0.address)).equal(0);
    });
  });

  describe("reward", () => {
    it("should reward 1MT every blocks", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await TinyBankC.getAddress(), stakingAmount);
      await TinyBankC.stake(stakingAmount);

      // 5개의 block동안 reward 받고, block number 증가, withdraw할 때 block number 1 더 증가
      // 5n, 1n: Big Number
      const BLOCKS = 5n;
      const transferAmount = hre.ethers.parseUnits("1", DECIMALS);
      for (var i = 0; i < BLOCKS; i++) {
        await myTokenC.transfer(transferAmount, signer0.address);
      }

      await TinyBankC.withdraw(stakingAmount);
      expect(await myTokenC.balanceOf(signer0.address)).equal(
        hre.ethers.parseUnits((BLOCKS + MINTING_AMOUNT + 1n).toString())
      );
    });

    it("should revert when changing rewardPerBlock by hacker", async () => {
      // 권한 없는 사람에 의해 rewardPerBlock값이 변경될 때 revert를 해야 한다.
      const hacker = signers[3];
      const rewardToChange = hre.ethers.parseUnits("10000", DECIMALS);
      await expect(
        TinyBankC.connect(hacker).setRewardPerBlock(rewardToChange)
      ).to.be.revertedWith("You are not authorized to manage this contract");
    });
  });

  // describe("multi manager assignment", () => {
  //   const new_reward = hre.ethers.parseUnits("5", DECIMALS);
  //   // Non-Manager
  //   it("should revert confirm by non-manager", async () => {
  //     await expect(TinyBankC.connect(hacker).confirm()).to.be.revertedWith(
  //       "You are not a manager"
  //     );
  //   });

  //   // 모두 동의하지 않은 경우
  //   it("should revert when not all managers confirm", async () => {
  //     for (let i = 0; i < MANAGER_NUMBERS - 1; i++) {
  //       await TinyBankC.connect(managers[i]).confirm();
  //     }
  //     await expect(
  //       TinyBankC.connect(owner).setRewardPerBlock(new_reward)
  //     ).to.be.revertedWith("Not all confirmed yet");
  //   });
  // });
});
