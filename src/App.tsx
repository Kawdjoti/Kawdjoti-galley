/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Gallery from './components/Gallery';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f5f2ed] font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest opacity-50">Initializing Aura</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans flex flex-col">
      <Navbar user={user} />
      {!user ? (
        <main className="flex-1 flex items-center justify-center p-4">
          <Auth />
        </main>
      ) : (
        <Gallery user={user} />
      )}
      <Toaster position="top-center" />
    </div>
  );
}
