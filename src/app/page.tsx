'use client';
import { useState, useEffect } from 'react';
import { Spinner } from 'flowbite-react';
import Layout from '@/components/Layout';
import { useGetUserInfo } from '@/hooks/useGetUserInfo';
import {useAuth} from '@/hooks/useAuth';
import { dashboard_count_artist_for_company, dashboard_count_users, auth } from "@/utils/firebase";

const DashboardPage: React.FC = () => {
  const [totalArtistas, setTotalArtistas] = useState<number>(0);
  const [totalMaterias, setTotalMaterias] = useState<number>(0);
  const [totalUsuarios, setTotalUsuarios] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<any>();
  const [loading, setLoading] = useState(false);


  const { company } = useGetUserInfo();

  useEffect(() => {
    const fetchDashboardData = async () => {

      setLoading(true);
      const { totalArtists, totalArticles } = await dashboard_count_artist_for_company(company?.uid);
      setTotalArtistas(totalArtists);
      setTotalMaterias(totalArticles);
      const { totalUsers } = await dashboard_count_users()
      setTotalUsuarios(totalUsers);

    };

    fetchDashboardData();
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, [currentUser, company]);



  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      setCurrentUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (

    <Layout>
      <div className="flex flex-col w-full md:ml-32">
        <div className="flex justify-center w-full space-x-4 my-4">
          {currentUser && currentUser.isAdmin && (
            <div className="w-5/12 text-center p-4 bg-gray-50 shadow-lg rounded-md flex flex-col lg:flex-row justify-center items-center">
              <span className="text-sm text-gray-500">Total de Usuários</span>
              {loading ? <Spinner size="xs" className='ml-2' /> : <span className="text-xl font-bold mx-4">{totalUsuarios}</span>}
            </div>
          )}
          {currentUser && !currentUser.isAdmin && (
            <>
              <div className="w-5/12 text-center p-4 bg-gray-50 shadow-lg rounded-md flex flex-col lg:flex-row justify-center items-center">
                <span className="text-sm text-gray-500">Total de Artistas</span>
                {loading ? <Spinner size="xs" className='ml-2' /> : <span className="text-xl font-bold mx-4">{totalArtistas}</span>}
              </div>
              <div className="w-5/12 text-center p-4 bg-gray-50 shadow-lg rounded-md flex flex-col lg:flex-row justify-center items-center">
                <span className="text-sm text-gray-500">Total de Matérias</span>
                {loading ? <Spinner size="xs" className='ml-2' /> : <span className="text-xl font-bold mx-4">{totalMaterias}</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
