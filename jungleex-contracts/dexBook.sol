// SPDX-License-Identifier: dont touch my baby
pragma solidity ^0.8.0;

interface IBEP20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the token decimals.
     */
    function decimals() external view returns (uint8);

    /**
     * @dev Returns the token symbol.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the token name.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the bep token owner.
     */
    function getOwner() external view returns (address);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address _owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

library Strings {
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0x00";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return toHexString(value, length);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }
}
   
contract dexBook {
    
    using Strings for uint256;
    
    struct order {
        address owner;
        string pairFrom;
        string pairTo;
        uint256 amount;
        uint256 price;
    }
    
    address private _dexOwner;
    
    uint256 private _nextID;
    uint256 private _orderBookSize;
    uint256 private _currencyBookSize;
    mapping(uint256 => order) private _orderBook;
    mapping(string => address) private _currencyBook;
    
    event OrderCreated(
        address indexed owner,
        bytes indexed tokenFrom_tokenTo,
        uint256 amount,
        uint256 price,
        uint256 indexed orderID
    );
    event OrderCanceled(
        address indexed owner,
        uint256 indexed orderID
    );
    event OrderFilled(
        address indexed buyer,
        bytes indexed tokenFrom_TokenTo,
        uint256 amount,
        uint256 price,
        uint256 indexed orderID
    );
    
    constructor(){
        _dexOwner = msg.sender;
        _nextID = 1;
        _orderBookSize = 0;
        _currencyBookSize = 0;
    }
    
    function newOrder(string memory pf, string memory pt, uint256 a, uint256 pr) public returns (uint256) {
        require(isApprovedCurrency(pf) && isApprovedCurrency(pt), "This currency pair is not supported");
        IBEP20 contractFrom = IBEP20(_currencyBook[pf]);
        require(contractFrom.allowance(msg.sender, address(this)) >= a, "Not enough allowance");
        contractFrom.transferFrom(msg.sender, address(this), a);
        
        _orderBook[_nextID] = order({
            owner: msg.sender,
            pairFrom: pf,
            pairTo: pt,
            amount: a,
            price: pr
        });
        
        
        _orderBookSize = _orderBookSize + 1;
        
        bytes memory pair = abi.encodePacked(pf,"/",pt);
        emit OrderCreated(msg.sender, pair, a, pr, _nextID);
        
        _nextID = _nextID + 1;
        return _nextID - 1;
    }
    
    function cancelOrder(uint256 orderID) public returns (bool) {
        require(_orderBook[orderID].owner != address(0), "This order does not exist");
        require(_orderBook[orderID].owner == msg.sender, "Only owner can cancel order");
        
        IBEP20 contractFrom = IBEP20(_currencyBook[_orderBook[orderID].pairFrom]);
        contractFrom.transfer(_orderBook[orderID].owner, _orderBook[orderID].amount);
        
        delete _orderBook[orderID];
        _orderBookSize = _orderBookSize - 1;
        emit OrderCanceled(msg.sender, orderID);
        return true;
    }
    
    function fillOrder(uint256 orderID) public returns (bool) {
        require(_orderBook[orderID].owner != address(0), "This order does not exist");
        IBEP20 contractTo = IBEP20(_currencyBook[_orderBook[orderID].pairTo]);
        IBEP20 contractFrom = IBEP20(_currencyBook[_orderBook[orderID].pairFrom]);
        require(contractTo.allowance(msg.sender, address(this)) >= _orderBook[orderID].amount, "Not enough allowance");
        
        contractTo.transferFrom(msg.sender, address(this), _orderBook[orderID].amount * _orderBook[orderID].price);
        contractFrom.transfer(msg.sender, _orderBook[orderID].amount);
        
        delete _orderBook[orderID];
        _orderBookSize = _orderBookSize - 1;
        
        emit OrderFilled(
            msg.sender,
            abi.encodePacked(_orderBook[orderID].pairFrom,"/",_orderBook[orderID].pairTo),
            _orderBook[orderID].amount,
            _orderBook[orderID].price,
            orderID
        );
        
        return true;
    }
    
    function isApprovedCurrency(string memory name) public view returns (bool) {
        return (_currencyBook[name] != address(0));
    }
    
    function setCurrency(string memory name, address contractAddress) public {
        require(msg.sender == _dexOwner, "Only owner function");
        _currencyBook[name] = contractAddress;
        _currencyBookSize = _currencyBookSize + 1;
    }
    
    function getOrder(uint256 orderID) public view returns (bytes memory) {
        require(_orderBook[orderID].owner != address(0), "This order does not exist");
        
        return abi.encodePacked(
            " Owner: ", _orderBook[orderID].owner,
            " Token From: ", _orderBook[orderID].pairFrom,
            " Token To: ", _orderBook[orderID].pairTo,
            " Amount: ", _orderBook[orderID].amount.toString(),
            " Price: ",_orderBook[orderID].price.toString()
        );
    }
    
    function getOrderBookSize() public view returns (uint256) {
        return _orderBookSize;
    }
    
    function getCurrencyBookSize() public view returns (uint256) {
        return _currencyBookSize;
    }
}







