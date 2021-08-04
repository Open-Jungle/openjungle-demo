import './App.css';
import { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import LandingPage from './pages/landingPage';
import ExchangePage from './pages/exchangePage';
import getDexBook from './contracts/getDexBook';
import IPFS from 'ipfs-core';

function App() {
    
    const [metamask, setMetamask] = useState(false);
    const [dexBook, setDexBook] = useState(undefined);
    const [ipfs, setIpfs] = useState(undefined);

    useEffect(() => {
        async function detectMetaMask() {
            let provider = await detectEthereumProvider();
            if(provider) {
                setMetamask(true);
            }
        }
        detectMetaMask();
    },[])

    const connectToDexBook = async e => {
        e.preventDefault();
        const ipfs = await IPFS.create();
        setIpfs(ipfs);
        const { dexBook } = await getDexBook();
        setDexBook(dexBook);
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
                />
            }
        </>
    );
}

export default App;
