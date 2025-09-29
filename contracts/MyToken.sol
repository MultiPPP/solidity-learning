// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// 객체지향에서 class의 역할이 solidity에서는 contract
contract MyToken {
    string public name;
    string public symbol; // 심볼
    uint8 public decimals; // 1 ETH --> 1*10^18 wei, 1 wei --> 1*10^-18
    // uint8 --> 8bit unsigned int, uint16, ..., uint256

    // myToken이 몇 개가 발행되어 있는가?
    uint256 public totalSupply;
    // 누가 몇 개의 토큰을 가지고 있는가?
    mapping(address => uint256) public balanceOf;

    // 생성자 // contract 이름과 헷갈리지 않도록 "_"를 붙여 준다.
    // 문자열을 받을 때, type 뒤에 memory를 이용해야 한다.
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    // // 호출하는 함수
    // function totalSupply() external view returns (uint256) {
    //     return totalSupply;
    // }

    // // mapping 함수
    // function balanceOf(address owner) external view returns (uint256) {
    //     return balanceOf[owner];
    // }

    // // string은 길이가 정해져 있지 않기 때문에 memory 키워드를 반드시 사용해야 한다.
    // function name() external view returns(string memory) {
    //     return name;
    // }
}
