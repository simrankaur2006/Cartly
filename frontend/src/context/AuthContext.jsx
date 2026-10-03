import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { meApi, profileApi, setTokenGetter } from '../services/api';

const AuthContext = createContext({ isLoaded: false, isSignedIn: false, isAdmin: false, adminChecked: false });

// Bridges Clerk (authentication) with our backend (who is an admin, profile sync).
export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const syncedFor = useRef(null);

  // Registered during render so child components can call the API with a token immediately.
  setTokenGetter(isSignedIn ? getToken : null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setIsAdmin(false);
      setAdminChecked(true);
      syncedFor.current = null;
      return;
    }
    let cancelled = false;
    setAdminChecked(false);
    meApi
      .get()
      .then((me) => !cancelled && setIsAdmin(Boolean(me.admin)))
      .catch(() => !cancelled && setIsAdmin(false))
      .finally(() => !cancelled && setAdminChecked(true));
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId]);

  // On first sign in, copy the name and email from Clerk into our own profile record.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || syncedFor.current === userId) return;
    syncedFor.current = userId;
    profileApi
      .get()
      .then((profile) => {
        if (profile.email && profile.name) return null;
        return profileApi.update({
          name: profile.name || user.fullName || '',
          email: profile.email || user.primaryEmailAddress?.emailAddress || '',
          phone: profile.phone || '',
          address: profile.address || '',
        });
      })
      .catch(() => {});
  }, [isLoaded, isSignedIn, user, userId]);

  return (
    <AuthContext.Provider value={{ isLoaded, isSignedIn: Boolean(isSignedIn), isAdmin, adminChecked }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAppAuth = () => useContext(AuthContext);
