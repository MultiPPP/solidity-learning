// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MultiManagedAccess {
    uint constant MANAGER_NUMBERS = 5; // constant라는 키워드로 상수값으로 만듦 -> 선언 시 반드시 초기화를 해주어야 함
    uint immutable BACKUP_MANAGER_NUMBERS; // 선언 시 초기화를 하고 싶지 않을 때 -> immutable, contract 배포 시 constructor에서 초기화

    address public owner;
    address[MANAGER_NUMBERS] public managers;
    // 한 명의 owner와 여러 명의 managers
    bool[MANAGER_NUMBERS] public confirmed;

    // manager0 --> confired0
    // manager1 --> confired1
    // ...

    constructor(
        address _owner,
        address[] memory _managers,
        uint _manager_numbers
    ) {
        require(_managers.length == _manager_numbers, "size unmatched");
        owner = _owner;
        BACKUP_MANAGER_NUMBERS = _manager_numbers;
        for (uint i = 0; i < _manager_numbers; i++) {
            managers[i] = _managers[i];
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized");
        _;
    }

    function allConfirmed() internal view returns (bool) {
        // 한 manager라도 false가 있다면 false를 return
        for (uint i = 0; i < MANAGER_NUMBERS; i++) {
            if (!confirmed[i]) {
                return false;
            }
        }
        return true;
    }

    function reset() internal {
        for (uint i = 0; i < MANAGER_NUMBERS; i++) {
            confirmed[i] = false;
        }
    }

    // 모든 매니저가 확인을 했는지?
    modifier onlyAllConfirmed() {
        require(allConfirmed(), "Not all managers confirmed yet");
        reset();
        _;
    }

    // manger가 실제 confirm
    function confirm() external {
        bool found = false;

        for (uint i = 0; i < MANAGER_NUMBERS; i++) {
            if (managers[i] == msg.sender) {
                found = true;
                confirmed[i] = true;
                break;
            }
        }
        require(found, "You are not one of managers");
    }
}
