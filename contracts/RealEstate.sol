//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// OpenZeppelin is an open-source library of battle-tested smart contracts written in Solidity.

// It gives you ready-made, audited building blocks instead of you reinventing the wheel.

contract RealEstate is ERC721URIStorage { //inherits from 721uri storage
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; //keeps track of how many tokens have been minted

    constructor() ERC721("Real Estate", "REAL") {} ///runs once and sets nft name and symbol

    function mint(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();  //increment token id 

        uint256 newItemId = _tokenIds.current();  // the nft has the current token id here   
        _mint(msg.sender, newItemId);     
        _setTokenURI(newItemId, tokenURI);  //we are setting the metadata of the token here

        return newItemId;
    }

    function totalSupply() public view returns (uint256) {  //tells us the total supply of nft tokens here 
        return _tokenIds.current();
    }
}