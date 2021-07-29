import React from 'react'

const ConnectDexSection = ({connectToDexBook, bookSize}) => {
    return (
        <div>
            <button onClick={alert('wtf1')}>connect</button>
            <p>
                {bookSize === undefined ? 
                    '':
                    bookSize}
            </p>
        </div>
    )
}

export default ConnectDexSection
