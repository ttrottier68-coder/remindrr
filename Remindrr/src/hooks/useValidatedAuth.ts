// useValidatedAuth — keeps localStorage auth state in sync with Firebase.
//
// The existing `isAuthenticated()` check just looks at localStorage. That
// works for normal flows but doesn't catch:
//   - User gets deleted from Firebase (localStorage still says "logged in")
//   - Firebase session expires (token still in localStorage)
//   - User opens the app on a different device (different localStorage)
//
// This hook calls Firebase's onAuthStateChanged on mount. If Firebase says
// "no user" but localStorage says "logged in", it clears localStorage and
// reloads — so the user is forced to log in again.
//
// Returns: { loading, authed }
//   loading — true while we're checking Firebase
//   authed  — true if both localStorage and Firebase agree the user is in

import { useEffect, useState } from 'react';
import { waitForFirebase } from '../lib/firebase';
import { getSession, clearLocalSession } from '../lib/auth';

export function useValidatedAuth() {
  const [state, setState] = useState({ loading: true, authed: !!getSession() });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Give Firebase ~3s to load
      const ready = await waitForFirebase();
      if (cancelled) return;

      if (!ready) {
        // Firebase never loaded — assume localStorage is correct
        setState({ loading: false, authed: !!getSession() });
        return;
      }

      const fb = (window as any).firebase;
      if (!fb?.auth) {
        setState({ loading: false, authed: !!getSession() });
        return;
      }

      // Subscribe to auth changes
      const unsub = fb.auth().onAuthStateChanged((fbUser: any) => {
        if (cancelled) return;
        const localSession = getSession();

        if (!fbUser && localSession) {
          // Firebase says no user, but we have a local session — clear it
          // and force a reload to the login page.
          clearLocalSession();
          window.location.replace('/login');
          return;
        }

        if (fbUser && !localSession) {
          // Firebase says we have a user, but no local session — log in
          // the user (this can happen if they refreshed during a flow).
          // The existing LoginPage handles this on its first effect.
          // Here we just report "not authed" and let the user navigate.
          setState({ loading: false, authed: false });
          return;
        }

        setState({ loading: false, authed: !!fbUser && !!localSession });
      });

      return () => unsub && unsub();
    })();

    return () => { cancelled = true; };
  }, []);

  return state;
}
