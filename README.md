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
    pair:{                          // as "currencyFrom"+"currencyTo"

    }
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






SIGNATURES
"0x8b7c3b99fa246a94698cde11b32f366c6e0a7aad7a5be35b0a990203a77da18a" topic for set currency
"0x5278faed1185575ab8794d2f7094d533baa1889f86b34c254cc019ef59203bb5" topic for new order
"0xcbfa7d191838ece7ba4783ca3a30afd316619b7f368094b57ee7ffde9a923db1" topic for cancel order
 topic for fill order
