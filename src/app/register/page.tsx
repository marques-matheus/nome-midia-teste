'use client';
import useRegisterUser from '@/hooks/useRegisterUser';
import Button from '@/components/Button';
import { useState } from 'react';
import { cnpj } from 'cpf-cnpj-validator';
const RegisterForm = () => {
  const { errorMessage, loading, address, name, businessEmail, city, companyName, email, password, phone, state,
    companyRegistered, contactCompany,
    setName, setEmail, setPassword, setCompanyName,
    setCompanyRegistered, setContactCompany, setCnpj,
    setAddress, setCity, setState, setBusinessEmail,
    setPhone, handleRegister } = useRegisterUser();


  const [formattedCnpj, setFormattedCnpj] = useState('');
  const [cnpjError, setCnpjError] = useState('');
  const handleCnpjChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const formattedValue = cnpj.format(inputValue); // Formata o CNPJ com a máscara
    setCnpj(formattedValue);
    setFormattedCnpj(formattedValue); // Atualiza o estado com o CNPJ formatado
    setCnpjError(''); // Limpa o erro de validação

    if (inputValue.length === 14) {
      if (!cnpj.isValid(inputValue)) {
        setCnpjError('CNPJ inválido');
      }
    }
  };


  return (
    <div className="flex flex-col items-center w-full m-auto mt-32">
      <h1 className="text-2xl font-bold mb-4">Registrar</h1>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <form className="flex flex-col items-center lg:w-6/12 shadow-lg p-10" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nome do usuário *"
          className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="E-mail *"
          className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha *"
          className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {companyRegistered && contactCompany && (
          <p className="text-red-500 mb-2">Entre em contato com a sua empresa para obter acesso</p>
        )}


        <div className="flex items-center mb-2">
          <input
            type="radio"
            id="registeredCompany"
            checked={companyRegistered}
            onChange={() => {
              setCompanyRegistered(true);
              setContactCompany(true)
              setContactCompany(true);
            }}
          />
          <label htmlFor="registeredCompany" className="ml-2">Minha empresa está cadastrada</label>
        </div>

        <div className="flex items-center mb-2">
          <input
            type="radio"
            id="newCompany"
            checked={!companyRegistered}
            onChange={() => {
              setCompanyRegistered(false);
              setContactCompany(false);
            }}
          />
          <label htmlFor="newCompany" className="ml-2">Cadastrar nova empresa</label>
        </div>

        {!companyRegistered && (
          <>
            <input
              required
              type="text"
              placeholder="Nome da empresa *"
              className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <input
              required
              type="text"
              placeholder="CNPJ *"
              maxLength={14}
              className={`border ${cnpjError ? 'border-red-500' : 'border-gray-300'} px-4 py-2 mb-2 rounded-md w-full lg:w-8/12`}
              value={formattedCnpj}
              onChange={handleCnpjChange}
            />
            {cnpjError && <p className="text-red-500 text-xs  mb-1">{cnpjError}</p>}

            <input
              type="text"
              placeholder="Rua"
              className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <input
              type="text"
              placeholder="Cidade"
              className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              type="text"
              placeholder="Estado"
              className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <input
              type="text"
              placeholder="Email da empresa"
              className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Telefone"
              className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

          </>
        )}

        <Button type="submit" disabled={companyRegistered ? true : false} text={loading ? 'Cadastrando...' : 'Cadastrar'} loading={loading} />
      </form>
    </div>
  );
};

export default RegisterForm;
