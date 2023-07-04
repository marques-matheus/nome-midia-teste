'use client';
import { useState, useEffect } from 'react';
import { firestore, auth } from '../../../firebase';
import Layout from '@/components/Layout';
import { Spinner } from 'flowbite-react';



interface Empresa {
    id: string;
    nomeEmpresa: string;
    usuarios: number;
    nomes: number;
}

const listaEmpresas: React.FC = () => {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [deleteSucesso, setDeleteSucesso] = useState(false);

    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEmpresas = async () => {
            setLoading(true);
            try {
                const empresasSnapshot = await firestore.collection('empresas').get();
                const fetchEmpresas: Empresa[] = [];
                for (const doc of empresasSnapshot.docs) {
                    const empresaData = doc.data();
                    const empresa: Empresa = {
                        id: doc.id,
                        nomeEmpresa: empresaData.nomeEmpresa,
                        usuarios: 0,
                        nomes: 0,
                    };

                    // Consulta para obter a contagem de usuários para a empresa atual
                    const usuariosSnapshot = await firestore
                        .collection('users')
                        .where('empresaId', '==', empresa.id)
                        .get();
                    empresa.usuarios = usuariosSnapshot.size;

                    // Consulta para obter a contagem de artistas para a empresa atual
                    const artistasSnapshot = await firestore
                        .collection('artistas')
                        .where('empresaId', '==', empresa.id)
                        .get();
                    empresa.nomes = artistasSnapshot.size;

                    fetchEmpresas.push(empresa);
                }

                setEmpresas(fetchEmpresas);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };

        fetchEmpresas();
    }, []);



    const deleteEmpresa = async (empresaId: string) => {
        try {
            await firestore.collection('empresas').doc(empresaId).delete();
            setSelectedEmpresa(null);

            const updatedEmpresas = empresas.filter((empresa) => empresa.id !== empresaId);
            setLoading(true)
            setEmpresas(updatedEmpresas);
            setTimeout(() => setLoading(false), 800);
            setTimeout(() => setDeleteSucesso(true),1000);
            setTimeout(() => setDeleteSucesso(false), 800);
        } catch (error) {
            console.error(error);
        }
    };



    return (
        <>
            <Layout>
                <div className="relative w-full md:w-10/12 mx-auto md:ml-32 lg:ml-48 h-fit py-10 flex items-center justify-around flex-col overflow-x-auto shadow-md sm:rounded-lg">
                {deleteSucesso && (
                        <span className="text-center bg-green-100 border-2 border-green-600 text-lg font-bold w-6/12 self-center rounded py-2 mb-10 px-10 mx-auto text-green-500">
                            Empresa deletada com sucesso.
                        </span>
                    )}
                    {loading ? <Spinner size="xl" /> : <table className="w-full text-sm text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr className="flex flex-row justify-between items-center w-full lg:px-10 xl:px-16 px-5">
                                <th scope="col" className="py-3">
                                    Empresa
                                </th>
                                <th scope="col" className="py-3">
                                    Usuarios
                                </th>
                                <th scope="col" className="py-3">
                                    Artistas
                                </th>
                                <th scope="col" className="py-3">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {empresas.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="py-4 text-center text-gray-500">
                                        Não existem empresas cadastradas
                                    </td>
                                </tr>
                            ) : (
                                empresas.map((empresa) => (
                                    <tr
                                        key={empresa.id}
                                        className="bg-white border-b flex flex-row justify-between items-center w-full px-5 "
                                    >
                                        <th
                                            scope="row"
                                            className="py-4 font-medium text-left text-gray-900 "
                                        >
                                            {empresa.nomeEmpresa}
                                        </th>
                                        <th
                                            scope="row"
                                            className="py-4 font-medium text-center text-gray-900 "
                                        >
                                            {empresa.usuarios}
                                        </th>
                                        <th
                                            scope="row"
                                            className="py-4 font-medium text-center text-gray-900 "
                                        >
                                            {empresa.nomes}
                                        </th>
                                        <td className="py-4 flex flex-col md:flex-row self-center justify-center items-center space-y-2 md:space-y-0 md:space-x-3">
                                            <button
                                                onClick={() => deleteEmpresa(empresa.id)}
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

export default listaEmpresas;