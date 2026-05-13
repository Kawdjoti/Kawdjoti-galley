import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Album, Photo, ViewState } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ChevronLeft, Image as ImageIcon, FolderPlus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import AlbumList from './AlbumList';
import PhotoGrid from './PhotoGrid';
import UploadModal from './UploadModal';

interface GalleryProps {
  user: User;
}

export default function Gallery({ user }: GalleryProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'album' | 'photo'>('album');
  const [loading, setLoading] = useState(true);

  // Sync Albums
  useEffect(() => {
    const q = query(
      collection(db, 'albums'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const albumData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Album));

      // In-memory sort
      albumData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setAlbums(albumData);
      setLoading(false);
      // Auto-select first album if none selected
      if (albumData.length > 0 && !selectedAlbumId) {
        setSelectedAlbumId(albumData[0].id);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'albums');
    });

    return () => unsubscribe();
  }, [user.uid]);

  // Sync Photos for selected album
  useEffect(() => {
    if (!selectedAlbumId) {
      setPhotos([]);
      return;
    }

    const q = query(
      collection(db, 'photos'),
      where('albumId', '==', selectedAlbumId),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Photo));
      
      // Perform sorting in-memory to avoid manual FireStore indexes
      photoData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setPhotos(photoData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'photos');
    });

    return () => unsubscribe();
  }, [selectedAlbumId, user.uid]);

  const currentAlbum = albums.find(a => a.id === selectedAlbumId);

  return (
    <main className="flex flex-1 overflow-hidden h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1A1A1A]/10 p-8 hidden md:flex flex-col justify-between bg-[#FAF9F6] overflow-y-auto">
        <div className="space-y-10">
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Collections</p>
              <button 
                onClick={() => { setUploadMode('album'); setIsUploadOpen(true); }}
                className="p-1 hover:bg-black/5 rounded group"
              >
                <FolderPlus className="w-3 h-3 text-stone-400 group-hover:text-black" />
              </button>
            </div>
            <ul className="space-y-4">
              {albums.map((album) => (
                <li 
                  key={album.id}
                  onClick={() => setSelectedAlbumId(album.id)}
                  className={`flex justify-between items-center group cursor-pointer transition-colors ${selectedAlbumId === album.id ? 'text-black font-semibold' : 'text-stone-500 hover:text-black font-medium'}`}
                >
                  <span className={`text-sm ${selectedAlbumId === album.id ? 'italic serif' : ''}`}>{album.name}</span>
                  <span className="text-[10px] opacity-40">00</span> {/* Placeholder count */}
                </li>
              ))}
              {albums.length === 0 && (
                <li className="text-[10px] text-stone-400 uppercase tracking-widest mt-4 italic">No albums created</li>
              )}
            </ul>
          </div>
          
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-6">Archive State</p>
            <div className="w-full bg-stone-200 h-[2px] rounded-full">
              <div className="bg-black h-full w-[35%] rounded-full transition-all duration-1000"></div>
            </div>
            <p className="text-[10px] mt-2 font-medium opacity-60">1.2 GB / 10 GB Used</p>
          </div>
        </div>

        <div className="p-6 bg-stone-100 rounded-2xl">
          <p className="text-xs font-serif italic mb-2 leading-relaxed opacity-80">"Photography is the beauty of life captured."</p>
          <p className="text-[10px] uppercase tracking-wider font-bold opacity-40">— Tara Moore</p>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedAlbumId || 'no-selection'}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-1"
              >
                <div className="flex items-center gap-3 md:hidden mb-4">
                  <select 
                    className="text-[10px] uppercase tracking-widest bg-transparent border-none focus:ring-0 font-bold"
                    value={selectedAlbumId || ''}
                    onChange={(e) => setSelectedAlbumId(e.target.value)}
                  >
                    {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <h2 className="text-4xl font-serif italic tracking-tighter font-bold drop-shadow-sm">
                  {currentAlbum?.name || 'Your Archive'}
                </h2>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-400 font-bold">
                  {photos.length} Objects • Series: {currentAlbum?.description || 'Personal Collection'}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-4">
              <Button 
                onClick={() => { 
                  if (albums.length === 0) {
                    toast.error('Extract a new collection first to archive objects.');
                    setUploadMode('album');
                  } else {
                    setUploadMode('photo');
                  }
                  setIsUploadOpen(true); 
                }}
                className="bg-black text-white px-8 h-12 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>

          <div className="min-h-[50vh]">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-5 h-5 border border-black border-t-white rounded-full animate-spin" />
              </div>
            ) : selectedAlbumId ? (
              <PhotoGrid 
                photos={photos} 
                albumId={selectedAlbumId} 
              />
            ) : (
              <div className="py-24 text-center">
                <p className="text-sm font-serif italic text-stone-400">Select a collection to view the archive</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        user={user}
        mode={uploadMode}
        albumId={selectedAlbumId}
      />
    </main>
  );
}
