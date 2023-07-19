import { cron_get_all_artists } from "@/utils/firebase";
export async function GET(request){
  async function syncAllArtistsArticles() {
    try {
      // Obtenha todos os artistas de todas as empresas
      const allArtists = await cron_get_all_artists();
      console.log(allArtists);
  
      // Itere sobre as empresas e seus artistas
      for (const artistsOfCompany of allArtists) {
        for (const artist of artistsOfCompany) {
          // Aqui você pode fazer a sincronização dos artigos para cada artista
          const { nome, keywords } = artist; // Certifique-se de adaptar a estrutura de objetos do artista de acordo com o que a função existing_articles e update_articles esperam.
  
          try {
            const query = `artigos e matérias sobre "${nome}", {${keywords?.join(' ')}} -twitter `;
            const url = `https://customsearch.googleapis.com/customsearch/v1?cx=${searchEngineId}&key=${apiKey}&q=${query}&dateRestrict=d1`;
            console.log(url);
  
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
            const artigos = data.items.slice(0, 10);
  
            const { quantidadeArtigosNovos } = await existing_articles(company?.uid, { name: nome, keywords }, artigos);
            totalQuantidadeArtigosNovos += quantidadeArtigosNovos;
            console.log(totalQuantidadeArtigosNovos);
  
            const { batch, artistaDocRef } = await update_articles(company?.uid, { name: nome, keywords });
  
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
      }
  
      console.log("Sincronização de todos os artistas concluída!");
    } catch (error) {
      console.log("Erro ao sincronizar todos os artistas => ", error);
    }
  }
  
  syncAllArtistsArticles();
}
