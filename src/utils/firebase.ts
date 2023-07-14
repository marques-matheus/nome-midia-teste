import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import { getFirestore, collection, where, query, getDocs, getDoc, doc, collectionGroup, orderBy } from 'firebase/firestore';
import { Article, Artist, Company } from '@/types';


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};



if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
const v2firestore = getFirestore(firebase.app());

async function register_artist(companyId: string | undefined, artist: Artist) {
    const companyRef = firestore.collection("companies").doc(companyId);
    const artistsRef = companyRef.collection("artists").doc();
    const artistId = artistsRef.id;
    artist.id = artistId;
    await artistsRef.set(artist);
    return artistId;

}

async function register_articles(companyId:string | undefined, artist: Artist, article: Article) {
    const companyRef = firestore.collection("companies").doc(companyId);
    const artistsRef = companyRef.collection("artists").doc(artist.id);
    const articlesRef = artistsRef.collection("articles").doc();
    const articleId = articlesRef.id;
    article.uid = articleId;
    await articlesRef.set(article);
    return articleId;
}


async function register_user(company_registered: boolean, company: Company, user: { email: string, password: string, name: string }) {
    const user_auth = await auth.createUserWithEmailAndPassword(user.email, user.password);
    const user_data = {
        name: user.name,
        email: user.email,
        uid: user_auth.user?.uid
    }

    let companyId: string;

    if (!company_registered) {
        companyId = await register_company(company);
    } else {
        companyId = company.uid;
    }

    await firestore
        .collection("companies")
        .doc(companyId)
        .collection("users")
        .add(user_data);


}



async function register_company(company: Company) {
    const companyRef = firestore.collection("companies").doc(); 
    const companyId = companyRef.id;
    company.uid = companyId; 
    await companyRef.set(company); 
    return companyId; 
}
async function get_company() {
    const empresasSnapshot = await firestore.collection('companies').get();
    return { empresasSnapshot };
}

async function delete_company(companyId: string) {
    await firestore.collection('companies').doc(companyId).delete();
}


interface ArtistCount {
    totalArtists: number;
    totalArticles: number;
}
async function dashboard_count_artist_for_company(companyId: string | undefined): Promise<ArtistCount> {
    try {
        const artists = await firestore.collection("companies").doc(companyId).collection("artists").get();
        const totalArtists: number = artists.size
        let totalArticles: number = 0;
        
        for (const artistDoc of artists.docs) {
          const articlesSnapshot = await artistDoc.ref.collection("articles").get();
          totalArticles += articlesSnapshot.size;
        }
        return { totalArtists, totalArticles }
    } catch (error: any) {
        return { totalArtists: 0, totalArticles: 0 }
    }
}




interface UserCount {
    totalUsers: number;
}
async function dashboard_count_users(): Promise<UserCount> {
    const empresasSnapshot = await firestore.collection('companies').get();

    let totalUsers: number = 0;

    for (const companyDoc of empresasSnapshot.docs){
        const userSnapshot = await companyDoc.ref.collection('users').get();
        totalUsers += userSnapshot.size;
    }

    return { totalUsers }
}

async function delete_artist(artistaId: string | undefined, companyId: string | undefined) {
    try {
       

        await firestore
            .collection('companies')
            .doc(companyId)
            .collection('artists')
            .doc(artistaId)
            .delete();

        const batch = firestore.batch();

        await batch.commit();


    } catch (error) {
        console.error(error);
    }
}

async function get_artist(id: string, companyId: string | undefined) {
    try {
        const artistaSnapshot = await firestore.collection('companies').doc(companyId).collection('artists').doc(id).get();
        return artistaSnapshot.data();
    } catch (error: any) {
        console.log("Erro ao pegar artista => ", error);
        return Error(error.message);
    }
}

async function get_articles(id: string, companyId: string | undefined) {
    try {
        const artigosSnapshot = await firestore
            .collection('companies').doc(companyId).collection('artists').doc(id).collection('articles').get();
        const artigosData: any[] = [];
        artigosSnapshot.forEach((doc) => {
            artigosData.push({ id: doc.id, ...doc.data() });
        });
        return artigosData;
    } catch (error) {
        console.error(error);
    }
}

async function cron_get_all_artists() {
    try {
        const companies = await firestore.collection("companies").get();
        const companies_data = companies.docs.map((company) => {
            return {
                uid: company.id,
                ...company.data()
            }
        });
        const artists = await Promise.all(companies_data.map(async (company) => {

            const artists = await firestore.collection("companies").doc(company.uid).collection("artists").get();
            const artists_data = artists.docs.map((artist) => {
                return {
                    uid: artist.id,
                    ...artist.data()
                }
            });
            return artists_data;
        }));
        return artists;
    } catch (error: any) {
        console.log("Erro ao pegar todos os artistas => ", error);
        return Error(error.message);
    }
}

async function cron_get_all_companies() {
    try {
        const companies = await firestore.collection("companies").get();
        const companies_data = companies.docs.map((company) => {
            return {
                uid: company.id,
                ...company.data()
            }
        });
        return companies_data;
    } catch (error: any) {
        console.log("Erro ao pegar todas as empresas => ", error);
        return Error(error.message);
    }
}


async function get_user_info(companyID: string | undefined) {
    try {
        const userSnapshot = await firestore
            .collection('companies')
            .doc(companyID)
            .collection('users')
            .get().then((snapshot) => {
                return snapshot.docs.map((doc) => {
                    return {
                        uid: doc.id,
                        ...doc.data()
                    }
                })
            })
            
            return { userSnapshot };
    }
    catch (error) {
        console.error(error);
    }



}
async function get_company_for_user(uid: string | undefined) {
    try {
        const companies_collection = await collection(v2firestore, "companies");
        const companies_query = await query(companies_collection);
        const companies_query_snapshot = await getDocs(companies_query);

        const companies = await Promise.all(
            companies_query_snapshot.docs.map(async (company) => {
                const users = await collection(company.ref, "users");
                const users_query = await query(users);
                const users_query_snapshot = await getDocs(users_query);

                const user = users_query_snapshot.docs.find((user) => user.data().uid === uid);
           
                if (user) {
                    return company.data();
                }
            })
        );

        console.log(companies);

        const filteredCompanies = companies.filter(Boolean); 
        const company = filteredCompanies[0];

        console.log(company);

        if (!company) {
            return null;
        }

        return company;
    } catch (error: any) {
        console.log("Erro ao pegar empresa do usuário => ", error);
        return Error(error.message);
    }
}


async function get_user() {
    try {
        const user = await auth.currentUser;

        console.log('firebase user => ', user);
        const company = await get_company_for_user(user?.uid);
        console.log('firebase company => ', company);
        return {
            user,
            company
        };
    } catch (error: any) {
        console.log(error);
    }
}

const getArtistsForCompany = async (companyID: string | undefined): Promise<Artist[]> => {
    try {
        const artistsSnapshot = await firestore
            .collection('companies')
            .doc(companyID)
            .collection('artists')
            .get();

        const artists: Artist[] = artistsSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            date_created: doc.data().date_created,
            date_updated: doc.data().date_updated,
            keywords: doc.data().keywords,
            last_sync: doc.data().last_sync,
            last_return: doc.data().last_return
        }));

        console.log(artists);
        return artists;
    } catch (error) {
        console.error(error);
        throw new Error('Error retrieving artists for company');
    }
};

async function existing_articles(company_id: string | undefined, artist: Artist | undefined, artigos: any[]) {
    let quantidadeArtigosNovos = 0;
    const existingArtigosQuerySnapshot = await firestore
        .collection('companies')
        .doc(company_id)
        .collection('artists')
        .doc(artist?.id)
        .collection('articles')
        .get();

    const existingArtigos = existingArtigosQuerySnapshot.docs.map((doc) => doc.data().title);
    const artistDocRef = firestore
        .collection('companies')
        .doc(company_id)
        .collection('artists')
        .doc(artist?.id);

    const articlesCollectionRef = artistDocRef.collection('articles');

    for (const artigo of artigos) {
        const title = artigo.title;

        if (!existingArtigos.includes(title)) {
            const materiaData = {
                artist: artist?.name,
                title: artigo.title,
                description: artigo.snippet,
                url: artigo.link,
            };

            await articlesCollectionRef.add(materiaData);
            quantidadeArtigosNovos++;
        }
    }

    return { quantidadeArtigosNovos };
}

async function update_articles(companyId?: string | undefined, artist?: Artist) {
    const batch = firestore.batch();
    const artistaDocRef = firestore
        .collection('companies')
        .doc(companyId)
        .collection('artists')
        .doc(artist?.id);

    return {batch, artistaDocRef}
}


export default firebase;

export {
    register_artist,
    register_user,
    register_company,
    get_company,
    delete_company,
    register_articles,
    delete_artist,
    get_artist,
    get_articles,
    getArtistsForCompany,
    existing_articles,
    update_articles,
    get_company_for_user,
    dashboard_count_users,
    get_user,
    get_user_info,
    dashboard_count_artist_for_company,
    firestore,
    auth,
    storage
}
