import { useState } from 'react';
import { Artist, Company } from '@/types';
import { existing_articles, update_articles } from '@/utils/firebase';
import { useGetUserInfo } from './useGetUserInfo';

type SincronizarArtigosResult = {
    loadingSync: boolean;
    nomesComErro: string[];
    quantidadeArtigos: number;
    salvamentoSucesso: boolean;
    erroFetch: boolean;
    salvamentoErro: boolean;
    allArtistsSelected: boolean;
    selectedArtistas: string[];
    setSelectedArtistas: React.Dispatch<React.SetStateAction<string[]>>;
    setAllArtistsSelected: React.Dispatch<React.SetStateAction<boolean>>;
    sincronizarArtigos: () => Promise<void>;
};

const useSyncArticles = (nomes: Artist[]): SincronizarArtigosResult => {
    const [loadingSync, setLoadingSync] = useState(false);
    const [nomesComErro, setNomesComErro] = useState<string[]>([]);
    const [quantidadeArtigos, setQuantidadeArtigos] = useState(0);
    const [salvamentoSucesso, setSalvamentoSucesso] = useState(false);
    const [salvamentoErro, setSalvamentoErro] = useState(false);
    const [erroFetch, setErroFetch] = useState(false);
    const [allArtistsSelected, setAllArtistsSelected] = useState(false);
    const [selectedArtistas, setSelectedArtistas] = useState<any[]>([]);
    const {company} = useGetUserInfo();


    const sincronizarArtigos = async () => {
        try {
            setLoadingSync(true);
            setNomesComErro([]);

            const apiKey = process.env.NEXT_PUBLIC_API_KEY;
            const searchEngineId = process.env.NEXT_PUBLIC_ENGINE_ID;
           
            const allArtistsSelected = selectedArtistas.length === nomes.length || selectedArtistas.length === 0;

            const nomesSelecionados = allArtistsSelected ? nomes : nomes.filter((nome) => selectedArtistas.includes(nome.id));
            let totalQuantidadeArtigosNovos = 0;

            for (const nome of nomesSelecionados) {
                try {
                    const query = `artigos e matérias sobre "${nome.name}", {${nome.keywords?.join(' ')}} -twitter `;
                    const url = `https://customsearch.googleapis.com/customsearch/v1?cx=${searchEngineId}&key=${apiKey}&q=${query}&dateRestrict=d1`;

                    const response = await fetch(url);
                    const data = await response.json();
                    console.log(data);
                    const artigos = data.items.slice(0, 10);

                    const { quantidadeArtigosNovos } = await existing_articles(company?.uid, nome, artigos);
                    totalQuantidadeArtigosNovos += quantidadeArtigosNovos;
                    console.log(totalQuantidadeArtigosNovos);

                    const { batch, artistaDocRef } = await update_articles(company?.uid, nome);


                    const last_sync = new Date();
                    const last_return = new Date();

                    batch.update(artistaDocRef, {
                        last_sync: last_sync.toISOString(),
                        last_return: quantidadeArtigosNovos > 0 ? last_return.toISOString() : nome.last_return,
                    });

                    await batch.commit();

                } catch (error) {
                    setErroFetch(true);
                    setNomesComErro((prevNomes) => [...prevNomes, nome.name]);
                    setTimeout(() => setErroFetch(false), 2500);
                }
            }

            setQuantidadeArtigos(totalQuantidadeArtigosNovos);
            setSalvamentoSucesso(true);
            setTimeout(() => setSalvamentoSucesso(false), 1500);
            setLoadingSync(false);
            console.log(`${totalQuantidadeArtigosNovos} artigos novos salvos.`);
        } catch (error) {
            console.error(error);
            setSalvamentoErro(true);
            setTimeout(() => setSalvamentoErro(false), 1500);
            setLoadingSync(false);
        }
    };

    return {
        loadingSync,
        nomesComErro,
        quantidadeArtigos,
        erroFetch,
        allArtistsSelected,
        selectedArtistas,
        salvamentoSucesso,
        salvamentoErro,
        setSelectedArtistas,
        setAllArtistsSelected,
        sincronizarArtigos,
    };
};

export default useSyncArticles;
