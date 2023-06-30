'use client';
import { useEffect } from 'react';
import { auth } from '../../../firebase';
import { useRouter } from 'next/navigation';

type PrivateRouteProps = {
    children: React.ReactNode;
}
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }: PrivateRouteProps) => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/entrar'); 
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
};

export default PrivateRoute;
