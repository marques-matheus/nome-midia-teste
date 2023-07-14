'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';
import usePrivateRoute from '@/hooks/usePrivateRoute';

type PrivateRouteProps = {
  children: React.ReactNode;
}
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }: PrivateRouteProps) => {
  const { loading } = usePrivateRoute();





  return (
    loading ? <Spinner color={'info'} className='absolute top-1/2 left-1/2' size="xl" /> : <>{children}</>
  );
};

export default PrivateRoute;
