// staking
// deposit(MyToken) / withdraw(Mytoken)

// MyToken: token balance management
// - the balance of Tinybank address
// TinyBank: deposit / withdraw
// - users token management
// - user --> deposit --> TinyBank --> transfer(user --> TinyBank)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// TinyBank와 MyToken 사이의 통신을 위한 interface 정의
interface IMyToken {
    function transfer(uint256 amount, address to) external;

    function transferFrom(address from, address to, uint256 amount) external;
}

contract TinyBank {
    event Staked(address, uint256);

    IMyToken public stakingToken;
    mapping(address => uint256) public staked;
    uint256 public totalStaked;

    constructor(IMyToken _stakingToken) {
        stakingToken = _stakingToken;
    }

    function stake(uint256 _amount) external {
        require(_amount >= 0, "cannot stake 0 amount");
        stakingToken.transferFrom(msg.sender, address(this), _amount); // this는 현재 contract를 의미(TinyBank)
        staked[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }
}
