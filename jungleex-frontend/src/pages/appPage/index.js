import React, { useState, useEffect } from 'react'
import LandingPage from '../landingPage'
import ExchangePage from '../exchangePage'

import getDexBook from '../../contracts/getDexBook'

import detectEthereumProvider from '@metamask/detect-provider';

const AppPage = () => {
    const [metamask, setMetamask] = useState(false);
    const [dexBook, setDexBook] = useState(undefined);
    
    useEffect(() => {
        async function detectMetaMask() {
            const provider = await detectEthereumProvider();
            if(provider) {setMetamask(true);}
        }
        detectMetaMask();
    },[])

    const connectToDexBook = async e => {
        e.preventDefault();
        const { dexBook } = await getDexBook();
        setDexBook(dexBook);
    };

    return (
        <>
            {dexBook === undefined ? 
                <LandingPage connectToDexBook={connectToDexBook} metamask={metamask}/>:
                <ExchangePage dexBook={dexBook}/>
            }
        </>
    )
}

export default AppPage
