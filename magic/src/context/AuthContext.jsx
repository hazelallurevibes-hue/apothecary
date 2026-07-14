import { createContext, useContext, useEffect, useState } from 'react';
import { magicCan, userHasMagicPro } from '../lib/plans';
import { loadCachedUser, onAuthChange, restoreSession } from '../lib/auth';

const AuthContext = createContext({
  user: null,
  loading: true,
  isPremium: false,
  isAdmin: false,
  can: () => false,
  refresh: async () => null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadCachedUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await restoreSession();
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    })();
    const unsub = onAuthChange((u) => {
      if (mounted) setUser(u);
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isPremium: userHasMagicPro(user),
        isAdmin: Boolean(user?.isAdmin),
        can: (perm) => magicCan(user, perm),
        refresh: async () => {
          const u = await restoreSession();
          setUser(u);
          return u;
        },
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
