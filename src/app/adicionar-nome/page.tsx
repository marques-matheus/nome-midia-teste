'use client';
import React, { useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Layout from '@/components/Layout';
import useSaveArtistRegister from '@/hooks/useSaveArtistRegister';
import { useGetUserInfo } from '@/hooks/useGetUserInfo';



const AdicionarNome: React.FC = () => {
  const { company } = useGetUserInfo();
  const [nomeInput, setNomeInput] = useState('');
  const [infoInput, setInfoinput] = useState('');
  const {
    newArtistName,
    artistNameError,
    saveArtists,
    validateArtistNames,
    loading,
    salvamentoSucesso,
    salvamentoErro
  } = useSaveArtistRegister(company?.uid, nomeInput.split(','), infoInput.split(','));



  const handleSaveArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    validateArtistNames();
    if (!artistNameError) {
      await saveArtists();
      setNomeInput('');
    }
  };


  return (
    <Layout>

      <div className="flex flex-col md:w-2/3 md:ml-32 w-full ">
        {salvamentoSucesso && (
          <span className="text-center bg-green-100 border-2 border-green-600 text-lg font-bold w-full rounded py-2 mb-10 px-10 mx-auto text-green-500">
            Nome(s) salvo(s) com sucesso!
          </span>
        )}
        {salvamentoErro && (
          <span className="text-center bg-red-100 border-2 border-red-600 text-lg font-bold w-full rounded py-2 mb-10 px-10 mx-auto text-red-500">
            Erro ao salvar nome(s). Tente novamente mais tarde.
          </span>
        )}
        <form className="w-full " onSubmit={handleSaveArtist}>
          <Input
            required
            type="text"
            placeholder="Adicionar nome"
            value={nomeInput}
            onChange={(event) => setNomeInput(event.target.value)}
          />
          <p id="helper-text-explanation" className="mt-2 mb-5 text-sm text-gray-500 dark:text-gray-400">
            Adicione um ou mais nomes, separados por vírgula. Exemplo: "Frederico, Paulo, João"
          </p>
          <Input

            type="text"
            placeholder="Palavras chave"
            value={infoInput}
            onChange={(event) => setInfoinput(event.target.value)}
          />
          <p id="helper-text-explanation" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Adicione palavras chaves adicionais, como area de atuação, evento relacionado e etc... Exemplo:"Jogador, Futebol, Apresentador"
          </p>
          <Button loading={loading} text={loading ? 'Salvando...' : '+ Salvar'} type="submit" />
        </form>
      </div>
    </Layout>
  );
};

export default AdicionarNome;
