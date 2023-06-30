'use client';
import { useState, useEffect } from 'react';
import { firestore, auth } from '../../firebase';
import Layout from '@/components/Layout';

const DashboardPage: React.FC = () => {
  const [totalArtistas, setTotalArtistas] = useState<number>(0);
  const [totalMaterias, setTotalMaterias] = useState<number>(0);
  const [totalUsuarios, setTotalUsuarios] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<any>();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (currentUser && currentUser.empresaId) {
          // Consulta para contar o total de artistas filtrado pelo ID da empresa do usuário logado
          const artistasSnapshot = await firestore
            .collection('artistas')
            .where('empresaId', '==', currentUser.empresaId)
            .get();
          setTotalArtistas(artistasSnapshot.size);

          // Consulta para contar o total de matérias filtrado pelo ID da empresa do usuário logado
          const materiasSnapshot = await firestore
            .collection('materias')
            .where('idArtista', 'in', artistasSnapshot.docs.map(doc => doc.id))
            .get();
          setTotalMaterias(materiasSnapshot.size);
        }

        // Consulta para contar o total de usuários
        const usuariosSnapshot = await firestore.collection('users').get();
        setTotalUsuarios(usuariosSnapshot.size);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  useEffect(() => {
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
              <span className="text-xl font-bold mx-4">{totalUsuarios}</span>
            </div>
          )}
          {currentUser && !currentUser.isAdmin && (
            <>
              <div className="w-5/12 text-center p-4 bg-gray-50 shadow-lg rounded-md flex flex-col lg:flex-row justify-center items-center">
                <span className="text-sm text-gray-500">Total de Artistas</span>
                <span className="text-xl font-bold mx-4">{totalArtistas}</span>
              </div>
              <div className="w-5/12 text-center p-4 bg-gray-50 shadow-lg rounded-md flex flex-col lg:flex-row justify-center items-center">
                <span className="text-sm text-gray-500">Total de Matérias</span>
                <span className="text-xl font-bold mx-4">{totalMaterias}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
