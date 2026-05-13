import React, { useState } from 'react';
import { Photo } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ImageIcon, Maximize2, Trash2, X, Download } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface PhotoGridProps {
  photos: Photo[];
  albumId: string;
}

export default function PhotoGrid({ photos, albumId }: PhotoGridProps) {
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return (
      <div className="border border-dashed border-black/10 rounded-[2rem] p-20 text-center">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
        <h3 className="text-xl font-medium serif text-black/60">The Gallery is Quiet</h3>
        <p className="text-sm font-sans text-black/40 mt-2">Add your first masterpiece to this collection.</p>
      </div>
    );
  }

  const handleDeleteImage = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Permanently remove this object from your collection?')) return;
    
    try {
      await deleteDoc(doc(db, 'photos', id));
      toast.success('Object removed from archive');
      if (selectedImage?.id === id) setSelectedImage(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `photos/${id}`);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
        {photos.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.6 }}
            className="break-inside-avoid group relative cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative rounded-sm overflow-hidden bg-stone-200 group">
              <img 
                src={image.url} 
                alt={image.title} 
                className="w-full h-auto transition-all duration-1000 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#1A1A1A]/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between p-6 text-white backdrop-blur-[2px]">
                <div className="flex justify-end gap-3 translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-500">
                  <button 
                    onClick={(e) => handleDeleteImage(e, image.id)}
                    className="p-2.5 bg-white/10 backdrop-blur-md hover:bg-red-500/80 rounded-full transition-colors border border-white/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-colors border border-white/20">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="translate-y-[10px] group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-80 mb-1 font-bold">Archive Reference</p>
                  <h4 className="font-serif italic text-2xl drop-shadow-md">{image.title || 'Visual Record'}</h4>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-end px-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Archive ID: {image.id.slice(0, 8)}</p>
                <p className="text-xs font-serif italic opacity-60">Status: Documented</p>
              </div>
              <p className="text-[10px] opacity-20">{(image.createdAt?.toDate?.() || new Date(image.createdAt)).getFullYear()}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 sm:p-12"
          >
            <div className="absolute top-8 right-8 flex gap-4">
               <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedImage(null)}
                className="text-white hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-full max-h-[85vh]"
            >
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title} 
                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 text-center text-white max-w-2xl px-4"
            >
              <h3 className="text-2xl font-medium serif italic tracking-tight">{selectedImage.title || 'Untitled Artwork'}</h3>
              <p className="text-neutral-400 text-sm mt-2 leading-relaxed">{selectedImage.description || 'No description provided.'}</p>
              <div className="flex justify-center gap-4 mt-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(selectedImage.url, '_blank')}
                  className="rounded-full bg-white text-black hover:bg-neutral-200 uppercase text-[10px] tracking-widest px-6"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Source
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => handleDeleteImage(e, selectedImage.id)}
                  className="rounded-full text-white hover:bg-red-500/20 uppercase text-[10px] tracking-widest px-6 border border-white/20"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Discard
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
