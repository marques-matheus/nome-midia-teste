'use client';
import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../../../firebase';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import axios from 'axios';
import { Spinner } from 'flowbite-react';
import Button from '@/components/Button';
import Link from 'next/link';

interface Nome {
    id: string;
    nome: string;
    palavrasChave: string[];
    ultimaSincronizacao: Date | null;
    ultimaDataRetorno: Date | null;
}

const ListaNomes: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Nome | null>(null);
    const [nomes, setNomes] = useState<Nome[]>([]);
    const [salvamentoSucesso, setSalvamentoSucesso] = useState(false);
    const [deleteSucesso, setDeleteSucesso] = useState(false);
    const [salvamentoErro, setSalvamentoErro] = useState(false);
    const [erroFetch, setErroFetch] = useState(false);
    const [nomesComErro, setNomesComErro] = useState<string[]>([]);
    const [quantidadeArtigos, setQuantidadeArtigos] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [loadingSync, setLoadingSync] = useState(false);
    const [selectedArtista, setSelectedArtista] = useState<Nome | null>(null);


    useEffect(() => {
        const fetchNomes = async () => {
            try {
                setLoading(true);

                const user = auth.currentUser;
                if (user) {
                    const userSnapshot = await firestore
                        .collection('users')
                        .doc(user.uid)
                        .get();
                    const empresaID = userSnapshot.data()?.empresaId;

                    if (empresaID) {
                        const nomesSnapshot = await firestore
                            .collection('artistas')
                            .where('empresaId', '==', empresaID)
                            .get();

                        const nomesData: Nome[] = [];
                        nomesSnapshot.forEach((doc) => {
                            nomesData.push({
                                id: doc.id, ultimaSincronizacao: null,
                                ultimaDataRetorno: null, ...doc.data()
                            } as Nome);
                        });

                        setNomes(nomesData);
                    }
                }

                setTimeout(() => setLoading(false), 500);
            } catch (error) {
                console.error(error);
            }
        };
        fetchNomes();

    }, []);
    const handleOpenModal = async (item: Nome) => {
        setSelectedItem(item);
        setIsModalOpen(true);

        try {

            const artigosSnapshot = await firestore.collection('materias').where('idArtista', '==', item.id).get();

            const artigosData: any = [];
            artigosSnapshot.forEach((doc) => {
                artigosData.push({ id: doc.id, ...doc.data() });
            });


            console.log(artigosData);
        } catch (error) {
            console.error(error);
        }
    };


    const sincronizarArtigos = async () => {
        try {
            setLoadingSync(true);
            setNomesComErro([]);

            const apiKey = process.env.NEXT_PUBLIC_API_KEY;
            const searchEngineId = process.env.NEXT_PUBLIC_ENGINE_ID;

            const batch = firestore.batch();
            const materiasRef = firestore.collection('materias');
            const artistasRef = firestore.collection('artistas');

            const existingArtigos: string[] = [];

            const nomesData: Nome[] = [...nomes];
            let quantidadeArtigosNovos = 0; // Variável para armazenar a quantidade de artigos novos

            for (const nome of nomesData) {
                try {
                    const query = `artigos e matérias sobre "${nome.nome}", {${nome.palavrasChave.join(' ')}} -twitter `;
                    const url = `https://customsearch.googleapis.com/customsearch/v1?cx=${searchEngineId}&key=${apiKey}&q=${query}&dateRestrict=d1`;

                    const response = await axios.get(url);
                    const artigos = response.data.items.slice(0, 10);

                    const autorQuerySnapshot = await artistasRef.where('nome', '==', nome.nome).limit(1).get();
                    const artistaId = autorQuerySnapshot.docs[0].id;

                    const existingArtigosQuerySnapshot = await materiasRef.where('idArtista', '==', artistaId).get();
                    existingArtigosQuerySnapshot.forEach((doc) => {
                        existingArtigos.push(doc.data().titulo);
                    });

                    artigos.forEach((artigo: any) => {
                        const titulo = artigo.title;

                        if (!existingArtigos.includes(titulo)) {
                            const materiaData = {
                                nomeArtista: nome.nome,
                                titulo: artigo.title,
                                descricao: artigo.snippet,
                                url: artigo.link,
                                idArtista: artistaId,
                            };

                            const materiaDocRef = materiasRef.doc();
                            batch.set(materiaDocRef, materiaData);

                            quantidadeArtigosNovos++; // Incrementa a contagem de artigos novos
                        }
                    });
                    const ultimaSincronizacao = new Date();
                    const ultimaDataRetorno = new Date();

                    nome.ultimaSincronizacao = ultimaSincronizacao;
                    quantidadeArtigosNovos === 0 ? nome.ultimaDataRetorno = nome.ultimaDataRetorno : nome.ultimaDataRetorno = ultimaDataRetorno;

                    const nomeRef = firestore.collection('artistas').doc(nome.id);
                    batch.update(nomeRef, {
                        ultimaSincronizacao: ultimaSincronizacao.toISOString(),
                        ultimaDataRetorno: ultimaDataRetorno.toISOString(),
                    });


                } catch (error) {
                    const nomeRef = firestore.collection('artistas').doc(nome.id);
                    const ultimaSincronizacao = new Date();
                    nome.ultimaSincronizacao = ultimaSincronizacao;
                    batch.update(nomeRef, {
                        ultimaSincronizacao: ultimaSincronizacao.toISOString(),

                    });
                    setErroFetch(true);
                    setNomesComErro(prevNomes => [...prevNomes, nome.nome]);
                    setTimeout(() => setErroFetch(false), 2500);
                }

            }
            setTimeout(() => {
                setLoadingSync(false);
            }, 500)


            await batch.commit();
            setQuantidadeArtigos(existingArtigos.length);
            setSalvamentoSucesso(true);
            setQuantidadeArtigos(quantidadeArtigosNovos);
            setTimeout(() => setSalvamentoSucesso(false), 1500);
            console.log(`${quantidadeArtigosNovos} artigos novos salvos.`);

        } catch (error) {
            console.error(error);
            setSalvamentoErro(true);
            setTimeout(() => setSalvamentoErro(false), 1500);
            setLoadingSync(false);
        }
    };

    const deleteArtista = async (artistaId: string) => {
        try {
            await firestore.collection('artistas').doc(artistaId).delete();
            await firestore.collection('materias').where('idArtista', '==', artistaId).get()
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        doc.ref.delete();
                    });
                })
            setSelectedArtista(null);
            const updateNomes = nomes.filter((artista) => artista.id !== artistaId);
            setLoading(true);
            setNomes(updateNomes);
            setTimeout(() => setLoading(false), 800);
            setTimeout(() => setDeleteSucesso(true), 1000);
            setTimeout(() => setDeleteSucesso(false), 800);
        } catch (error) {
            console.error(error);
        }
    };

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
                                        <td colSpan={4} className="py-4 text-center text-gray-500">
                                            Não existem nomes cadastrados
                                        </td>
                                    </tr>
                                ) : (
                                    nomes.map((nome) => (
                                        <tr key={nome.id} className="bg-white border-b">
                                            <td scope="row" className="py-4 px-2 font-medium text-center text-gray-900">
                                                {nome.nome}
                                            </td>
                                            <td className="py-4 px-2 text-center">
                                                {nome.ultimaSincronizacao ? formatarData(nome.ultimaSincronizacao) : 'Não sincronizado'}
                                            </td>
                                            <td className="py-4 px-2 text-center">
                                                {nome.ultimaDataRetorno ? formatarData(nome.ultimaDataRetorno) : 'Sem resultados'}
                                            </td>
                                            <td className="py-4 px-2 flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-3">
                                                <button className="font-medium text-white rounded-md hover:bg-blue-700 bg-blue-600 p-2">
                                                    <Link href={`/detalhes/${nome.id}`}>
                                                        Detalhes
                                                    </Link>
                                                </button>
                                                <button onClick={() => deleteArtista(nome.id)} className="font-medium text-white rounded-md hover:bg-red-700 bg-red-600 p-2">
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        }
                        <Button type="button" onClick={sincronizarArtigos} text={loadingSync ? 'Sincronizando...' : 'Sincronizar Artigos'} loading={loadingSync} />
                    </div>
                </div>


                {isModalOpen && <Modal selectedItem={selectedItem} closeModal={() => setIsModalOpen(false)} />}
            </Layout >
        </>
    );
};

export default ListaNomes;
