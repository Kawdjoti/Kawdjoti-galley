import React from 'react';
import { Album } from '../types';
import { motion } from 'motion/react';
import { Folder, MoreVertical, Trash2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from './ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { toast } from 'sonner';

interface AlbumListProps {
  albums: Album[];
  onSelect: (id: string) => void;
}

export default function AlbumList({ albums, onSelect }: AlbumListProps) {
  if (albums.length === 0) {
    return (
      <div className="border border-dashed border-black/10 rounded-[2rem] p-20 text-center">
        <Folder className="w-12 h-12 mx-auto mb-4 opacity-10" />
        <h3 className="text-xl font-medium serif text-black/60">No Collections Yet</h3>
        <p className="text-sm font-sans text-black/40 mt-2">Start by creating your first album to organize your images.</p>
      </div>
    );
  }

  const handleDeleteAlbum = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this album? All images within it will stay but become orphaned if not handled. (Note: Simple implementation)')) return;
    
    try {
      await deleteDoc(doc(db, 'albums', id));
      toast.success('Album removed');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `albums/${id}`);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {albums.map((album, index) => (
        <motion.div
          key={album.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className="cursor-pointer group"
          onClick={() => onSelect(album.id)}
        >
          <Card className="border-none bg-white shadow-sm hover:shadow-xl transition-all duration-500 rounded-3xl overflow-hidden h-full flex flex-col">
            <div className="aspect-[16/10] bg-neutral-100 overflow-hidden relative">
              {album.coverImageUrl ? (
                <img 
                  src={album.coverImageUrl} 
                  alt={album.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-10">
                  <Folder className="w-16 h-16" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="p-2 bg-white/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => handleDeleteAlbum(e, album.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Album
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardContent className="pt-6 pb-2">
              <h3 className="text-xl font-medium serif tracking-tight">{album.name}</h3>
              <p className="text-sm text-black/40 font-sans line-clamp-2 mt-1">
                {album.description || 'Collection of beautiful memories.'}
              </p>
            </CardContent>
            <CardFooter className="pb-6 pt-2">
              <div className="text-[10px] uppercase tracking-widest opacity-30 flex items-center gap-2">
                <span>EST. {new Date(album.createdAt.toDate?.() || album.createdAt).toLocaleDateString()}</span>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
