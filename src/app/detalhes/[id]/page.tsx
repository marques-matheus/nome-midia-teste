'use client'
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { firestore, auth } from "../../../../firebase";
import { Spinner } from "flowbite-react";


interface Nome {
    id: string;
    nome: string;
    palavrasChave: string[];
    ultimaSincronizacao: Date | null;
    ultimaDataRetorno: Date | null;
}


const Detalhes = ({ params }: { params: { id: string } }) => {

    const [loading, setLoading] = useState(false);
    const [artista, setArtista] = useState<Nome | null>(null);
    const [artigos, setArtigos] = useState<any[]>([]);
    const id = params.id;

    useEffect(() => {
        const fetchArtista = async () => {
            try {
                setLoading(true);
                const artistaSnapshot = await firestore
                    .collection('artistas').doc(id).get();
                console.log(artistaSnapshot.data());
                setArtista(artistaSnapshot.data() as Nome);
                setTimeout(() => setLoading(false), 500);
            } catch (error) {
                console.error(error);
            }
        };
        fetchArtista();

    }, []);





    useEffect(() => {
        const fetchArtigos = async () => {
            try {
                const artigosSnapshot = await firestore
                    .collection('materias')
                    .where('idArtista', '==', id)
                    .get();

                const artigosData: any[] = [];
                artigosSnapshot.forEach((doc) => {
                    artigosData.push({ id: doc.id, ...doc.data() });
                });

                setArtigos(artigosData);
            } catch (error) {
                console.error(error);
            }
        };
        fetchArtigos();
    }, [artista]);

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

                        {loading ? <Spinner size="xl" /> : <table id="table_detail" className="w-full text-sm text-gray-500">
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
                                        Artigos
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-white border-b">
                                    <td scope="row" className="py-4 px-2 font-medium text-center text-gray-900 align-top">
                                        {artista?.nome}
                                    </td>
                                    <td className="py-4 px-2 text-center align-top">
                                        {artista?.ultimaSincronizacao ? formatarData(artista.ultimaSincronizacao) : 'Nunca sincronizado'}
                                    </td>
                                    <td className="py-4 px-2 text-center align-top">
                                        {artista?.ultimaDataRetorno ? formatarData(artista.ultimaDataRetorno) : 'Nunca retornou'}
                                    </td>
                                    <td className="py-4 px-2 text-center align-top">
                                        {artigos.length == 0 ? <span className='text-center flex justify-center self-center my-10 mx-auto'>Nenhum artigo encontrado, sincronize o banco de dados</span> :
                                            artigos.map((artigo, index) => (
                                                <span key={index} className='text-center flex justify-center self-center mb-5 mx-auto'>
                                                    {artigo.titulo}
                                                </span>
                                            ))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        }

                        <button onClick={()=>{}} className="font-medium mt-10 w-full text-white rounded-md hover:bg-red-700 bg-red-600 p-2">
                            Exportar para excel
                        </button>
                    </div>


                </div>


            </Layout >
        </>
    );
};

export default Detalhes;


