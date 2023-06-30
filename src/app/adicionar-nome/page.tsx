'use client';
import React, { useState } from 'react';
import { firestore } from '../../../firebase';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Layout from '@/components/Layout';
import { useAuth } from '../../../hooks/useAuth';


interface Nome {
  nome: string;
  empresaId: string;
  palavrasChave: string[];
}

const AdicionarNome: React.FC = () => {
  const { user } = useAuth();
  const [nomeInput, setNomeInput] = useState('');
  const [infoInput, setInfoinput] = useState('');
  const [salvamentoSucesso, setSalvamentoSucesso] = useState(false);
  const [salvamentoErro, setSalvamentoErro] = useState(false);
  const [loading, setLoading] = useState(false);
  const adicionarNome = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nomes = nomeInput.split(',');
    const infos = infoInput.split(',');
    const nomesRef = firestore.collection('artistas');
    const promises = nomes.map(async (nome) => {
      const nomeData: Nome = {
        nome: nome.trim(),
        palavrasChave: infoInput.trim().split(' '),
        empresaId: '',
      };
      try {
        // Consultar o documento do usuário para obter o campo empresaId
        const userRef = firestore.collection('users').doc(user?.uid);
        const userSnapshot = await userRef.get();

        if (userSnapshot.exists) {
          const userData = userSnapshot.data();
          if (userData?.empresaId) {
            nomeData.empresaId = userData.empresaId;
            await nomesRef.add(nomeData);
          }
        }
        setLoading(true);
        setTimeout(() => setLoading(false), 300);
        setTimeout(() => setSalvamentoSucesso(true), 500);
        setTimeout(() => setSalvamentoSucesso(false), 1500);
      } catch (error) {
        console.error(error);
        setSalvamentoErro(true);
        setTimeout(() => setSalvamentoErro(false), 1500);
      }
    });

    try {
      await Promise.all(promises);
      setNomeInput('');
      setInfoinput('');
    } catch (error) {
      console.error(error);
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
        <form className="w-full " onSubmit={adicionarNome}>
          <Input
            required={true}
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
            Adicione palavras chaves adicionais, como area de atuação, evento realacionado e etc... Exemplo:"Jogador, Futebol, Apresentador" 
          </p>
          <Button loading={loading} text={loading ? 'Salvando...' : '+ Salvar'} type="submit" />
        </form>
      </div>
    </Layout>
  );
};

export default AdicionarNome;
