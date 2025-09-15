
/**
 * Converts a File object to a base64 encoded string and a data URL.
 * @param file The file to convert.
 * @returns A promise that resolves with the dataUrl, base64 string, and mimeType.
 */
export const fileToDataUrl = (
  file: File
): Promise<{ dataUrl: string; base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // The result from readAsDataURL is in the format: data:[<mime_type>];base64,[<base64_data>]
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error("Failed to extract base64 data from file."));
        return;
      }
      resolve({ dataUrl: result, base64, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
};
