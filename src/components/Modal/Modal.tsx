'use client'
import React, { useState, useEffect } from 'react';
import { firestore } from '../../../firebase';
import Link from 'next/link';
const Modal: React.FC<{ selectedItem: any; closeModal: () => void }> = ({
  selectedItem,
  closeModal,
}) => {
  const [artigos, setArtigos] = useState<any[]>([]);

  useEffect(() => {
    const fetchArtigos = async () => {
      try {
        const artigosSnapshot = await firestore
          .collection('materias')
          .where('idArtista', '==', selectedItem.id)
          .get();

        const artigosData: any[] = [];
        artigosSnapshot.forEach((doc) => {
          artigosData.push({ id: doc.id, ...doc.data() });
        });

        setArtigos(artigosData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchArtigos();
  }, [selectedItem]);

  if (!selectedItem) {
    return null; // Oculta o modal se nenhum item for selecionado
  }

  return (
    <div
      id="modal"
      className="fixed inset-0 flex items-center justify-center z-9 bg-gray-500 bg-opacity-50"
    >
      <div className="relative w-6/12 h-6/12 mx-5 mt-20 md:mt-0 md:h-fit  md:ml-32 bg-white shadow-md rounded-lg p-10">
        <button
          className="absolute right-0 top-0 m-4 font-bold text-xl"
          onClick={closeModal}
        >
          X
        </button>
        <h2 className="text-2xl font-bold text-center"> {selectedItem.nome}</h2>

        {artigos.length == 0 ? <span className='text-center flex justify-center self-center my-10 mx-auto'>Nenhum artigo encontrado, sincronize o banco de dados</span> :
          <>
            <h3>Artigos:</h3>
            <ul>
              {artigos.map((artigo) => (
                <li key={artigo.id} className='text-sm font-semibold'>
                  <Link className='text-blue-500 hover:underline hover:text-blue-600' href={`${artigo.url}`} >
                    {artigo.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        }

      </div>
    </div>
  );
};

export default Modal;
