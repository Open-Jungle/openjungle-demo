// SPDX-License-Identifier: dont touch my baby
pragma solidity ^0.8.0;

interface IBEP20 {
    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
    function name() external view returns (string memory);
    function getOwner() external view returns (address);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address _owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

library Strings {
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) { return "0"; }
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
}
   
contract dexBook {
    using Strings for uint256;
    
    struct order {
        address owner;
        bytes16 currencyIDFrom;
        bytes16 currencyIDTo;
        uint256 amount;
        uint256 price;
    }
    
    struct currency {
        address contractAddress;
        string name;
        uint256 oneMinusFees; // the % of a transaction that reach the address after the fees (0,95000) = 95000
        uint256 decimals;
    }
    
    address private _dexOwner;
    uint256 private _nextOrderID;
    uint128 private _nextCurrencyID;
    uint256 private _orderBookSize;
    uint256 private _currencyBookSize;
    mapping(uint256 => order) private _orderBook;
    mapping(bytes16 => currency) private _currencyBook;
    mapping(address => bytes16) private _currencyID;
    
    event OrderCreated(
        address indexed owner,
        bytes32 indexed pair, //'currencyIDFrom' + 'currencyIDTo';
        uint256 amount,
        uint256 price,
        uint256 indexed orderID
    );
    event OrderCanceled(
        address indexed owner,
        bytes32 indexed pair,
        uint256 indexed orderID
    );
    event OrderFilled(
        address indexed buyer,
        bytes32 indexed pair, //'currencyIDFrom' + 'currencyIDTo';
        uint256 amount,
        uint256 price,
        uint256 indexed orderID
    );
    event SetNewCurrency(
        bytes16 indexed currencyID,
        address contractAddress,
        string currencyName
    );
    
    constructor(){
        _dexOwner = msg.sender;
        _nextOrderID = 1;
        _nextCurrencyID = 1;
        _orderBookSize = 0;
        _currencyBookSize = 0;
    }
    
    function newOrder(uint128 currencyIDFrom, uint128 currencyIDTo, uint256 orderAmount, uint256 orderPrice) public {
        require(isApprovedCurrencyID(bytes16(currencyIDFrom)) && isApprovedCurrencyID(bytes16(currencyIDTo)), "This currency pair is not supported");
        IBEP20 contractFrom = IBEP20(_currencyBook[bytes16(currencyIDFrom)].contractAddress);
        require(contractFrom.allowance(msg.sender, address(this)) >= orderAmount, "Not enough allowance");
        contractFrom.transferFrom(msg.sender, address(this), orderAmount);
        
        if(_currencyBook[bytes16(currencyIDTo)].decimals > _currencyBook[bytes16(currencyIDFrom)].decimals){
            orderAmount = orderAmount * 10 ** (_currencyBook[bytes16(currencyIDTo)].decimals - _currencyBook[bytes16(currencyIDFrom)].decimals);
        }else{
            orderAmount = orderAmount / 10 ** (_currencyBook[bytes16(currencyIDFrom)].decimals - _currencyBook[bytes16(currencyIDTo)].decimals);
        }
        
        _orderBook[_nextOrderID] = order({
            owner: msg.sender,
            currencyIDFrom: bytes16(currencyIDFrom),
            currencyIDTo: bytes16(currencyIDTo),
            amount: orderAmount * _currencyBook[bytes16(currencyIDFrom)].oneMinusFees / uint256(100000),
            price: orderPrice
        });
        
        _orderBookSize = _orderBookSize + 1;
        
        emit OrderCreated(
            msg.sender, 
            mkpair(bytes16(currencyIDFrom), bytes16(currencyIDTo)), 
            orderAmount * _currencyBook[bytes16(currencyIDFrom)].oneMinusFees / uint256(100000), 
            orderPrice, 
            _nextOrderID
        );
        
        _nextOrderID = _nextOrderID + 1;
    }
    
    function cancelOrder(uint256 orderID) public {
        require(_orderBook[orderID].owner != address(0), "This order does not exist");
        require(_orderBook[orderID].owner == msg.sender, "Only owner can cancel order");
        
        IBEP20 contractFrom = IBEP20(_currencyBook[_orderBook[orderID].currencyIDFrom].contractAddress);
        contractFrom.transfer(_orderBook[orderID].owner, _orderBook[orderID].amount);
        
        emit OrderCanceled(msg.sender, mkpair(_orderBook[orderID].currencyIDFrom, _orderBook[orderID].currencyIDTo), orderID);
        
        delete _orderBook[orderID];
        _orderBookSize = _orderBookSize - 1;
        
    }
    
    function fillOrder(uint256 orderID) public {
        require(_orderBook[orderID].owner != address(0), "This order does not exist");
        IBEP20 contractTo = IBEP20(_currencyBook[_orderBook[orderID].currencyIDTo].contractAddress);
        IBEP20 contractFrom = IBEP20(_currencyBook[_orderBook[orderID].currencyIDFrom].contractAddress);
        require(contractTo.allowance(msg.sender, address(this)) >= _orderBook[orderID].amount, "Not enough allowance");
        
        contractTo.transferFrom(msg.sender, address(this), _orderBook[orderID].amount * _orderBook[orderID].price);
        contractFrom.transfer(msg.sender, _orderBook[orderID].amount);

        _orderBookSize = _orderBookSize - 1;
        
        emit OrderFilled(
            msg.sender,
            mkpair(_orderBook[orderID].currencyIDFrom, _orderBook[orderID].currencyIDTo),
            _orderBook[orderID].amount,
            _orderBook[orderID].price,
            orderID
        );
        
        delete _orderBook[orderID];
    }
    
    function isApprovedCurrencyID(bytes16 currencyID) public view returns (bool) {
        return (_currencyBook[currencyID].contractAddress != address(0));
    }
    
    function getCurrencyByAddress(address contractAddress) public view returns (bytes16) {
        require(_currencyID[contractAddress] != bytes16(0), "This currency does not exist");
        return _currencyID[contractAddress];
    }
    
    function getCurrencyByID(uint128 currencyID) public view returns (bytes memory) {
        require(_currencyBook[bytes16(currencyID)].contractAddress != address(0), "This currency ID does not exist");
        return abi.encodePacked(
            " Contract Address: ", _currencyBook[bytes16(currencyID)].contractAddress,
            " Name: ", _currencyBook[bytes16(currencyID)].name,
            " OneMinusFees: ", _currencyBook[bytes16(currencyID)].oneMinusFees,
            " decimals: ", _currencyBook[bytes16(currencyID)].decimals
        );
    }
    
    function setCurrency(string memory name, address contractAddress, uint256 oneMinusFees, uint256 decimals) public returns (uint128){
        require(msg.sender == _dexOwner, "Only owner function");
        require(_currencyID[contractAddress] == bytes16(0), "This currency is already set");
        _currencyBook[bytes16(_nextCurrencyID)] = currency({
                                                        contractAddress: contractAddress, 
                                                        name: name,
                                                        oneMinusFees: oneMinusFees,
                                                        decimals: decimals
                                                  });
        
        _currencyID[contractAddress] = bytes16(_nextCurrencyID);
        
        _currencyBookSize = _currencyBookSize + 1;
        emit SetNewCurrency(bytes16(_nextCurrencyID), contractAddress, name);
        _nextCurrencyID = _nextCurrencyID + 1;
        return _nextCurrencyID - 1;
    }
    
    function getOrder(uint256 orderID) public view returns (bytes memory) {
        require(_orderBook[orderID].owner != address(0), "This order does not exist");
        
        return abi.encodePacked(
            " Owner: ", _orderBook[orderID].owner,
            " Token From: ", _orderBook[orderID].currencyIDFrom,
            " Token To: ", _orderBook[orderID].currencyIDTo,
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
    
    function mkpair (bytes16 a, bytes16 b) internal pure returns (bytes32) {
        return bytes32 (uint256 (uint128 (a)) << 128 | uint128 (b));
    }
}







