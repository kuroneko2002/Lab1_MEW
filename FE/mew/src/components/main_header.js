import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();

    const goToHome = () => {
        const privateKey = localStorage.getItem('privatekey');
        const publicKey = localStorage.getItem('publickey');
        if (!privateKey || !publicKey) {
            navigate('/')
        };
    }
    const goToLogin = () => navigate('/login');

    const handleLogout = () => {
        localStorage.clear();
        goToHome();
    }

    return (
        <header className="py-10">
            <nav className="flex flex-row justify-between items-center mx-auto px-4">
                <div className="logo text-center cursor-pointer" onClick={goToHome}>
                    <img src="./logo.svg" alt="" />
                </div>
                <ul className="flex items-center justify-between gap-8">
                    <li className="cursor-pointer ct-top-menu-item ct-hover-opacity">
                        <a href="/" className="">Buy Crypto</a>
                    </li>
                    <li className="cursor-pointer ct-top-menu-item ct-hover-opacity">
                        <a href="/" className="">Swap Token</a>
                    </li>
                    <li className="cursor-pointer ct-top-menu-item ct-hover-opacity">
                        <a href="/" className="">More Feature</a>
                    </li>
                    <li className="cursor-pointer ct-top-menu-item ct-hover-opacity">
                        <a href="/" className="">Resources</a>
                    </li>
                    <li className="cursor-pointer ct-top-menu-item ct-hover-opacity">
                        <a href="/" className="">Products</a>
                    </li>
                </ul>
                {
                    localStorage.getItem('publickey') ?
                        <div className="">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="cursor-pointer size-10 rounded-full ct-hover-opacity" onClick={handleLogout}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                            </svg>
                        </div> :
                        <div className="ct-header-badge bg-black text-white" onClick={goToLogin}>
                            <div className="text-lg font-medium leading-6 pt-1">Access my wallet</div>
                        </div>
                }
            </nav>
        </header>
    );
}

export default Header;
