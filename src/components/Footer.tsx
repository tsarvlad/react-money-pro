import React from 'react'
import { Link } from 'react-router-dom';

function getCurrentYear() {
    return new Date().getFullYear();
}

const Footer = () => {

    return (
        <div id='footerWall' className="relative bottom-0 left-0 right-0 w-[100%] p-6 bg-[#000] text-[rgba(212,212,212)] text-center z-30">
            Copyright ©{getCurrentYear()} <span className='font-bold'>FINSTRA</span>,
            by <Link className='hover:text-[#2787be]' to={`${import.meta.env.VITE_PORTFOLIO_LINK}`}>
                Vladyslav Tsaryniak
            </Link>
        </div>
    )
}

export default Footer
