
import React, { useState, useCallback, ChangeEvent } from 'react';
import { editImage, EditImageResult } from './services/geminiService';
import { fileToDataUrl } from './utils/fileUtils';
import { UploadIcon, SparklesIcon, XCircleIcon, ArrowPathIcon, ArrowDownTrayIcon } from './components/Icons';
import ImagePreview from './components/ImagePreview';

type FileData = {
  dataUrl: string;
  base64: string;
  mimeType: string;
};

const App: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<FileData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editedResult, setEditedResult] = useState<EditImageResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setError(null);
        setEditedResult(null);
        const { dataUrl, base64, mimeType } = await fileToDataUrl(file);
        setOriginalFile({ dataUrl, base64, mimeType });
      } catch (err) {
        setError('Failed to read the image file. Please try another one.');
        setOriginalFile(null);
      }
    }
  };

  const handleEditRequest = useCallback(async () => {
    if (!originalFile || !prompt.trim()) {
      setError('Please upload an image and provide an editing prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedResult(null);
    try {
      const result = await editImage(originalFile.base64, originalFile.mimeType, prompt);
      setEditedResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Editing failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalFile, prompt]);

  const handleDownload = () => {
    if (!editedResult?.imageDataUrl) return;

    const link = document.createElement('a');
    link.href = editedResult.imageDataUrl;
    
    const mimeType = editedResult.imageDataUrl.split(';')[0].split(':')[1] || 'image/png';
    const extension = mimeType.split('/')[1] || 'png';
    link.download = `ai-edited-image.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetState = () => {
    setOriginalFile(null);
    setPrompt('');
    setEditedResult(null);
    setError(null);
    setIsLoading(false);
  };

  const FileUploader = () => (
    <div className="w-full max-w-2xl mx-auto">
      <label
        htmlFor="file-upload"
        className="relative block w-full h-80 rounded-lg border-2 border-dashed border-gray-600 p-12 text-center hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 cursor-pointer bg-gray-800/50"
      >
        <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
        <span className="mt-2 block text-sm font-medium text-gray-400">
          Upload a photo to edit
        </span>
        <span className="mt-1 block text-xs text-gray-500">
          PNG, JPG, GIF up to 10MB
        </span>
      </label>
      <input
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg, image/gif"
        onChange={handleFileChange}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
             <SparklesIcon className="w-10 h-10 text-indigo-400" />
             <h1 className="text-4xl md:text-5xl font-extrabold">AI Photo Studio</h1>
          </div>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Powered by Gemini NanoBanana. Describe an edit, and watch the magic happen.
          </p>
        </header>

        {!originalFile ? (
          <FileUploader />
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <ImagePreview src={originalFile.dataUrl} label="Original" alt="User uploaded original image" />
              <div className="flex flex-col gap-4">
                <ImagePreview
                  src={editedResult?.imageDataUrl || undefined}
                  label="Edited"
                  alt="AI edited image"
                  isLoading={isLoading}
                  loadingText="AI is performing magic..."
                />
                 {editedResult?.imageDataUrl && !isLoading && (
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-all duration-300"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Download Edited Image
                  </button>
                )}
                {editedResult?.text && (
                   <p className="text-sm bg-gray-800 p-4 rounded-md border border-gray-700 text-gray-300">{editedResult.text}</p>
                )}
              </div>
            </div>

            <div className="mt-8 max-w-3xl mx-auto bg-gray-800/50 border border-gray-700 rounded-lg p-6 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <SparklesIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'add a futuristic city in the background'"
                  className="w-full bg-gray-900 border border-gray-600 rounded-md py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  disabled={isLoading}
                />
                <button
                  onClick={handleEditRequest}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="animate-spin h-5 w-5" />
                      Editing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      Generate Edit
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={resetState}
                className="text-gray-400 hover:text-white transition"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {error && (
            <div className="fixed bottom-10 right-10 bg-red-500 text-white p-4 rounded-lg shadow-xl max-w-sm flex items-start gap-3">
              <XCircleIcon className="h-6 w-6 flex-shrink-0" />
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-100 hover:text-white">&times;</button>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
