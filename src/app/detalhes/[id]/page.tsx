'use client'
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { Spinner } from "flowbite-react";
import * as XLSX from 'xlsx';
import Link from "next/link";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { Article, Artist } from "@/types";
import { get_artist, get_articles } from "@/utils/firebase";
import { useGetUserInfo } from "@/hooks/useGetUserInfo";





const Detalhes = ({ params }: { params: { id: string } }) => {
    const { company } = useGetUserInfo();
    const [loading, setLoading] = useState(false);
    const [artista, setArtista] = useState<Artist | null>(null);
    const [artigos, setArtigos] = useState<Article[] | undefined>([]);
    const id = params.id;

    useEffect(() => {
        const fetchArtista = async () => {
            setLoading(true);
            const artistaSnapshot = await get_artist(id, company?.uid);
            setArtista(artistaSnapshot as Artist);
            setTimeout(() => setLoading(false), 500);
        };
        fetchArtista();

    }, [company]);



    const exportToExcel = (tableId: string, filename: string) => {
        const table = document.getElementById(tableId);
        if (table) {
            const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);
            const wb: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            XLSX.writeFile(wb, `${filename}.xlsx`);
        }
    };


    useEffect(() => {
        const fetchArtigos = async () => {
            const artigosData = await get_articles(id, company?.uid);
            setArtigos(artigosData);

        };
        fetchArtigos();
    }, [artista]);


    return (
        <>
            <Layout>
                <div className="flex flex-col w-full ">
                    <Link href="/nomes-cadastrados" className="text-blue-600 hover:text-blue-800 align-left flex flex-row items-center md:ml-48 my-5"><IoArrowBackCircleOutline size={24} /> Voltar</Link>
                    <div className="relative w-full md:w-10/12 mx-auto md:ml-32 lg:ml-48 h-fit flex items-center justify-around flex-col overflow-x-auto shadow-md sm:rounded-lg">
                        <button onClick={() => exportToExcel('tabela', `${artista?.name}`)} className="font-medium my-10 w-6/12 text-white rounded-md hover:bg-blue-700 bg-blue-600 p-2">
                            Exportar para excel
                        </button>
                        {loading ? <Spinner size="xl" className="my-10" /> :
                            <div className="overflow-x-auto w-full">
                                <table id="tabela" className="w-full text-sm text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th colSpan={3} className="py-3 text-xl font-bold text-center">
                                                Artigos de: {artista?.name}
                                            </th>
                                        </tr>
                                        <tr>
                                            <th scope="col" className="py-3">
                                                Titulo
                                            </th>
                                            <th scope="col" className="py-3">
                                                Url
                                            </th>
                                            <th scope="col" className="py-3">
                                                Descrição
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {artigos?.length === 0 ? (
                                            <tr className="my-10">
                                                <td colSpan={3} className="text-center  text-lg">
                                                    Nenhum artigo encontrado, sincronize o banco de dados
                                                </td>
                                            </tr>
                                        ) : (
                                            artigos?.map((artigo: any) => (
                                                <tr key={artigo.id}>
                                                    <td className="py-4  px-6 align-top">{artigo.title}</td>
                                                    <td className="py-4  px-6 align-top text-blue-600 hover:text-blue-800">
                                                        <Link href={artigo.url}>{artigo.url}</Link>
                                                    </td>
                                                    <td className="py-4  px-6 align-top">{artigo.description}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        }
                    </div>
                </div>
            </Layout >
        </>
    );
};

export default Detalhes;


