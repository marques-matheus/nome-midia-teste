import Sidebar from '@/components/Sidebar';
import PrivateRoute from '../PrivateRoute';
import { useAuth } from '@/hooks/useAuth';
const Layout = ({ children }: { children: React.ReactNode }) => {

    const { currentUser } = useAuth();
    return (
        <PrivateRoute>
            <main className="flex min-h-screen  justify-center ">
                <Sidebar currentUser={currentUser} />
                <section className="flex relative py-24 px-10 justify-center md:pl-28  w-full lg:w-10/12">
                    {children}
                </section>
            </main>
        </PrivateRoute>
    );
};

export default Layout;
