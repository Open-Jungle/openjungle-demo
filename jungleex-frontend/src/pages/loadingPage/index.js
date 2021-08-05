import React from 'react'
import loadingGif from '../../images/gif/loadingSpinGreen.gif'
import LogoName from '../../images/logos/LogoName.png'

import {
    LoadingPageWrapper,
    Logo,
    LoadGif,
    LogoWrapper,
    GifWrapper
} from './loadingPageElements'

const LoadingPage = () => {
    return (
        <LoadingPageWrapper>
            <LogoWrapper>
                <Logo src={LogoName} alt="Jungle Ex" />
            </LogoWrapper>
            <GifWrapper>
                <LoadGif src={loadingGif} alt="loading..." />
            </GifWrapper> 
        </LoadingPageWrapper>
    )
}

export default LoadingPage
