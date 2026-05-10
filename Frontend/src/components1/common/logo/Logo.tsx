import { useNavigate } from "react-router-dom";

const Logo = () => {
    const nav = useNavigate()
    return (
        <header className="flex my-5 gap-2.5 justify-center items-center mb-10">
            <img
                onClick={()=>nav('/')}
                src="/logo.png"
                alt="Connect Logo"
                className="h-32 md:h-40 cursor-pointer object-contain invert dark:invert-0"
            />



        </header>
    );
};

export default Logo;

