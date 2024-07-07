import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import Card from './util_card';
import MewLogo from '../assets/mewwallet-logo.svg';

export default function Signup() {
    const navigate = useNavigate();
    const goToLogin = () => navigate('/login');
    const goToDashboard = useCallback(() => navigate('/dashboard'), [navigate]);
    useEffect(() => {    
        const privateKey = localStorage.getItem('privatekey');
        const publicKey = localStorage.getItem('publickey');
        if (privateKey && publicKey) {
            goToDashboard();
        }
        else{
            localStorage.clear();
        }
    } , [goToDashboard]);
    const [isDisable, setIsDisable] = useState(false);

    const handleSignup = () => {
        setIsDisable(true);
        axios.post(`http://localhost:5000/user/register`)
            .then(response => {
                const { data } = response.data;
                const blob = new Blob([data], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'wallet_key.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                setIsDisable(false);
                console.error('There was an error fetching the profile data!', error);
            });
    };

    const cardData = [
        {
            id: "card1",
            image: "",
            title: "Software",
            description: "Software methods like Keystore File and Mnemonic Phrase should only be used in offline settings by experienced users",
            click_event: handleSignup,
        },
        {
            id: "card2",
            image: MewLogo,
            title: "MEW wallet app",
            description: "Our official mobile app to create your wallet, and connect to MEW Web using your mobile phone",
            click_event: null,
        },
    ];
    return (
        <main className="max-w-[1392px] px-10 mx-auto my-5">
            <div className="items-center text-center">
                <div className="text-[#0c5876] my-5 text-5xl font-semibold">Create a new wallet</div>
                <div className="text-2xl">
                    Please select a method to create a new wallet.
                </div>
                <div className='text-2xl'>
                    Already have a wallet? &nbsp;
                    <div className='cursor-pointer text-green-700 underline ct-hover-opacity ' key="login" onClick={goToLogin} disable={isDisable}>Access wallet</div>
                </div>
                <div className='flex-col flex items-center justify-center mt-10'>
                    {
                        cardData.map((card, index) => (
                            <Card
                                id={card.id}
                                image={card.image}
                                title={card.title}
                                description={card.description}
                                click_event={card.click_event}
                            />
                        ))
                    }
                </div>
            </div>
        </main>
    )
}
