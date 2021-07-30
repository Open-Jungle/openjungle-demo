import React, { useState, useEffect } from 'react'
import IPFS from 'ipfs-core';
import NavBar from '../../components/NavBar'
import SideBar from '../../components/SideBar'
import PairBar from '../../components/PairBar'

import TestSection from '../../components/TestSection'

const ExchangePage = ({ dexBook }) => {
    

    //data
    const [dexBookData, setDexBookData] = useState(undefined);
    const [currencyBook, setCurrencyBook] = useState(undefined);

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => {setIsOpen(!isOpen)};

    useEffect(() => {
        async function loadData() {
            console.log("loading data");
            const toBuffer = require('it-to-buffer');
            const ipfs = await IPFS.create();

            var bufferedContents = await toBuffer(ipfs.cat('Qmcb7V6Z97bmZ66N9xS2WHfyCKLfdqJW4qYkshnbTibYkx'));
            const dexBookData = JSON.parse((new TextDecoder().decode(bufferedContents)));
            setDexBookData(dexBookData);

            bufferedContents = await toBuffer(ipfs.cat(dexBookData.currencyBook));
            const currencyBook = JSON.parse((new TextDecoder().decode(bufferedContents)));
            setCurrencyBook(currencyBook);

            console.log(currencyBook);
            ipfs.stop();
        }
        loadData();
    }, [])

    return (
        <>
            <SideBar 
                isOpen={isOpen} 
                toggle={toggle} 
            />

            <NavBar 
                toggle={toggle}
            />

            <PairBar currencyBook={currencyBook}/>

            <TestSection />
        </>
    );
}

export default ExchangePage
