export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
    image.src = url;
  });

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    return null;
  }

  // Intelligent Multi-pass Compression Logic
  // Target: Keep Base64 under ~400KB to ensure doc stays under 1MB (Avatar + Banner)
  let quality = 0.8;
  let maxW = 800;
  let resultDataUrl = "";
  
  // First pass
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;
  if (targetWidth > maxW) {
    targetHeight = (maxW / targetWidth) * targetHeight;
    targetWidth = maxW;
  }
  
  croppedCanvas.width = targetWidth;
  croppedCanvas.height = targetHeight;
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, targetWidth, targetHeight
  );

  resultDataUrl = croppedCanvas.toDataURL('image/jpeg', quality);

  // If still too large (> 400KB raw), try more aggressive compression
  // 400KB raw = ~533KB Base64
  if (resultDataUrl.length > 550000) {
    quality = 0.6;
    maxW = 600;
    
    targetWidth = pixelCrop.width;
    targetHeight = pixelCrop.height;
    if (targetWidth > maxW) {
      targetHeight = (maxW / targetWidth) * targetHeight;
      targetWidth = maxW;
    }
    
    croppedCanvas.width = targetWidth;
    croppedCanvas.height = targetHeight;
    croppedCtx.clearRect(0, 0, targetWidth, targetHeight);
    croppedCtx.drawImage(
      canvas,
      pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
      0, 0, targetWidth, targetHeight
    );
    resultDataUrl = croppedCanvas.toDataURL('image/jpeg', quality);
  }

  // Final emergency pass if still too large
  if (resultDataUrl.length > 600000) {
    resultDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.4);
  }

  return resultDataUrl;
}
