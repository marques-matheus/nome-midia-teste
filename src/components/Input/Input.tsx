type Props = {
    type : string
    placeholder : string
    value?: string
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
}

const Input: React.FC<Props> = ({type, placeholder, value, onChange}: Props) => {
    return (
        <input type={type} placeholder={placeholder} value={value} onChange={onChange}  className="border-b-2 border-0 focus:ring-0 border-blue-400 w-full focus:outline-none" />
    )
}

export default Input