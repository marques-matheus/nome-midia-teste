'use client';
import { useEffect, useState } from 'react';
import { auth } from '../../../firebase';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';

type PrivateRouteProps = {
  children: React.ReactNode;
}
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }: PrivateRouteProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setLoading(true);
        router.push('/login');
        setTimeout(() => setLoading(false), 2000);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    loading ? <Spinner color={'info'} className='absolute top-1/2 left-1/2' size="xl" /> : <>{children}</>
  );
};

export default PrivateRoute;
