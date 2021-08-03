Welcome to the jungle EX README doc


DATA STRUCTURES
orderBook.json: {
    pair:{                          // as "currencyFrom"+"currencyTo"
        orderID:{                   // as int
            owner: address,
            currencyFrom: address,
            currencyTo: address,
            amountFrom: int,
            amountTo: int,
            price: float            // do not use to calculate amountTo!! JS is dumb
        }
    }
}

chartData.json: {
    pair:[
        { 
            time: int,
            value: int 
        }
    ]
}

currencyBook.json: {
    address:{ 
        currencyID: int,
        name: string,
        symbol: string,
        oneMinusFees: int,
        decimals: int,
        iconIPFSLocation: string (base58)
    }
}



selectedOrder:{
    orderID: int
    owner: address,
    amountFrom: int,
    amountTo: int,
    price: float
}

selectedPair:{
    currencyFrom: address,
    currencyTo: address,
    pair: "currencyFrom"+"currencyTo",
    invertedPair: "currencyTo"+"currencyFrom",
    currencyFromIPFSIcon: string (base58),
    currencyToIPFSIcon: string (base58),
    currencyFromDecimals: int,
    currencyToDecimals: int
}

scrapeStatus:{
    lastUpdateTimeStamp: int,
    lastUpdateNbLogSrapped: int,
    lastUpdateRunTime: int,
    mostRecentSeenBlock: int,
    refeshInterval: int,
}







SIGNATURES
"0xa83d05db890d90e2c4fcbcda6dcaf7496ec6d876345654077a40b81d87fea5af" topic for set currency
"0x5278faed1185575ab8794d2f7094d533baa1889f86b34c254cc019ef59203bb5" topic for new order
"0xcbfa7d191838ece7ba4783ca3a30afd316619b7f368094b57ee7ffde9a923db1" topic for cancel order
 topic for fill order



fees:
To owner 0.2%


