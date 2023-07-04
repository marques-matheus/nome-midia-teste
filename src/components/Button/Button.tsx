import { Spinner } from "flowbite-react";

type ButtonProps = {
    text: string;
    onClick?: () => void;
    type: 'button' | 'submit';
    loading?: boolean;
};

const Button: React.FC<ButtonProps> = ({ text, onClick, type, loading }: ButtonProps) => {
    return (
        <button onClick={onClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4" type={type}>
            {loading && <Spinner className="mr-2" size="sm" />}
            {text}
        </button>
    );
};

export default Button;
