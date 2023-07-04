'use client';
import { useState } from 'react';
import { auth, firestore } from '../../../firebase';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { Spinner } from 'flowbite-react';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { user } = await auth.createUserWithEmailAndPassword(email, password);
      if (user) {
        await user.updateProfile({ displayName }); // Atualizar o nome do usuário
        const empresaRef = firestore.collection('empresas').doc();
        const userRef = firestore.collection('users').doc(user.uid);

        await empresaRef.set({ nomeEmpresa }); // Salvar o nome da empresa no Firestore
        await userRef.set({ displayName, empresaId: empresaRef.id }); // Salvar o nome do usuário, ID da empresa no Firestore

        // Verificar se é o primeiro usuário registrado
        const usersSnapshot = await firestore.collection('users').get();
        const isFirstUser = usersSnapshot.size === 1;

        if (isFirstUser) {
          // Definir o primeiro usuário registrado como administrador
          await userRef.update({ isAdmin: true });
        } else {
          // Definir os demais usuários como não administradores
          await userRef.update({ isAdmin: false });
        }

        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
        router.push('/'); // Redirecionar para a página do painel após o registro bem-sucedido
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Este e-mail já foi cadastrado');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Email inválido');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Senha muito fraca, a senha deve ter no mínimo 6 caracteres');
      } else if (error.code === 'auth/invalid-password') {
        setErrorMessage('Senha inválida');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Email inválido');
      } else {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full  m-auto mt-56">
      <h1 className="text-2xl font-bold mb-4">Registrar</h1>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <form className="flex flex-col items-center lg:w-6/12 shadow-lg p-10" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nome do usuário"
          className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nome da empresa"
          className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
          value={nomeEmpresa}
          onChange={(e) => setNomeEmpresa(e.target.value)}
        />
        <input
          type="email"
          placeholder="E-mail"
          className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          className="border border-gray-300 px-4 py-2 mb-2 rounded-md w-full lg:w-8/12"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" text={loading ? 'Registrando...' : 'Entrar'} loading={loading} />
      </form>
    </div>
  );
};

export default RegisterForm;
