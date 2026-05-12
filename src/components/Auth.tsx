import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Welcome to Aura Gallery');
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] w-full max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">Personal Archive</p>
          <h2 className="text-6xl md:text-8xl font-serif italic tracking-tighter leading-[0.9] font-bold">
            The Art of <br /> Curating <br /> Memories.
          </h2>
          <p className="text-stone-500 max-w-sm leading-relaxed text-sm">
            Aura is a minimalist space for your visual journey. 
            Organize, archive, and relive your most significant moments with editorial precision.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="border-none bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] p-12 rounded-2xl max-w-md ml-auto">
            <CardHeader className="p-0 text-left mb-8">
              <CardTitle className="text-3xl font-serif italic tracking-tight mb-2">Access the Vault</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-40">Identify yourself to proceed</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full bg-black text-white hover:bg-neutral-800 rounded-full h-14 text-[10px] uppercase tracking-[0.25em] font-bold transition-all duration-300"
              >
                Authenticate with Google
              </Button>
              <p className="text-[10px] text-center uppercase tracking-widest opacity-30 leading-relaxed font-bold">
                By entering, you agree to our <br /> terms of aesthetic curation.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
