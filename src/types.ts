export interface Album {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  createdAt: any;
  userId: string;
}

export interface Photo {
  id: string;
  title?: string;
  description?: string;
  url: string;
  albumId: string;
  userId: string;
  createdAt: any;
}

export type ViewState = 'albums' | 'photos';
