import { useState, useEffect } from 'react';
import { Artist, Company } from '@/types';
import { register_artist } from '@/utils';
import { useGetUserInfo } from './useGetUserInfo';

type SaveArtistRegister = {
    newArtistName: string;
    artistsKeywords: string[];
    artistNameError: string | undefined;
    loading: boolean;
    salvamentoSucesso: boolean;
    salvamentoErro: boolean;
    saveArtists: () => Promise<void>;
    validateArtistNames: () => void;
};



const useSaveArtistRegister = (companyID: string | undefined, artistsNames: string[], artistsKeywords: string[]): SaveArtistRegister => {
    const {company} = useGetUserInfo();
    const [newArtistName, setNewArtistName] = useState('');
    const [newKeywords, setNewKeywords] = useState([]);
    const [artistNameError, setArtistNameError] = useState<string | undefined>();
    const [salvamentoSucesso, setSalvamentoSucesso] = useState(false);
    const [salvamentoErro, setSalvamentoErro] = useState(false);
    const [loading, setLoading] = useState(false);

    const registerArtist = async (artist: Artist) => {
        return register_artist(companyID, artist);
    };
    const saveArtists = async () => {
        try {
            setLoading(true);

            const artistNames = artistsNames
            const artistsKeyWords = artistsKeywords
            const newArtists: Artist[] = artistNames.map((name) => ({
                name: name.trim(),
                keywords: artistsKeyWords,
                date_created: new Date(),
                date_updated: new Date(),
                last_sync: null,
                last_return: null,
             
            }));

            const promises = newArtists.map((artist) => registerArtist(artist))

            await Promise.all(promises);
            setSalvamentoSucesso(true);
            setLoading(false);
            setNewArtistName('');
        } catch (error) {
            setSalvamentoErro(true);
            setLoading(false);
            console.error(error);

        }

    };

    const validateArtistNames = () => {
        if (!newArtistName) {
            setArtistNameError('Artist names are required');
        }
    };

    return {
        newArtistName,
        artistsKeywords,
        artistNameError,
        loading,
        salvamentoSucesso,
        salvamentoErro,
        saveArtists,
        validateArtistNames,

    };
};

export default useSaveArtistRegister;
