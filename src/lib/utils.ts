import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Compresses an image file to ensure it stays under the Firestore 1MB limit.
 */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.8, iteration = 0): Promise<string> {
  // Safety exit to prevent infinite recursion
  if (iteration > 8) {
    throw new Error('Image too complex to compress under archive limits (1MB). Please try a smaller file.');
  }

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
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.fillStyle = 'white'; 
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Firestore limit is 1,048,576 bytes.
        // Data URL characters are ~1 byte each.
        // We set target to 1,048,487 as requested.
        if (dataUrl.length > 1048487) {
          resolve(compressImage(file, maxWidth * 0.8, quality * 0.7, iteration + 1));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
