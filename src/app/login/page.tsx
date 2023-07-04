'use client';
import { useEffect, useState } from 'react';
import { auth } from '../../../firebase';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import Button from '@/components/Button';

const Entrar: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await auth.signInWithEmailAndPassword(email, password);
      router.push('/'); // Redirecionar para a página do painel após o login bem-sucedido
    } catch (error: any) {
      if (error.code === 'auth/invalid-email') {
        setErrorMessage('Email inválido');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage('Email não cadastrado');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('Senha incorreta');
      } else {
        setErrorMessage(error.message);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/'); // Redirecionar para a página do painel se o usuário estiver logado
      }
    });

    return () => unsubscribe();
  }, []);


  return (
    <div className="flex flex-col items-center w-full  m-auto mt-56">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <form className="flex flex-col items-center lg:w-6/12 shadow-lg p-10" onSubmit={handleLogin}>
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
        <Button
          type="submit"

          text="Entrar"
        />
      </form>

    </div>
  );
};

export default Entrar;
