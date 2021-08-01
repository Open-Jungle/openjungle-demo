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
   
contract dexBook {
    
    struct order {
        address owner;
        address currencyFrom;
        address currencyTo;
        uint256 amountFrom;
        uint256 amountTo;
        uint256 price; // price has 16 decimals 
    }
    
    struct currency {
        uint256 currencyID;
        uint256 oneMinusFees; // |16 decimals| the % of a transaction that reach the address after the fees (0,95000..) = 09500000000000000
        uint8 decimals;
        bytes32 iconIPFSLocation;  // dont forget to change "0x" -> "0x1220" before going back to base58
    }
    
    uint256 constant SIXTEEN_DECIMALS_ONE = 10000000000000000;
    
    address private _dexOwner;
    uint256 private _nextOrderID;
    uint128 private _nextCurrencyID;
    uint256 private _orderBookSize;
    uint256 private _currencyBookSize;
    mapping(uint256 => order) private _orderBook;
    mapping(address => currency) private _currencyBook;
    mapping(uint256 => address) private _currencyID;
    
    event OrderCreated(
        address indexed owner,
        address currencyFrom,
        address currencyTo,
        uint256 amountFrom,
        uint256 price,
        uint256 indexed orderID
    );
    event OrderCanceled(
        address indexed owner,
        uint256 indexed orderID
    );
    event OrderFilled(
        address indexed owner,
        address indexed buyer,
        uint256 amountTo,
        uint256 indexed orderID
    );
    event SetNewCurrency(
        address indexed msgSender,
        uint256 indexed currencyID,
        address contractAddress,
        uint256 oneMinusFees,
        bytes32 iconIPFSLocation
    );
    
    constructor(){
        _dexOwner = msg.sender;
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
        uint256 amountFrom = orderAmount * _currencyBook[currencyFrom].oneMinusFees / SIXTEEN_DECIMALS_ONE;
        
        // Calculate the ajusted decimal diff
        uint256 decimalAdjustedAmountFrom;
        if(_currencyBook[currencyTo].decimals > _currencyBook[currencyFrom].decimals){
            decimalAdjustedAmountFrom = amountFrom * 10 ** (_currencyBook[currencyTo].decimals - _currencyBook[currencyFrom].decimals);
        }else{
            decimalAdjustedAmountFrom = amountFrom / 10 ** (_currencyBook[currencyFrom].decimals - _currencyBook[currencyTo].decimals);
        }
        
        // Calculate the expected amountTo
        uint256 amountTo = decimalAdjustedAmountFrom * orderPrice / SIXTEEN_DECIMALS_ONE;
        
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
        emit OrderCreated(
            msg.sender, 
            currencyFrom,
            currencyTo,
            amountFrom,
            orderPrice, 
            _nextOrderID
        );
        
        // increment order ID
        _nextOrderID = _nextOrderID + 1;
        
        // return success result
        return true;
    }
    
    function cancelOrder(uint256 orderID) external returns (bool) {
        
        // create copy of order for quick access
        order storage temp = _orderBook[orderID];
        
        // check requirements
        require(temp.owner != address(0), "This order does not exist");
        require(temp.owner == msg.sender, "Only owner can cancel order");
        
        // delete the order to prevent reentrancy
        delete _orderBook[orderID];
        
        // cretate instance of currencyFrom contract interface
        IBEP20 contractFrom = IBEP20(temp.currencyFrom);
        
        // refund the order
        require(contractFrom.transfer(msg.sender, _orderBook[orderID].amountFrom), "Failed to refund.. you in trouble");
        
        //emit event
        emit OrderCanceled(msg.sender, orderID);
        
        // reduce book size 
        _orderBookSize = _orderBookSize - 1;
        
        // return success result
        return true;
    }
    
    function fillOrder(uint256 orderID) external returns (bool) {
        
        // create copy of order for quick access
        order storage temp = _orderBook[orderID];
        
        // do some requirements
        require(temp.owner != address(0), "This order does not exist");
        require(temp.owner != msg.sender, "Can't fill your own order");
        
        // cretate instance of currencyTo contract interface
        IBEP20 contractTo = IBEP20(temp.currencyTo);
        
        // verify that allowance is high enought to execute trade
        require(contractTo.allowance(msg.sender, address(this)) >= temp.amountTo, "Not enough allowance");
        
        // delete the order to prevent reentrancy
        delete _orderBook[orderID];
        
        // cretate instance of currencyFrom contract interface
        IBEP20 contractFrom = IBEP20(temp.currencyFrom);
        
        // make the transfert between user from and user to
        contractTo.transferFrom(msg.sender, temp.owner, temp.amountTo);
        
        // send the balance from the contract to the filler (user to)
        contractFrom.transfer(msg.sender, temp.amountFrom);

        // emit the logs
        emit OrderFilled(
            temp.owner,
            msg.sender,
            temp.amountTo,
            orderID
        );
        
        // decrement book size
        _orderBookSize = _orderBookSize - 1;
        
        // return success result
        return true;
    }
    
    function setCurrency(address contractAddress, uint256 oneMinusFees, bytes32 iconIPFSLocation) external returns (bool){
        
        // check requirements
        require(msg.sender == _dexOwner, "Only owner function");
        require(_currencyBook[contractAddress].currencyID == uint256(0), "This currency is already set");
        
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
            _nextCurrencyID,
            contractAddress, 
            oneMinusFees,
            iconIPFSLocation
        );
        
        // increment counters
        _nextCurrencyID = _nextCurrencyID + 1;
        _currencyBookSize = _currencyBookSize + 1;
        
        // return success result
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
}







