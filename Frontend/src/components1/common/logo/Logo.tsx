import React from "react";
import { useNavigate } from "react-router-dom";

const Logo = () => {
    const nav = useNavigate()
    return (
        <header className="flex my-5 gap-2.5 justify-center items-center mb-10">
            <h1 className="flex  items-end text-4xl font-bold text-white gap-0">
                <span>Co</span>
                <img
                onClick={()=>nav('/')}
                    src="/connectlogo.png"
                    alt="nostr-head"
                    className="h-[46px] w-[48px] align-bottom"
                />
                <span >nect</span>
            </h1>



        </header>
    );
};

export default Logo;