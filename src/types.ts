export interface Album {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  createdAt: any;
  userId: string;
}

export interface GalleryImage {
  id: string;
  title?: string;
  description?: string;
  url: string;
  albumId: string;
  category?: string;
  userId: string;
  createdAt: any;
}

export type ViewState = 'albums' | 'images';
