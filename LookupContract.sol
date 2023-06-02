// SPDX-License-Identifier: GPL-3.0
pragma solidity  >=0.7.0 <0.9.0;


// This contract implements the functionality of a phone directory
contract LookupContract {
    mapping(string => uint) public myDirectory;

    constructor(string memory _name, uint _phoneNum) {
        myDirectory[_name] = _phoneNum;
    }   

    function setPhoneNumber(string memory _name, uint _phoneNum) public {
        myDirectory[_name] = _phoneNum;
    }

    function getPhoneNumber(string memory _name) public view returns(uint){
        return myDirectory[_name];
    }
}

