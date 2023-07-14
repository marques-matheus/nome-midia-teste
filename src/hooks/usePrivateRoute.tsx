import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/utils/firebase';

type PrivateRouteProps = {
    loading: boolean;
}
const usePrivateRoute = (): PrivateRouteProps => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                setLoading(true);
                router.push('/login');
                setTimeout(() => {
                    setLoading(false);
                }, 2000)
            }
        });

        return () => unsubscribe();
    }, [router]);
    return {
        loading
    }
};


export default usePrivateRoute;
