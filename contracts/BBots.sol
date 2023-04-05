// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract BBots is ERC721AQueryable, Ownable, Pausable {
    uint256 public immutable MAX_SUPPLY;
    uint256 public immutable MAX_RESERVE;
    uint256 public immutable MAX_WHITELIST;
    /**
      For Reserve
   */
    uint256 public REMAINING_RESERVE;
    uint256 public REMAINING_WL;

    uint256 public maxMintPerUser = 3;

    uint256 public COST_PRICE = 0.05 ether;
    uint256 public WHITELIST_PRICE = 0.02 ether;

    uint256 public saleStatus = 0; //0 is not open, 1 is for wl, 2 is for public sale, 3 for both active

    string public tokenBaseURI = "https://xxx.s3.us-west-2.amazonaws.com/metadata/";

    mapping(address => bool) public WhiteListed;

    address ourBoss;

    constructor(uint256 _maxSupply, uint256 _maxWhitelist, uint256 _maxReserve) ERC721A("BubbleBots", "BBOTS") {
        MAX_SUPPLY = _maxSupply;
        MAX_WHITELIST = _maxWhitelist;
        MAX_RESERVE = _maxReserve;

        REMAINING_RESERVE = _maxReserve;
        REMAINING_WL = _maxWhitelist;

        ourBoss = msg.sender;
    }

    function mintBbots(uint256 numTokens) external payable {
        require(saleStatus == 2 || saleStatus == 3, "SALE_NOT_STARTED");

        require(totalSupply() + numTokens <= MAX_SUPPLY - REMAINING_RESERVE, "EXCEEDS_SUPPLY");

        require(_numberMinted(_msgSender()) + numTokens <= maxMintPerUser, "EXCEEDS_LIMIT");

        require(msg.value >= COST_PRICE * numTokens, "NOT_ENOUGH");

        withdraw();

        _safeMint(_msgSender(), numTokens);
    }

    function mintBbotsWL(uint256 numTokens) external payable {
        require(saleStatus == 1 || saleStatus == 3, "SALE_NOT_STARTED");

        require(WhiteListed[msg.sender], "NOT_WL");

        require(numTokens <= REMAINING_WL, "EXCEEDS_SUPPLY");

        require(_numberMinted(_msgSender()) + numTokens <= maxMintPerUser, "EXCEEDS_LIMIT");

        require(msg.value >= WHITELIST_PRICE * numTokens, "NOT_ENOUGH");

        REMAINING_WL -= numTokens;

        withdraw();

        _safeMint(_msgSender(), numTokens);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return tokenBaseURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721A) returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        return string(abi.encodePacked(_baseURI(), _toString(tokenId), ".json"));
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721A) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfers(address from, address to, uint256 tokenId) internal whenNotPaused {
        super._beforeTokenTransfers(from, to, tokenId, 1);
    }

    /**
      Admin Function
   */

    function devMint(address _toAddress, uint256 _quantity) external onlyOwner {
        require(_quantity <= REMAINING_RESERVE, "Exceeds reserved supply");
        REMAINING_RESERVE -= _quantity;
        _safeMint(_toAddress, _quantity);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function updateSaleState(uint256 _saleState) external onlyOwner {
        saleStatus = _saleState;
    }

    function withdraw() internal {
        (bool os, ) = payable(ourBoss).call{value: address(this).balance}("");
        require(os);
    }

    function addToWhiteList(address[] memory _whitelistedAddress) external onlyOwner {
        for (uint256 i = 0; i < _whitelistedAddress.length; i++) {
            require(_whitelistedAddress[i] != address(0), "UPDATE_FAILED");
            WhiteListed[_whitelistedAddress[i]] = true;
        }
    }

    function removeFromWhitelist(address _addressToRemove) external onlyOwner {
        require(WhiteListed[_addressToRemove] == true, "NOT_WHITELISTED");
        WhiteListed[_addressToRemove] = false;
    }

    function updateBaseUri(string memory baseURI) external onlyOwner {
        tokenBaseURI = baseURI;
    }

    function updateMaxMint(uint256 _maxMint) external onlyOwner {
        maxMintPerUser = _maxMint;
    }

    function updateNftPrice(uint256 _salePrice, uint256 _wlPrice) external onlyOwner {
        COST_PRICE = _salePrice;
        WHITELIST_PRICE = _wlPrice;
    }

    function updateBoss(address _boss) external onlyOwner {
        ourBoss = _boss;
    }
}
