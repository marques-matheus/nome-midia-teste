'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Spinner } from 'flowbite-react';
import { Company } from '@/types';
import { get_company, delete_company } from '@/utils/firebase';





const listaEmpresas: React.FC = () => {
    const [empresas, setEmpresas] = useState<Company[]>([]);
    const [deleteSucesso, setDeleteSucesso] = useState(false);

    const [selectedEmpresa, setSelectedEmpresa] = useState<Company | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEmpresas = async () => {
            setLoading(true);
            try {
                const { empresasSnapshot } = await get_company();
                const fetchEmpresas: Company[] = [];
                for (const doc of empresasSnapshot.docs) {
                    const empresaData = doc.data();
                    const empresa: Company = {
                        uid: doc.id,
                        name: empresaData.name,
                        users: [],
                        artists: [],
                    };
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
            delete_company(empresaId);
            setSelectedEmpresa(null);

            const updatedEmpresas = empresas.filter((empresa) => empresa.uid !== empresaId);
            setLoading(true)
            setEmpresas(updatedEmpresas);
            setTimeout(() => setLoading(false), 800);
            setTimeout(() => setDeleteSucesso(true), 1000);
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
                            <tr className="items-center w-full px-5">
                                <th scope="col" className="py-3">
                                    Empresa
                                </th>
                                <th scope="col" className="py-3">
                                    Usuários
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
                                    <td colSpan={4} className="py-4 text-center text-gray-500">
                                        Não existem empresas cadastradas
                                    </td>
                                </tr>
                            ) : (
                                empresas.map((empresa, index) => (
                                    <tr
                                        key={empresa.uid}
                                        className="bg-white border-b  hover:bg-gray-50"
                                    >
                                        <td className="py-4 px-5 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
                                            {empresa.name}
                                        </td>
                                        <td className="py-4 px-5 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
                                            {empresa.users?.length}
                                        </td>
                                        <td className="py-4 px-5 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
                                            {empresa.artists?.length}
                                        </td>
                                        <td className="py-4 px-5 text-sm font-medium text-center  whitespace-nowrap">
                                            <button
                                                onClick={() => {
                                                    deleteEmpresa(empresa.uid)
                                                }}
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>

                                ))
                            )}
                        </tbody>
                    </table>
                    }
                </div>
            </Layout>
        </>
    );
};

export default listaEmpresas;