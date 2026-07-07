import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';

/**
 * Pick an image from the device library and upload to Supabase Storage.
 * @param userId - The user's ID (used as folder prefix)
 * @param bucket - The storage bucket name ('patients' or 'medical-docs')
 * @returns The public URL of the uploaded image, or an error
 */
export async function pickAndUploadImage(
  userId: string,
  bucket: 'patients' | 'medical-docs' = 'patients'
): Promise<{ url: string | null; error: string | null }> {
  // Request permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return { url: null, error: 'Media library permission not granted.' };
  }

  // Launch picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.[0]) {
    return { url: null, error: 'Image selection cancelled.' };
  }

  const asset = result.assets[0];
  const ext = asset.uri.split('.').pop() ?? 'jpg';
  const filePath = `${userId}/avatar.${ext}`;

  try {
    const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
    const arrayBuffer = decode(base64);

    // Upload
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, arrayBuffer, {
      upsert: true,
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    });

    if (uploadError) {
      // Provide a clearer message for the common "Bucket not found" error
      if (uploadError.message?.toLowerCase().includes('bucket') || uploadError.message?.toLowerCase().includes('not found')) {
        return {
          url: null,
          error: `Storage bucket "${bucket}" does not exist. Please run the 00016_create_storage_bucket.sql migration in the Supabase SQL Editor to create it.`,
        };
      }
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Failed to process image' };
  }
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(bucket: string, path: string) {
  return supabase.storage.from(bucket).remove([path]);
}

/**
 * Get a public URL for a storage path.
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
