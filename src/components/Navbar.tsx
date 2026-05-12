import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from './ui/button';
import { Camera, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="border-b border-[#1A1A1A]/10 bg-[#FAF9F6]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-12"
          >
            <div className="flex flex-col">
              <h1 className="text-2xl font-serif italic tracking-tighter font-bold">The Archive</h1>
            </div>
            
            {user && (
              <div className="hidden md:flex gap-8">
                <span className="text-xs uppercase tracking-widest font-bold border-b border-black pb-1 cursor-default">Gallery</span>
                <span className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/40 hover:text-black transition-colors cursor-pointer">Collections</span>
                <span className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/40 hover:text-black transition-colors cursor-pointer">Stories</span>
              </div>
            )}
          </motion.div>

          {user && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6"
            >
              <div className="hidden sm:block text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Curator</p>
                <p className="text-xs font-semibold">{user.displayName || user.email?.split('@')[0]}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-stone-200 border border-black/5 flex items-center justify-center relative group overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-4 h-4 text-stone-500" />
                )}
                <button 
                  onClick={() => signOut(auth)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}
