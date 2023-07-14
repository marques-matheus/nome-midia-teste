import { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import {get_user_info, auth} from  '../utils/firebase';
export const useAuth = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [currentUser, setCurrentUser] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // O usuário está autenticado
        setUser(authUser);
      } else {
        // O usuário não está autenticado
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);


  useEffect(() => {
      setLoading(true);
      const unsubscribe = auth.onAuthStateChanged((user: any) => {

          setCurrentUser(user);
          if (user) {
              {
                  get_user_info(user.uid)
              }
          }
          setTimeout(() => setLoading(false), 1500);
      });

      return () => {
          unsubscribe();
      };
  }, []);



  return { user, currentUser, loading };
};
