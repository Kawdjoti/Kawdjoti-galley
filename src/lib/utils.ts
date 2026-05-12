import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Compresses an image file to ensure it stays under the Firestore 1MB limit.
 */
export async function compressImage(file: File, maxWidth = 1000, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Final check: Firestore limit is 1,048,576 bytes. 
        // Data URL characters are 1 byte each.
        if (dataUrl.length > 1040000) {
          // If still too large, recursively try with lower quality
          resolve(compressImage(file, maxWidth * 0.8, quality * 0.8));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}
