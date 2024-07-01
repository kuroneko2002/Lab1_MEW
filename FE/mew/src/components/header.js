import React, { Component } from 'react';

class Header extends Component {
    render() {
        return (
            <header className="py-10">
                <nav className="flex flex-row justify-between items-center mx-auto px-4">
                    <div className="logo text-center cursor-pointer">
                        <a href="/" className="">
                            <img src="./logo.svg" alt="" />
                        </a>
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
                    <div className="ct-header-badge bg-black text-white">
                        <div className="text-lg font-medium leading-6 pt-1">Access my wallet</div>
                    </div>
                </nav>
            </header>
        );
    }
}

export default Header;