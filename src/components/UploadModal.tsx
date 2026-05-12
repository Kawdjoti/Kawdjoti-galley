import React, { useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { compressImage } from '../lib/utils';
import { Upload, X, ImageIcon } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  mode: 'album' | 'image';
  albumId: string | null;
}

export default function UploadModal({ isOpen, onClose, user, mode, albumId }: UploadModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    url: '',
    category: '',
    coverImageUrl: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit for raw selection
        toast.error('File too large. Please select an image under 10MB.');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      let imageUrl = formData.url || formData.coverImageUrl;

      if (file) {
        toast.info('Processing image...', { duration: 1000 });
        imageUrl = await compressImage(file);
      }

      if (!imageUrl && mode === 'image') {
        toast.error('Please select an image or provide a URL.');
        setLoading(false);
        return;
      }

      if (mode === 'album') {
        await addDoc(collection(db, 'albums'), {
          name: formData.name,
          description: formData.description,
          coverImageUrl: imageUrl || `https://picsum.photos/seed/${formData.name}/800/600`,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
        toast.success('Collection Archived');
      } else {
        if (!albumId) throw new Error('No album selected');
        await addDoc(collection(db, 'images'), {
          title: formData.title,
          description: formData.description,
          url: imageUrl,
          category: formData.category,
          albumId,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
        toast.success('Object Successfully Archived');
      }
      
      handleClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, mode === 'album' ? 'albums' : 'images');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ name: '', title: '', description: '', url: '', category: '', coverImageUrl: '' });
    clearFile();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl bg-[#FAF9F6] border-none shadow-2xl p-8 max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif italic tracking-tight">
            {mode === 'album' ? 'Curate New Collection' : 'Archive New Object'}
          </DialogTitle>
          <DialogDescription className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold mt-2">
            Documenting for the visual record.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          {/* File Upload Area */}
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-bold">Source File</Label>
            {preview ? (
              <div className="relative rounded-lg overflow-hidden border border-black/10 group aspect-video bg-stone-100">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-black/20 hover:bg-black/[0.02] transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                  <Upload className="w-4 h-4 text-stone-400" />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Select Image File</p>
                <p className="text-[9px] text-stone-300 mt-1 uppercase">Max 10MB • Auto-Compressed</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div className="relative py-2 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-stone-200"></div>
            <span className="text-[9px] uppercase tracking-widest text-stone-300 font-bold">Or External Reference</span>
            <div className="flex-1 h-[1px] bg-stone-200"></div>
          </div>

          {mode === 'album' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Colloquial Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="e.g. Minimalist Intervals" 
                  required 
                  value={formData.name}
                  onChange={handleInputChange}
                  className="rounded-lg border-black/5 bg-white h-12 text-sm"
                />
              </div>
              {!file && (
                <div className="space-y-2">
                  <Label htmlFor="coverImageUrl" className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Cover URL</Label>
                  <Input 
                    id="coverImageUrl" 
                    name="coverImageUrl" 
                    placeholder="https://..." 
                    value={formData.coverImageUrl}
                    onChange={handleInputChange}
                    className="rounded-lg border-black/5 bg-white h-12 text-sm"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {!file && (
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Direct Image URL</Label>
                  <Input 
                    id="url" 
                    name="url" 
                    type="url"
                    placeholder="https://..." 
                    value={formData.url}
                    onChange={handleInputChange}
                    className="rounded-lg border-black/5 bg-white h-12 text-sm"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Subject Ref</Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Observation Identifier" 
                  value={formData.title}
                  onChange={handleInputChange}
                  className="rounded-lg border-black/5 bg-white h-12 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Genre</Label>
                  <Input 
                    id="category" 
                    name="category" 
                    placeholder="Portrait" 
                    value={formData.category}
                    onChange={handleInputChange}
                    className="rounded-lg border-black/5 bg-white h-12 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Coordinates</Label>
                  <Input 
                    id="description" 
                    name="description" 
                    placeholder="Location/Metadata" 
                    value={formData.description}
                    onChange={handleInputChange}
                    className="rounded-lg border-black/5 bg-white h-12 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <DialogFooter className="pt-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white hover:bg-neutral-800 rounded-full h-14 text-[10px] font-bold uppercase tracking-[0.3em] transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  Archiving...
                </div>
              ) : mode === 'album' ? 'Initialize Collection' : 'Archive Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
