// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserRegistry {
    mapping(address => string) public displayNames;
    
    event NameUpdated(address indexed user, string newName);

    function setUserName(string memory _name) external {
        displayNames[msg.sender] = _name;
        emit NameUpdated(msg.sender, _name);
    }

    function getName(address _user) external view returns (string memory) {
        return displayNames[_user];
    }
}
