import axios from 'axios';
import React, { useCallback, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import MewLogo from '../assets/mewwallet-logo.svg';
import Card from './util_card';
import FileUploadPopup from './util_popupUpload';

export default function Login() {
    const navigate = useNavigate();
    const goToDashboard = useCallback(() => navigate('/dashboard'), [navigate]);
    useEffect(() => {
        const privateKey = localStorage.getItem('privatekey');
        const publicKey = localStorage.getItem('publickey');
        if (privateKey && publicKey) {
            goToDashboard();
        }
        else {
            localStorage.clear();

        }
    }, [goToDashboard]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isLoginFailed, setIsLoginFailed] = useState(false);
    const handleLogin = () => {
        setIsPopupOpen(true);
    };

    const handleFileUpload = (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const secretKey = e.target.result;
            try {
                await axios.post(`http://localhost:5000/user/login`, { privateKey: secretKey })
                    .then((response) => {
                        const { data } = response.data;
                        localStorage.setItem("privatekey", secretKey);
                        localStorage.setItem("publickey", data);
                        navigate('/dashboard');
                    });
            } catch (error) {
                setIsLoginFailed(true);
            }
        };
        reader.readAsText(file);
    };
    const cardData = [
        {
            id: "card1",
            image: "",
            title: "Software",
            description: "Keystone file, Mnemonic Phrase and Private Key",
            click_event: handleLogin,
        },
        {
            id: "card2",
            image: MewLogo,
            title: "MEW wallet app",
            description: "Connect MEW wallet app to MEW web",
            click_event: null,
        },
    ];

    const goToSignup = () => navigate('/signup');
    return (
        <main className="max-w-[1392px] px-10 mx-auto my-5">
            <div className="items-center text-center">
                <div className="text-[#0c5876] my-5 text-5xl font-semibold">Access my wallet</div>
                <div className="text-2xl">
                    Please select a method to access your wallet.
                </div>
                <div className='text-2xl'>
                    Don't have a wallet? &nbsp;
                    <div className="cursor-pointer text-green-700 underline ct-hover-opacity" onClick={goToSignup}>Create wallet</div>
                </div>
                <div className='flex-col flex items-center justify-center mt-10'>
                    {isLoginFailed && <div className=''>
                        <div class="p-16 ct-alert rounded-lg">
                            <strong>Failed to login! Please check your key stone file.</strong>
                        </div>
                    </div>}
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

            <FileUploadPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                onFileUpload={handleFileUpload}
            />
        </main>
    )
}
