export async function uploadImageToCloudinary(
  file: File,
  cloudName: string,
  uploadPreset: string
): Promise<string> {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Please provide cloudName and uploadPreset.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json() as any;
    throw new Error(errorData?.error?.message || 'Failed to upload image');
  }

  const data = await response.json() as any;
  return data.secure_url;
}
