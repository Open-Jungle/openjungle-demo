![JungleEx](https://ipfs.io/ipfs/QmSqktoxt6VagJt7azEmxCqKm8C7GbyjWeaREEeFbvvGtz "Logo Title Text 1")

Welcome to the jungle EX README doc
---
**Goal of the project:**

Create a self governing Dapp to group DeFi products in a single easy-to-use and professional looking interface. It will generate money by offering launching services to token developers and charging fees to users.

**Proposed roadmap:** 
1. Team building.   <
2. Specifications.  <
3. Development.
4. Alpha releases of the platform.
5. Seek financial support and marketing teams for our pre launch campaign.
6. Pre-Launch campaign.
7. Official white paper of the governance.
8. Private sale to investors and partners.
9. Public presale of the governance tokens.
10. Audits.
11. Full release. (audited version)
12. Governance update. (Supervised)
13. Ownership renouncement. (Full decentralization)

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







SIGNATURES
---
````
"0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0" Topic for ownership transert
"0xa83d05db890d90e2c4fcbcda6dcaf7496ec6d876345654077a40b81d87fea5af" topic for set currency
"0x5278faed1185575ab8794d2f7094d533baa1889f86b34c254cc019ef59203bb5" topic for new order
"0xcbfa7d191838ece7ba4783ca3a30afd316619b7f368094b57ee7ffde9a923db1" topic for cancel order
````

COLORS
---
````
light: #8AC53C
dark: #6F9F2F

light gray : #e5e5e5
````