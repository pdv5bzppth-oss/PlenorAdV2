export type AspectRatio = '16:9' | '4:3';

export interface CropDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getAspectRatioDimensions(ratio: AspectRatio): { width: number; height: number } {
  switch (ratio) {
    case '16:9':
      return { width: 16, height: 9 };
    case '4:3':
      return { width: 4, height: 3 };
  }
}

export async function cropImageToAspectRatio(
  file: File,
  aspectRatio: AspectRatio
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const { width: ratioWidth, height: ratioHeight } = getAspectRatioDimensions(aspectRatio);
      const targetRatio = ratioWidth / ratioHeight;
      const imageRatio = img.width / img.height;

      let sourceWidth = img.width;
      let sourceHeight = img.height;
      let sourceX = 0;
      let sourceY = 0;

      if (imageRatio > targetRatio) {
        sourceWidth = img.height * targetRatio;
        sourceX = (img.width - sourceWidth) / 2;
      } else {
        sourceHeight = img.width / targetRatio;
        sourceY = (img.height - sourceHeight) / 2;
      }

      const maxWidth = 1920;
      const scale = Math.min(1, maxWidth / sourceWidth);
      canvas.width = sourceWidth * scale;
      canvas.height = sourceHeight * scale;

      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, canvas.width, canvas.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 0.92);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
