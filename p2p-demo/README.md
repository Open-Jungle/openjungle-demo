![JungleEx](https://ipfs.io/ipfs/QmSqktoxt6VagJt7azEmxCqKm8C7GbyjWeaREEeFbvvGtz "Logo Title Text 1")

Welcome to the JungleEX-p2p-demo README doc

How to start
------------
**To look at demo**  
There is a bsc testnet demo running [here](https://jungleex.netlify.app/)  
You must have MetaMask on to access the demo exchange.

If you want coins to experiment with the demo just send me a dm at @LiquidBlocks on telegram. A beter solution will be created later.

**To start editing**
1. Start by cloning the repo
2. Navigate to the App folder
3. Run install
4. Start a server
```
git clone https://github.com/FredCoteMtl/JungleEx
cd jungleex-frontend
npm install
npm start
```
At this point you should see the landing page of the app.

DATA STRUCTURES
---
````
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


selection:{
    order:{
        orderID: int
        owner: address,
        amountFrom: int,
        amountTo: int,
        price: float
    }

    pair:{
        currencyFrom: address,
        currencyTo: address,
        currencyFromName: string,
        currencyToName: string,
        currencyFromSymbol: string,
        currencyToSymbol: string,
        pair: "currencyFrom"+"currencyTo",
        invertedPair: "currencyTo"+"currencyFrom",
        currencyFromIPFSIcon: string (base58),
        currencyToIPFSIcon: string (base58),
        currencyFromDecimals: int,
        currencyToDecimals: int
    }
}


scrapeStatus:{
    lastUpdateTimeStamp: int,
    lastUpdateNbLogSrapped: int,
    lastUpdateRunTime: int,
    mostRecentSeenBlock: int,
    refeshInterval: int,
}
````

SIGNATURES FOR SCRAPPER
---
````
"0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0" Topic for ownership transert
"0xa83d05db890d90e2c4fcbcda6dcaf7496ec6d876345654077a40b81d87fea5af" topic for set currency
"0x5278faed1185575ab8794d2f7094d533baa1889f86b34c254cc019ef59203bb5" topic for new order
"0xcbfa7d191838ece7ba4783ca3a30afd316619b7f368094b57ee7ffde9a923db1" topic for cancel order
````
