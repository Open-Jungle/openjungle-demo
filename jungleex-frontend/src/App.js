import './App.css';
import { useState, useEffect } from 'react'
import detectEthereumProvider from '@metamask/detect-provider';
import IPFS from 'ipfs-core';

import getDexBook from './contracts/getDexBook'

import LandingPage from './pages/landingPage'
import ExchangePage from './pages/exchangePage'

function App() {

    const [metamask, setMetamask] = useState(false);
    const [dexBook, setDexBook] = useState(undefined);
    const [ipfs, setIpfs] = useState(undefined);
    const [provider, setProvider] = useState(undefined);
    
    useEffect(() => {
        async function detectMetaMask() {
            const provider = await detectEthereumProvider();
            if(provider) {setMetamask(true);}
        }
        detectMetaMask();
    },[])

    const connectToDexBook = async e => {
        e.preventDefault();
        const { dexBook, provider } = await getDexBook();
        const ipfs = await IPFS.create();
        setIpfs(ipfs);
        setDexBook(dexBook);
        setProvider(provider);
    };


    return (
        <>
            {dexBook === undefined ? 
                <LandingPage 
                    connectToDexBook={connectToDexBook}
                    metamask={metamask}
                />:
                <ExchangePage 
                    dexBook={dexBook}
                    ipfs={ipfs}
                    provider={provider}
                />
            }
        </>
    );
}

export default App;
