import { cron_get_all_artists, existing_articles, update_articles } from "@/utils/firebase";
export async function GET(request){

  

async function syncAllArtistsArticles() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const searchEngineId = process.env.NEXT_PUBLIC_ENGINE_ID;
    // Obtenha todos os artistas de todas as empresas
    const allArtistsArray = await cron_get_all_artists();
    console.log(allArtistsArray);

    let totalQuantidadeArtigosNovos = 0;

   
    for (const artistsOfCompany of allArtistsArray) {    
      for (const artist of artistsOfCompany) {      
        if (artist?.name) {
          console.log(artist);
          const { name, keywords, uid } = artist;
          console.log("Artist Name:", name);
          console.log("Artist UID:", uid);

          console.log(name, uid);

          try {
            const query = `artigos e matérias sobre "${name}", {${keywords?.join(' ')}} -twitter `;
            const url = `https://customsearch.googleapis.com/customsearch/v1?cx=${searchEngineId}&key=${apiKey}&q=${query}&dateRestrict=d1`;
            console.log(url);

            const response = await fetch(url);
            const data = await response.json();
         
            const artigos = data.items.slice(0, 10);
            console.log(artigos);

            const { quantidadeArtigosNovos } = await existing_articles("vcd9ErYYcbydEcySgbjc",  artist, artigos);
            totalQuantidadeArtigosNovos += quantidadeArtigosNovos;
            console.log(totalQuantidadeArtigosNovos);

            const { batch, artistaDocRef } = await update_articles("vcd9ErYYcbydEcySgbjc", artist);

            const last_sync = new Date();
            const last_return = new Date();

            batch.update(artistaDocRef, {
              last_sync: last_sync.toISOString(),
              last_return: quantidadeArtigosNovos > 0 ? last_return.toISOString() : artist.last_return,
            });

            await batch.commit();

          } catch (error) {
            console.log(error);
          }

        } else {
         
          console.log("Artista sem nome: ", artist);
          continue;
        }

        
      }
    }

    console.log(`Sincronização de todos os artistas concluída! ${totalQuantidadeArtigosNovos}`);
  } catch (error) {
    console.log("Erro ao sincronizar todos os artistas => ", error);
  }
}

  
  syncAllArtistsArticles();
}  