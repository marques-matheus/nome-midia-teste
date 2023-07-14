

/**
 * @TODO criar nova api para sincronizar apenas artistas daquela empresa
 * @TODO criar nova api para sincronizar um unico artista
 * @TODO Funcoes de chamada do firebase deixar dentro do firebase.ts
 */
async function sincronizarArtigos() {
  try {
    const nomesSnapshot = await firestore.collection('artistas').get();

    const nomesData = nomesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const searchEngineId = process.env.NEXT_PUBLIC_ENGINE_ID;
   
    for (const nome of nomesData) {
      try {
          const query = `artigos e matérias sobre "${nome.nome}", {${nome.palavrasChave.join(' ')}} -twitter `;
          const url = `https://customsearch.googleapis.com/customsearch/v1?cx=${searchEngineId}&key=${apiKey}&q=${query}&dateRestrict=d1`;
          const response = await fetch(url);
          const data = await response.json();
          const artigos = data.items.slice(0, 10);
      
          const { quantidadeArtigosNovos } = await existing_articles(company.uid, nome, artigos);
          totalQuantidadeArtigosNovos += quantidadeArtigosNovos;
        

          const { batch, artistaDocRef } = await update_articles(company?.uid, nome);


          const last_sync = new Date();
          const last_return = new Date();

          batch.update(artistaDocRef, {
              last_sync: last_sync.toISOString(),
              last_return: quantidadeArtigosNovos > 0 ? last_return.toISOString() : nome.last_return,
          });

          await batch.commit();

        } catch (error) {
          
        }

      }
    
  } catch (error) {
    console.log(error);
  }

    
}

export {sincronizarArtigos};