import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import firebase from '../firebase';

export const useAuth = () => {
  const [user, setUser] = useState<firebase.User | null>(null);

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

  return { user };
};
