import { Spinner } from "flowbite-react";

type ButtonProps = {
    text: string;
    onClick?: () => void;
    type: 'button' | 'submit';
    loading?: boolean;
    disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({ text, onClick, type, loading, disabled }: ButtonProps) => {
    return (
        <button onClick={onClick} disabled={disabled} className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 ${disabled ? 'cursor-not-allowed  opacity-50' : ''}`} type={type}>
            {loading && <Spinner className="mr-2" size="sm" />}
            {text}
        </button>
    );
};

export default Button;
