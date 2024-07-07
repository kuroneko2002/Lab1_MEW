import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class NotFound extends Component {
    render() {
        return (
            <div className='max-w-[1392px] text-center px-10 mx-auto my-5'>
                <div className='py-20 text-[#0c5876] text-5xl font-semibold'>404 - Page Not Found</div>
                <div className='my-20'>
                    <Link className='cursor-pointer text-3xl text-white bg-blue-700 rounded-[20px] py-5 px-7 m-5 font-semibold ct-hover-opacity' to="/">Go to Home</Link>
                </div>
            </div>
        )
    }
}
