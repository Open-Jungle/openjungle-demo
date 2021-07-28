import React, { useState }from 'react'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider';
import getDexBook from '../contracts/getDexBook'

import ConnectDexSection from '../components/connectDexSection'

const HomePage = () => {
    const [user, setUser] = useState(undefined);
    const [dexBook, setDexBook] = useState(undefined); 	

    const connectToDexBook = async e => {
        e.preventDefault();
        const { dexBook } = await getDexBook();
        setDexBook(dexBook);

        let provider = await detectEthereumProvider();
        await provider.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(provider);
        const signer = provider.getSigner();
        setUser(signer);
    };

    return (
        <ConnectDexSection connectToDexBook={connectToDexBook}/>
    );
}

export default HomePage
