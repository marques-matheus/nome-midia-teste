import Sidebar from '@/components/Sidebar';
import PrivateRoute from '../PrivateRoute';
import { auth, firestore } from '../../../firebase';
import { useState, useEffect } from 'react';
import { Spinner } from 'flowbite-react';
const Layout = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<any>();
    const [loading, setLoading] = useState(false);

 
    useEffect(() => {
        setLoading(true);
        const unsubscribe = auth.onAuthStateChanged((user: any) => {

            setCurrentUser(user);
            if (user) {
                firestore
                    .collection('users')
                    .doc(user.uid)
                    .get()
                    .then((doc) => {
                        if (doc.exists) {
                            const userData: any = doc.data();
                            setCurrentUser((prevUser: any) => ({
                                ...prevUser,
                                isAdmin: userData.isAdmin,
                                displayName: userData.displayName,
                                empresaId: userData.empresaId,
                            }));
                        }

                        
                    })
                    .catch((error) => {
                        console.error('Error fetching user data:', error);
                    });
            }
            setTimeout(() => setLoading(false), 1000);
        });

        return () => {
            unsubscribe();
        };
    }, []);
    
   
    
    return (
        <PrivateRoute>

            {loading ? <Spinner color={'info'} className='absolute top-1/2 left-1/2' size="xl" /> : <>
                <main className="flex min-h-screen w-screen justify-center ">
                    <Sidebar currentUser={currentUser} />
                    <section className="flex relative py-24 px-10 justify-center md:pl-28  w-full lg:w-10/12">
                        {children}
                    </section>
                </main>
            </>}

        </PrivateRoute>
    );
};

export default Layout;
