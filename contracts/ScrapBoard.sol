// contracts/NUTSToken.sol
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ScarpBoard is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public gameAddress;

    IERC20 public immutable nutsToken;

    mapping(address => UserInfo) public userInfo;

    struct UserInfo {
        uint256 level;
        uint256 amount;
        uint256 lastDeposit;
    }

    modifier onlyGame() {
        require(msg.sender == gameAddress, "Ownable: caller is not the game");
        _;
    }

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event UpdateUserLevel(address indexed user, uint256 level);

    constructor(address _nutsTokenAddress, address _gameAddress) {
        require(_nutsTokenAddress != address(0), "Invalid nuts token address");
        require(_gameAddress != address(0), "Invalid game address");

        nutsToken = IERC20(_nutsTokenAddress);
        gameAddress = _gameAddress;
    }

    function withdraw(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount cannot be 0");

        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= _amount, "Amount to withdraw too high");

        user.amount = user.amount.sub(_amount);
        nutsToken.safeTransfer(address(msg.sender), _amount);

        emit Withdraw(msg.sender, _amount);
    }

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount cannot be 0");
        nutsToken.safeTransferFrom(address(msg.sender), address(this), _amount);

        UserInfo storage user = userInfo[msg.sender];
        user.amount = user.amount.add(_amount);
        user.lastDeposit = block.timestamp;

        emit Deposit(msg.sender, _amount);
    }

    function updateUserLevel(address _address, uint256 _level) external onlyGame {
        UserInfo storage user = userInfo[_address];
        user.level = _level;

        emit UpdateUserLevel(_address, _level);
    }
}
