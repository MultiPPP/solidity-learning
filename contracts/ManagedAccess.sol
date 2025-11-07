// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// abstract는 왜 붙었을까?
// -> ManagedAccess를 실제적으로 배포하여 쓸 일이 없다는 것을 의미
// 네트워크에 배포하는 것이 아닌, 상속을 받아서 사용하겠다.
abstract contract ManagedAccess {
    address public owner;
    address public manager;

    constructor(address _owner, address _manager) {
        owner = _owner;
        manager = _manager;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized");
        _;
    }

    modifier onlyManager() {
        require(
            msg.sender == manager,
            "You are not authorized to manage this token"
        );
        _;
    }
}
