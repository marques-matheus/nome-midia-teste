'use client';
import { useState, useEffect } from 'react';
import { auth, firestore } from '../../../firebase';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

const RegisterAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [salvamentoSucesso, setSalvamentoSucesso] = useState(false);
    const [salvamentoErro, setSalvamentoErro] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>();
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user: any) => {
            setCurrentUser(user);

            if (user) {
                firestore
                    .collection('users')
                    .doc(user.uid)
                    .get()
                    .then((doc) => {
                        if (doc.exists) {
                            const userData: any = doc.data();
                            setCurrentUser((prevUser: any) => ({
                                ...prevUser,
                                isAdmin: userData.isAdmin,
                                displayName: userData.displayName,

                            }));
                        }
                    })
                    .catch((error) => {

                    });
            }
            console.log(user);
        });

        return () => {
            unsubscribe();
        };
    }, []);
    useEffect(() => {
        const checkUserAuthentication = () => {
            const user = auth.currentUser;
            if (!user || (currentUser && !currentUser.isAdmin)) {
                // Redireciona para outra página, caso o usuário não esteja logado ou não seja um administrador
                router.push('/');
            }
        };
        checkUserAuthentication();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            const { user } = await auth.createUserWithEmailAndPassword(email, password);

            if (user) {
                await user.updateProfile({ displayName }); // Atualizar o nome do usuário
                const empresaRef = firestore.collection('empresas').doc();
                const userRef = firestore.collection('users').doc(user.uid);

                await Promise.all([
                    empresaRef.set({ nomeEmpresa }), // Salvar o nome da empresa no Firestore
                    userRef.set({ displayName, empresaId: empresaRef.id, isAdmin: false }) // Salvar o nome do usuário e ID da empresa no Firestore
                ]);

                setTimeout(() => setLoading(false), 300);
                setSalvamentoSucesso(true);
                setTimeout(() => setSalvamentoSucesso(false), 2000);

                // Redirecionar o admin para a página desejada
                router.push('/');
            }
        } catch (error: any) {
            setSalvamentoErro(true);
            setTimeout(() => setSalvamentoErro(false), 2000);
        }
    };


    return (
        <Layout>

            <div className="flex flex-col items-center w-full m-auto mt-24">
                {salvamentoSucesso && (
                    <span className="text-center bg-green-100 border-2 border-green-600 text-lg font-bold w-full rounded py-2 mb-10 px-10 mx-auto text-green-500">
                        Usuario salvo com sucesso!
                    </span>
                )}
                {salvamentoErro && (
                    <span className="text-center bg-red-100 border-2 border-red-600 text-lg font-bold w-full rounded py-2 mb-10 px-10 mx-auto text-red-500">
                        Erro ao salvar usuario. este email já está em uso.
                    </span>
                )}
                <h1 className="text-2xl font-bold mb-4">Registrar</h1>

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
                    <Button loading={loading} type="submit" text={loading ? 'Registrando...' : 'Registrar usuario'} />
                </form>
            </div>
        </Layout>
    );
};

export default RegisterAdmin;
