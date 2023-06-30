// Importe os módulos e dependências necessários
import {firestore} from '../../../firebase';
import axios from 'axios';


async function sincronizarArtigos() {
  try {
    const nomesSnapshot = await firestore.collection('artistas').get();

    const nomesData = nomesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const searchEngineId = process.env.NEXT_PUBLIC_ENGINE_ID;
    const batch = firestore.batch();
    const materiasRef = firestore.collection('materias');
    const existingArtigos = [];

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

          artigos.forEach((artigo) => {
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

                  quantidadeArtigosNovos++; 
              }
          });

      } catch (error) {
         console.error(error);
      }

  }

    await batch.commit();

  } catch (error) {
    console.error(error);
  }
}

export {sincronizarArtigos};