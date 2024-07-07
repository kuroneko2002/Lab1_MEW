import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

    const goToSignup = () => navigate('/signup');
    const goToLogin = () => navigate('/login');
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

    return (
        <main className="max-w-[1392px] px-10 mx-auto my-5">
            <div className="py-10 text-center">
                <div className="text-[#0c5876] text-5xl font-semibold">MyEtherWallet</div>
            </div>
            <div className="py-5 text-center text-7xl font-bold">
                <div className="px-32">The most reputable, friendly, and secure crypto wallet</div>
            </div>
            <div className="flex items-center justify-center text-center">
                <div className="">
                    <div className="cursor-pointer text-3xl text-white bg-blue-700 rounded-[20px] py-5 px-7 m-5 font-semibold ct-hover-opacity" onClick={goToSignup}>Create a new wallet</div>
                    <div className="cursor-pointer text-2xl flex justify-center">
                        or &nbsp;
                        <div className="underline ct-hover-opacity" onClick={goToLogin}>Access my wallet</div>
                    </div>
                </div>
            </div>
        </main>
    )
}
