'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { auth } from '@/utils/firebase';
import { MdOutlineDashboard, MdBusiness } from 'react-icons/md';
import { AiOutlineUser, AiOutlineUserAdd, AiOutlineLogout } from 'react-icons/ai';
import { FiUserPlus } from 'react-icons/fi';
import ItemNav from '../ItemNav';

type ItemNavProps = {
  currentUser: any;
}
const Sidebar = ({ currentUser }: ItemNavProps) => {
  const pathname = usePathname();
  const isActive = (url: string) => {
    return pathname === url;
  };

  const [isOpen, setIsOpen] = useState(false);


  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };


  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        type="button"
        className="fixed top-0 right-0 z-50 flex items-center p-2 mt-2 mr-3 text-sm text-gray-700 rounded-lg md:hidden  focus:outline-none  focus:ring-gray-200"
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>

      <aside
        id="sidebar"
        className={`fixed shadow-xl top-0 left-0 z-40 w-64 h-screen  transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        aria-label="Sidebar"
      >
        <div className="h-full flex flex-col relative  overflow-y-auto bg-white shadow-xl">

          {currentUser && (
            <p className='text-sm ml-3 mt-2 '>
              Usuário: {currentUser.email}
            </p>
          )}
          <nav className='my-6'>
            <ul>
              <ItemNav icon={<MdOutlineDashboard size={24} color='gray' />} text="Dashboard" href="/" active={isActive('/')} />
              {currentUser && !currentUser.isAdmin && (
                <ItemNav icon={<AiOutlineUserAdd size={24} color='gray' />} text="Cadastrar Nome" href="/adicionar-nome" active={isActive('/adicionar-nome')} />
              )}
              {currentUser && currentUser.isAdmin === true ? (
                <ItemNav icon={<AiOutlineUser size={24} color='gray' />} text="Usuarios Cadastrados" href="/usuarios-cadastrados" active={isActive('/usuarios-cadastrados')} />
              ) : (
                <ItemNav icon={<AiOutlineUser size={24} color='gray' />} text="Nomes Cadastrados" href="/nomes-cadastrados" active={isActive('/nomes-cadastrados')} />
              )}

              {currentUser && currentUser.isAdmin && (
                <ItemNav icon={<MdBusiness size={24} color='gray' />} text="Empresas Cadastradas" href="/empresas-registradas" active={isActive('/empresas-registradas')} />
              )}
              {currentUser && currentUser.isAdmin && (
                <ItemNav icon={<FiUserPlus size={24} color='gray' />} text="Cadastrar Usuário" href="/registro-admin" active={isActive('/registro-admin')} />
              )}

            </ul>
          </nav>

          <button
            onClick={handleLogout}
            className="px-2 bottom-0 absolute  mb-10 py-2 flex flex-row text-black hover:text-slate-900  text-sm"
          >
            <AiOutlineLogout className="mr-2" size={24} color='gray' />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
