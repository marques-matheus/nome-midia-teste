import { Company } from "@/types";
import { register_user } from "@/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RegisterUser = {
  email: string;
  password: string;
  name: string;
  companyName: string;
  cnpj: string;
  address?: string;
  city?: string;
  state?: string;
  businessEmail?: string;
  phone?: string;
  errorMessage: string;
  loading: boolean;
  companyRegistered?: boolean;
  contactCompany?: boolean;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setCompanyName: (companyName: string) => void;
  setCnpj: (cnpj: string) => void;
  setAddress: (address: string) => void;
  setCity: (city: string) => void;
  setState: (state: string) => void;
  setBusinessEmail: (businessEmail: string) => void;
  setPhone: (phone: string) => void;
  setCompanyRegistered: (companyRegistered: boolean) => void;
  setContactCompany: (contactCompany: boolean) => void;
  handleRegister: (e: React.FormEvent) => void;
};

const useRegisterUser = (): RegisterUser => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [companyRegistered, setCompanyRegistered] = useState(true);
  const [contactCompany, setContactCompany] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (companyRegistered && contactCompany) {
        setErrorMessage(
          "Entre em contato com a sua empresa para obter acesso"
        );
      }

      const company: Company = {
        name: companyName,
        uid: "",
        cnpj: cnpj,
        address: address,
        city: city,
        state: state,
        email: businessEmail,
        phone: phone,
      };

      const user = { email, password, name };

      await register_user(companyRegistered, company, user);
      router.push("/");
    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Este e-mail já foi cadastrado");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Email inválido");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage(
          "Senha muito fraca, a senha deve ter no mínimo 6 caracteres"
        );
      } else if (error.code === "auth/invalid-password") {
        setErrorMessage("Senha inválida");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Email inválido");
      } else if (error.code === "auth/missing-password") {
        setErrorMessage("Senha não pode ser vazia");
      } else {
        setErrorMessage(error.message);
      }
    }

    setTimeout(() => {
      setLoading(false);
    }, 1800);
  };

  return {
    email,
    password,
    name,
    companyName,
    cnpj,
    address,
    city,
    state,
    businessEmail,
    phone,
    errorMessage,
    loading,
    companyRegistered,
    contactCompany,
    setName,
    setEmail,
    setPassword,
    setCompanyName,
    setCnpj,
    setAddress,
    setCity,
    setState,
    setBusinessEmail,
    setPhone,
    setCompanyRegistered,
    setContactCompany,
    handleRegister
    

  };
};

export default useRegisterUser;
