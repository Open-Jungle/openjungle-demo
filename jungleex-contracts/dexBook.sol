// SPDX-License-Identifier: dont touch my baby
pragma solidity 0.5.16;

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

contract Context {
  constructor () internal { }
  function _msgSender() internal view returns (address payable) { return msg.sender; }
  function _msgData() internal view returns (bytes memory) { this; return msg.data; }
}

contract Ownable is Context {
  address private _owner;
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  constructor () internal {
    address msgSender = _msgSender();
    _owner = msgSender;
    emit OwnershipTransferred(address(0), msgSender);
  }
  modifier onlyOwner() {
    require(_owner == _msgSender(), "Ownable: caller is not the owner");
    _;
  }
  function getOwner() public view returns (address) { return _owner; }
  function renounceOwnership() public onlyOwner {
    emit OwnershipTransferred(_owner, address(0));
    _owner = address(0);
  }
  function transferOwnership(address newOwner) public onlyOwner { _transferOwnership(newOwner); }
  function _transferOwnership(address newOwner) internal {
    require(newOwner != address(0), "Ownable: new owner is the zero address");
    emit OwnershipTransferred(_owner, newOwner);
    _owner = newOwner;
  }
}

library SafeMath {
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a, "SafeMath: addition overflow");
    return c;
  }
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    return sub(a, b, "SafeMath: subtraction overflow");
  }
  function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
    require(b <= a, errorMessage);
    uint256 c = a - b;
    return c;
  }
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) { return 0; }
    uint256 c = a * b;
    require(c / a == b, "SafeMath: multiplication overflow");
    return c;
  }
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    return div(a, b, "SafeMath: division by zero");
  }
  function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
    require(b > 0, errorMessage);
    uint256 c = a / b;
    return c;
  }
}

contract dexBook is Context, Ownable {
    using SafeMath for uint256;
    
    struct order {
        address owner; // msgSender of the newOrder call that created this order
        address currencyFrom;
        address currencyTo;
        uint256 amountFrom; // Should have the decimals of 'currencyFrom'
        uint256 amountTo; // should have the decimals of 'currencyTo'
        uint256 price; // |16 decimals| 
    }
    
    struct currency {
        uint256 currencyID;
        /* one minus fee represents the % of a transaction amount that actualy reachs the 
         * address of 'recipient' in a transaction call. Most coins in the new tokenomicks 
         * have fees like 5% of each transaction goes to burn. In such a case, only 95% of 
         * amount reaches recipient. oneMinusFees would then equal 9500000000000000 
         */
        uint256 oneMinusFees; // |16 decimals|
        uint8 decimals; // is here for quicker access even if the information exists elsewhere
        bytes32 iconIPFSLocation; // Needs prefix "0x1220" before going back to base58
    }
    
    // constants
    uint256 constant SIXTEEN_DECIMALS_ONE = 10000000000000000; // use to manipulate 16 decimals numbers
    bytes2 constant IPFS_PREFIX = 0x1220; // to had before every IPFS storage location
    
    // pointer to the off-chain decentralized storage
    bytes32 private _dataIPFSLocation;
    
    // counters
    uint256 private _nextOrderID;
    uint256 private _nextCurrencyID;
    uint256 private _orderBookSize;
    uint256 private _currencyBookSize;
    
    // orderbook top logic, every order is stored at its ID
    mapping(uint256 => order) private _orderBook;
    
    // currency Book top logic, for faster manipulation the currency are stored
    // at their address location, allowing to take directly the address as arguments
    // in most funcions. An other mapping allow to find the currency by its ID
    mapping(address => currency) private _currencyBook;
    mapping(uint256 => address) private _currencyID;
    
    // events
    event OrderCreated(address indexed owner, address currencyFrom, address currencyTo, uint256 amountFrom, uint256 price, uint256 indexed orderID);
    event OrderCanceled( address indexed owner, uint256 indexed orderID);
    event OrderFilled( address indexed owner, address indexed buyer, uint256 amountTo, uint256 indexed orderID );
    event SetNewCurrency( address indexed msgSender, address indexed contractAddress, uint256 currencyID, uint256 oneMinusFees, bytes32 iconIPFSLocation);
    event RemoveCurrency( address indexed msgSender, address indexed contractAddress);
    event SetCurrencyIcon( address indexed msgSender, address indexed contractAddress, bytes32 iconIPFSLocation);
    event SetDataIPFSLocation( address indexed msgSender, bytes32 newDataIPFSLocation);
    
    constructor() public {
        _nextOrderID = 1;
        _nextCurrencyID = 1;
        _orderBookSize = 0;
        _currencyBookSize = 0;
    }
    
    function newOrder(address currencyFrom, address currencyTo, uint256 orderAmount, uint256 orderPrice) external returns (bool) {
        
        // verify that both address of currencyFrom and currencyTo are valid currency
        require(
            _currencyBook[currencyFrom].currencyID != uint256(0) && 
            _currencyBook[currencyTo].currencyID != uint256(0), 
                "This currency pair is not supported"
        );
        
        // create an instance of IBEP20 pointing to the currencyFrom contract
        IBEP20 contractFrom = IBEP20(currencyFrom);
        
        // verify that the msg.sender has already allowed the dexBook to spend his tokens
        require(contractFrom.allowance(msg.sender, address(this)) >= orderAmount, "Not enough allowance");
        
        // Transfer the tokens from the msg.sender address to the contract address
        require(contractFrom.transferFrom(msg.sender, address(this), orderAmount));
        
        // Calculate the true amount that made it to the contracts address
        uint256 amountFrom = orderAmount.mul(_currencyBook[currencyFrom].oneMinusFees).div(SIXTEEN_DECIMALS_ONE);
        
        // Calculate the ajusted decimal diff
        uint256 decimalAdjustedAmountFrom;
        if(_currencyBook[currencyTo].decimals > _currencyBook[currencyFrom].decimals){
            decimalAdjustedAmountFrom = amountFrom.mul(10 ** uint256(_currencyBook[currencyTo].decimals - _currencyBook[currencyFrom].decimals));
        }else{
            decimalAdjustedAmountFrom = amountFrom.div(10 ** uint256(_currencyBook[currencyFrom].decimals - _currencyBook[currencyTo].decimals));
        }
        
        // Calculate the expected amountTo
        uint256 amountTo = decimalAdjustedAmountFrom.mul(orderPrice).div(SIXTEEN_DECIMALS_ONE);
        
        // create the nre order
        _orderBook[_nextOrderID] = order({
            owner: msg.sender,
            currencyFrom: currencyFrom,
            currencyTo: currencyTo,
            amountFrom: amountFrom,
            amountTo: amountTo,
            price: orderPrice
        });
        
        // increment book size
        _orderBookSize = _orderBookSize + 1;
        
        // emit log
        emit OrderCreated(msg.sender, currencyFrom, currencyTo, amountFrom, orderPrice,  _nextOrderID);
        
        // increment order ID
        _nextOrderID = _nextOrderID.add(1);
        
        // return success result
        return true;
    }
    function cancelOrder(uint256 orderID) external returns (bool) {
        
        // check requirements
        require(_orderBook[orderID].owner != address(0), "This order does not exist");
        require(_orderBook[orderID].owner == msg.sender, "Only owner of order can cancel");
        
        // cretate instance of currencyFrom contract interface
        IBEP20 contractFrom = IBEP20(_orderBook[orderID].currencyFrom);
        
        // delete the order to prevent reentrancy
        uint256 amountFrom = _orderBook[orderID].amountFrom;
        delete _orderBook[orderID];
        
        // refund the order
        require(contractFrom.transfer(msg.sender, amountFrom), "Failed to refund order");
        
        //emit event
        emit OrderCanceled(msg.sender, orderID);
        
        // reduce book size 
        _orderBookSize = _orderBookSize.sub(1);
        
        // return success result
        return true;
    }
    function fillOrder(uint256 orderID) external returns (bool) {
        
        // do some requirements
        require(_orderBook[orderID].owner != address(0), "This order does not exist");
        require(_orderBook[orderID].owner != msg.sender, "Can't fill your own order");
        
        // cretate instance of currencyTo contract interface
        IBEP20 contractTo = IBEP20(_orderBook[orderID].currencyTo);
        
        // verify that allowance is high enought to execute trade
        require(contractTo.allowance(msg.sender, address(this)) >= _orderBook[orderID].amountTo, "Not enough allowance");
        
        // cretate instance of currencyFrom contract interface
        IBEP20 contractFrom = IBEP20(_orderBook[orderID].currencyFrom);
        
        // delete to prevent reentrancy
        uint256 amountFrom = _orderBook[orderID].amountFrom;
        uint256 amountTo = _orderBook[orderID].amountTo;
        address orderOwner = _orderBook[orderID].owner;
        delete _orderBook[orderID];
        
        // make the transfert between user from and user to
        contractTo.transferFrom(msg.sender, orderOwner, amountTo);
        
        // send the balance from the contract to the filler (user to)
        contractFrom.transfer(msg.sender, amountFrom);
        
        // emit the logs
        emit OrderFilled( orderOwner, msg.sender, amountTo, orderID);
        
        // decrement book size
        _orderBookSize = _orderBookSize - 1;
        
        // return success result
        return true;
    }
    function setCurrency(address contractAddress, uint256 oneMinusFees, bytes32 iconIPFSLocation) external onlyOwner returns (bool){
        
        // check requirements
        require(_currencyBook[contractAddress].currencyID == uint256(0), "This currency is already set");
        
        // check the oneMinusFees for option: if user says 1, it will be set to SIXTEEN_DECIMALS_ONE
        if(oneMinusFees == uint256(0)){ oneMinusFees = SIXTEEN_DECIMALS_ONE; }
        
        // cretate instance of the new contract interface
        IBEP20 newContract = IBEP20(contractAddress);
        
        // create the new currency
        _currencyBook[contractAddress] = currency({
            currencyID: _nextCurrencyID,
            oneMinusFees: oneMinusFees,
            decimals: newContract.decimals(),
            iconIPFSLocation: iconIPFSLocation
        });
        
        // save the currency ID
        _currencyID[_nextCurrencyID] = contractAddress;
        
        // emit logs
        emit SetNewCurrency(
            msg.sender,
            contractAddress,
            _nextCurrencyID, 
            oneMinusFees,
            iconIPFSLocation
        );
        
        // increment counters
        _nextCurrencyID = _nextCurrencyID + 1;
        _currencyBookSize = _currencyBookSize + 1;
        
        // return success result
        return true;
    }
    function removeCurrency(address contractAddress) external onlyOwner returns (bool) {
        // after removing the currency people will still be able to cancel orders but not create new ones
        
        // check requirements
        require(_currencyBook[contractAddress].currencyID != uint256(0), "This currency is not set");
        
        // remove the currency ID
        delete _currencyID[_currencyBook[contractAddress].currencyID];
        
        // delete the currency info
        delete _currencyBook[contractAddress];
        
        // emit log
        emit RemoveCurrency(
            msg.sender,
            contractAddress
        );
        
        // decrement counter
        _currencyBookSize = _currencyBookSize - 1;
        
        // return success
        return true;
    }
    function setCurrencyIcon(address contractAddress, bytes32 IPFSHash) external onlyOwner returns (bool) {
        
        // check requirements
        require(_currencyBook[contractAddress].currencyID != uint256(0), "This currency does not exist");
        
        // set the icon location
        _currencyBook[contractAddress].iconIPFSLocation = IPFSHash;
        
        // emit log
        emit SetCurrencyIcon(
            msg.sender,
            contractAddress,
            IPFSHash
        );
        
        // return success result
        return true;
    } 
    function setDataIPFSLocation(bytes32 newIPFSlocation) public onlyOwner returns (bool) {
        
        // set the new data pointer
        _dataIPFSLocation = newIPFSlocation;
        
        // emit the event
        emit SetDataIPFSLocation(
            msg.sender,
            newIPFSlocation
        );
        
        // return success
        return true;
    }
    
    // Getters for currency
    function getCurrencyAddress(uint128 currencyID) external view returns (address) { return _currencyID[currencyID]; }
    function getCurrencyID(address contractAddress) external view returns (uint256) { return _currencyBook[contractAddress].currencyID; }
    function getCurrencyOneMinusFees(address contractAddress) external view returns (uint256) { return _currencyBook[contractAddress].oneMinusFees; }
    function getCurrencyIconLocation(address contractAddress) external view returns (bytes32) { return _currencyBook[contractAddress].iconIPFSLocation; }
    
    // Getters for Orders
    function getOrderOwner(uint256 orderID) external view returns (address) { return _orderBook[orderID].owner; }
    function getOrderCurrencyFrom(uint256 orderID) external view returns (address) { return _orderBook[orderID].currencyFrom; }
    function getOrderCurrencyTo(uint256 orderID) external view returns (address) { return _orderBook[orderID].currencyTo; }
    function getOrderAmountFrom(uint256 orderID) external view returns (uint256) { return _orderBook[orderID].amountFrom; }
    function getOrderAmountTo(uint256 orderID) external view returns (uint256) { return _orderBook[orderID].amountTo; }
    function getOrderPrice(uint256 orderID) external view returns (uint256) { return _orderBook[orderID].price; }
    
    // general getters
    function getOrderBookSize() external view returns (uint256) { return _orderBookSize; }
    function getCurrencyBookSize() external view returns (uint256) { return _currencyBookSize; }
    function getDataIPFSLocation() external view returns (bytes32) { return _dataIPFSLocation; }
    function getIPFSPrefix() external pure returns (bytes2) { return IPFS_PREFIX; }
}







