'use client';
import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../../../firebase';
import Layout from '@/components/Layout';
import { Spinner } from 'flowbite-react';



interface User {
    id: string;
    nome: string;
}

const ListaUsuarios: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const usersSnapshot = await firestore.collection('users').get();
                const fetchedUsers: User[] = [];
                usersSnapshot.forEach((doc) => {
                    const user = { id: doc.id, nome: doc.data().displayName };
                    fetchedUsers.push(user);
                });
                setUsers(fetchedUsers);
                setTimeout(() => setLoading(false), 500);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUsers();
    }, []);

    const deleteUser = async (userId: string) => {
        try {
            await firestore.collection('users').doc(userId).delete();
            setSelectedUser(null);
            
            const updatedUsers = users.filter((user) => user.id !== userId);
            setUsers(updatedUsers);
        } catch (error) {
            console.error(error);
        }
    };



    return (
        <>
            <Layout>
                <div className="relative w-full md:w-10/12 mx-auto md:ml-32 lg:ml-48 h-fit py-10 flex items-center justify-around flex-col overflow-x-auto shadow-md sm:rounded-lg">

                    {loading ? <Spinner size="xl" /> : <table className="w-full text-sm text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr className="flex flex-row justify-between items-center w-full lg:px-10 xl:px-16 px-5">
                                <th scope="col" className="py-3">
                                    Nome
                                </th>
                                <th scope="col" className="py-3">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="py-4 text-center text-gray-500">
                                        Não existem usuários cadastrados
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="bg-white border-b flex flex-row justify-between items-center w-full lg:px-10 xl:px-16 px-5"
                                    >
                                        <th
                                            scope="row"
                                            className="py-4 font-medium text-left text-gray-900 whitespace-nowrap"
                                        >
                                            {user.nome}
                                        </th>
                                        <td className="py-4 flex flex-col md:flex-row self-center justify-center items-center space-y-2 md:space-y-0 md:space-x-3">
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="bg-red-500 text-white px-4 py-2 rounded-md"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>}
                </div>
            </Layout>
        </>
    );
};

export default ListaUsuarios;