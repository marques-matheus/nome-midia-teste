'use client';
import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../../../firebase';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import axios from 'axios';
import { Spinner } from 'flowbite-react';
import Button from '@/components/Button';

interface Nome {
    id: string;
    nome: string;
    palavrasChave: string[];
}

const ListaNomes: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Nome | null>(null);
    const [nomes, setNomes] = useState<Nome[]>([]);
    const [salvamentoSucesso, setSalvamentoSucesso] = useState(false);
    const [salvamentoErro, setSalvamentoErro] = useState(false);
    const [quantidadeArtigos, setQuantidadeArtigos] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [loadingSync, setLoadingSync] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Nome | null>(null);


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
                            nomesData.push({ id: doc.id, ...doc.data() } as Nome);
                        });

                        // Armazena os nomes no localStorage
                        localStorage.setItem('nomes', JSON.stringify(nomesData));

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
            const apiKey = process.env.NEXT_PUBLIC_API_KEY;
            const searchEngineId = process.env.NEXT_PUBLIC_ENGINE_ID;

            const batch = firestore.batch();
            const materiasRef = firestore.collection('materias');
            const artistasRef = firestore.collection('artistas');

            const existingArtigos: string[] = [];

            const nomesData: Nome[] = [...nomes];
            let quantidadeArtigosNovos = 0; // Variável para armazenar a quantidade de artigos novos

            for (const nome of nomesData) {
                const query = `artigos e matérias sobre "${nome.nome}", {${nome.palavrasChave.join(' ')}} -twitter `;
                const url = `https://customsearch.googleapis.com/customsearch/v1?cx=${searchEngineId}&key=${apiKey}&q=${query}&dateRestrict=d1`;

                const response = await axios.get(url);
                const artigos = response.data.items.slice(0, 50);

                const autorQuerySnapshot = await artistasRef.where('nome', '==', nome.nome).limit(1).get();
                const autorId = autorQuerySnapshot.docs[0].id;

                const existingArtigosQuerySnapshot = await materiasRef.where('idAutor', '==', autorId).get();
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
                            idArtista: autorId,
                        };

                        const materiaDocRef = materiasRef.doc();
                        batch.set(materiaDocRef, materiaData);

                        quantidadeArtigosNovos++; // Incrementa a contagem de artigos novos
                    }
                });
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
            setSelectedUser(null);

            const updateNomes = nomes.filter((artista) => artista.id !== artistaId);
            setNomes(updateNomes);
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <>
            <Layout>
                <div className="flex flex-col w-full">
                    {salvamentoSucesso && (
                        <span className="text-center bg-green-100 border-2 border-green-600 text-lg font-bold w-6/12 self-center rounded py-2 mb-10 px-10 mx-auto text-green-500">
                            {quantidadeArtigos} artigos salvos com sucesso.
                        </span>
                    )}
                    {salvamentoErro && (
                        <span className="text-center bg-red-100 border-2 border-red-600 text-lg font-bold w-6/12 self-center rounded py-2 mb-10 px-10 mx-auto text-red-500">
                            Erro ao salvar artigos. Tente novamente mais tarde.
                        </span>
                    )}
                    <div className="relative py-10 w-full md:w-10/12 mx-auto md:ml-32 lg:ml-48 h-fit flex items-center justify-around flex-col overflow-x-auto shadow-md sm:rounded-lg">
                        {loading ? <Spinner size="xl" /> : <table className="w-full text-sm  text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr className='flex flex-row justify-between items-center w-full lg:px-10 xl:px-16 px-5'>
                                    <th scope="col" className=" py-3">
                                        Nome
                                    </th>

                                    <th scope="col" className=" py-3">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {nomes.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-4 text-center text-gray-500">
                                            Não existem nomes cadastrados
                                        </td>
                                    </tr>
                                ) : (
                                    nomes.map((nome) => (
                                        <tr key={nome.id} className="bg-white border-b flex flex-row justify-between items-center w-full lg:px-10 xl:px-16 px-5">
                                            <th scope="row" className=" py-4 font-medium text-left text-gray-900 whitespace-nowrap">
                                                {nome.nome}
                                            </th>

                                            <td className=" py-4 flex flex-col md:flex-row self-center justify-center items-center space-y-2 md:space-y-0 md:space-x-3">
                                                <button onClick={() => handleOpenModal(nome)} className="font-medium text-white rounded-md hover:bg-blue-700 w-fit bg-blue-600 p-2">
                                                    Detalhes
                                                </button>
                                                <button
                                                    onClick={() => deleteArtista(nome.id)}
                                                    className="font-medium text-white rounded-md hover:bg-red-700 w-fit bg-red-600 p-2">
                                                    Excluir
                                                </button>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>


                        </table>}
                        <Button type="button" onClick={sincronizarArtigos} text={loadingSync ? 'Sincronizando...' : 'Sincronizar Artigos'} loading={loadingSync} />
                    </div>
                </div>


                {isModalOpen && <Modal selectedItem={selectedItem} closeModal={() => setIsModalOpen(false)} />}
            </Layout>
        </>
    );
};

export default ListaNomes;
