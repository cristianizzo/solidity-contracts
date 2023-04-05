//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RobotNFT is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;

    string public metadataURI; //https://ipfs.io/x423874092387409238409/1
    string public baseExtension = ".json";
    uint256 public maxSupply = 6; // max supply
    uint256 public maxMintAmountReq = 6; // max mint amount per request

    constructor(string memory _name, string memory _symbol, string memory _metadataUri) payable ERC721(_name, _symbol) {
        setMetadataURI(_metadataUri);
    }

    // internal
    function _getMetadataURI() internal view virtual returns (string memory) {
        return metadataURI;
    }

    // public
    function walletOfOwner(address _owner) public view virtual returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);

        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return tokenIds;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory currentBaseURI = _getMetadataURI();

        return
            bytes(currentBaseURI).length > 0
                ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension))
                : "";
    }

    //only owner
    function setMetadataURI(string memory _metadataUri) public onlyOwner {
        metadataURI = _metadataUri;
    }

    function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
        baseExtension = _newBaseExtension;
    }

    function setMaxMintAmountPerRequest(uint256 _newMaxMintAmountReq) public onlyOwner nonReentrant {
        maxMintAmountReq = _newMaxMintAmountReq;
    }

    function mint(address _to, uint256 _mintAmount) public payable onlyOwner {
        uint256 supply = totalSupply();
        //100

        require(_mintAmount > 0, "invalid mint amount");
        require(_mintAmount <= maxMintAmountReq, "mint amount too high");
        require(supply + _mintAmount <= maxSupply, "maximum supply is reached");

        for (uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(_to, supply + i);
        }
    }
}
