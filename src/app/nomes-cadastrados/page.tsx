'use client';
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';;
import { Spinner } from 'flowbite-react';
import Button from '@/components/Button';
import Link from 'next/link';
import { Artist } from '@/types';
import { getArtistsForCompany, delete_artist } from '@/utils/firebase';
import useSyncArticles from '@/hooks/useSyncArticles';
import { useGetUserInfo } from '@/hooks/useGetUserInfo';


const ListaNomes: React.FC = () => {

    const [nomes, setNomes] = useState<Artist[]>([]);
    const [deleteSucesso, setDeleteSucesso] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedArtista, setSelectedArtista] = useState<Artist | null>(null);
    const { company } = useGetUserInfo();

    const { erroFetch, loadingSync, nomesComErro, quantidadeArtigos, salvamentoErro, salvamentoSucesso, allArtistsSelected, selectedArtistas, setAllArtistsSelected, setSelectedArtistas, sincronizarArtigos } = useSyncArticles(nomes);


    useEffect(() => {
        const fetchNomes = async () => {
            try {
                if (company && company.uid) {
                    const artists = await getArtistsForCompany(company.uid);
                    setNomes(artists);
                   setTimeout(() => setLoading(false), 500);
                } else {
                  
                    console.log("ID da empresa não disponível");
                }
            } catch (error) {
                console.error(error);
            }
        };
    
        fetchNomes();
    }, [company]);
    

    const deleteArtista = async ({ id }: { id: string | undefined }) => {
        await delete_artist(id, company?.uid);
        setSelectedArtista(null);
        const updateNomes = nomes.filter((artista) => artista.id !== id);
        setLoading(true);
        setNomes(updateNomes);
        setTimeout(() => setLoading(false), 800);
        setTimeout(() => setDeleteSucesso(true), 1000);
       setDeleteSucesso(false)
    }


    function formatarData(data: any) {
        const options: any = {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Sao_Paulo',

        };

        const formatter = new Intl.DateTimeFormat('pt-BR', options);
        return formatter.format(new Date(data));
    }
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setAllArtistsSelected(true);
            setSelectedArtistas(
                nomes
                    .filter((artista) => artista.id !== undefined)
                    .map((artista) => artista.id!)
            );
        } else {
            setAllArtistsSelected(false);
            setSelectedArtistas([]);
        }
    };


    const handleSelectArtista = (event: React.ChangeEvent<HTMLInputElement>, artistaId: string) => {
        if (event.target.checked) {
            setSelectedArtistas((prevSelectedArtistas) => [...prevSelectedArtistas, artistaId]);
        } else {
            setSelectedArtistas((prevSelectedArtistas) => prevSelectedArtistas.filter((id) => id !== artistaId));
        }
    };

    return (
        <>
            <Layout>
                <div className="flex flex-col w-full">

                    <div className="relative py-10 w-full md:w-10/12 mx-auto md:ml-32 lg:ml-48 h-fit flex items-center justify-around flex-col overflow-x-auto shadow-md sm:rounded-lg">
                        {salvamentoSucesso && (
                            quantidadeArtigos > 0 ? <span className="text-center bg-green-100 border-2 border-green-600 text-lg font-bold w-6/12 self-center rounded py-2 mb-10 px-10 mx-auto text-green-500">
                                {quantidadeArtigos} artigos salvos com sucesso. </span> : <span className="text-center bg-red-100 border-2 border-red-600 text-lg font-bold w-6/12 self-center rounded py-2 mb-10 px-10 mx-auto text-red-500">
                                Nenhum artigo novo encontrado </span>
                        )}
                        {salvamentoErro && (
                            <span className="text-center bg-red-100 border-2 border-red-600 text-lg font-bold w-6/12 self-center rounded py-2 mb-10 px-10 mx-auto text-red-500">
                                Erro ao salvar artigos. Tente novamente mais tarde.
                            </span>
                        )}
                        {erroFetch && (
                            <span className="text-center bg-red-100 border-2 border-red-600 text-lg font-bold w-6/12 self-center rounded py-2 mb-10 px-10 mx-auto text-red-500">
                                Nenhum artigo novo encontrado para o(s) artista(s): {nomesComErro.map((nome, index) => (
                                    index === nomesComErro.length - 1 ? nome : nome + ', '
                                ))}.
                            </span>
                        )}
                        {deleteSucesso && (
                            <span className="text-center bg-green-100 border-2 border-green-600 text-lg font-bold w-6/12 self-center rounded py-2 mb-10 px-10 mx-auto text-green-500">
                                Artista deletado com sucesso.
                            </span>
                        )}
                        {loading ? <Spinner size="xl" /> : <table className="w-full text-sm text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3">
                                        <input type="checkbox" checked={selectedArtistas.length === nomes.length} onChange={handleSelectAll} />
                                    </th>
                                    <th scope="col" className="py-3">
                                        Nome
                                    </th>
                                    <th scope="col" className="py-3">
                                        Última Sincronização
                                    </th>
                                    <th scope="col" className="py-3">
                                        Última Data de Retorno
                                    </th>
                                    <th scope="col" className="py-3">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {nomes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-4 text-center text-gray-500">
                                            Não existem nomes cadastrados
                                        </td>
                                    </tr>
                                ) : (
                                    nomes.map((nome, index) => (
                                        <tr key={index} className="bg-white border-b">
                                            <td scope="row" className="py-4 px-2 font-medium text-center text-gray-900">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedArtistas.includes(nome.id ?? '')}
                                                    onChange={(event) => handleSelectArtista(event, nome.id ?? '')}
                                                />
                                            </td>
                                            <td scope="row" className="py-4 px-2 font-medium text-center text-gray-900">
                                                {nome.name}
                                            </td>
                                            <td className="py-4 px-2 text-center">
                                                {nome.last_sync ? formatarData(nome.last_sync) : 'Não sincronizado'}
                                            </td>
                                            <td className="py-4 px-2 text-center">
                                                {nome.last_return ? formatarData(nome.last_return) : 'Sem resultados'}
                                            </td>
                                            <td className="py-4 px-2 flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-3">
                                                <button className="font-medium text-white rounded-md hover:bg-blue-700 bg-blue-600 p-2">
                                                    <Link href={`/detalhes/${nome.id}`}>Detalhes</Link>
                                                </button>
                                                <button onClick={() => deleteArtista({ id: nome.id })} className="font-medium text-white rounded-md hover:bg-red-700 bg-red-600 p-2">
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        }
                        <Button type="button" disabled={nomes.length === 0} onClick={sincronizarArtigos} text={loadingSync ? 'Sincronizando...' : 'Sincronizar Artigos'} loading={loadingSync} />
                    </div>
                </div>



            </Layout >
        </>
    );
};

export default ListaNomes;
