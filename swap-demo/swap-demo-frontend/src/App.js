import { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';

import SwapPage from './pages/swapPage';
import LandingPage from './pages/landingPage';

function App() {

    const [metamask, setMetamask] = useState(false);

    useEffect(() => {
        async function detectMetaMask() {
            let provider = await detectEthereumProvider();
            if(provider) {
                setMetamask(true);
            }
        }
        detectMetaMask();
    },[])
    return (
        <>
            {metamask ? 
                <LandingPage /> : 
                <SwapPage />
            }
        </>
    );
}

export default App;
