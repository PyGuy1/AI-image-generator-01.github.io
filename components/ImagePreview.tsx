
import React from 'react';
import { SparklesIcon, ArrowPathIcon } from './Icons';

interface ImagePreviewProps {
  src?: string;
  label: string;
  alt: string;
  isLoading?: boolean;
  loadingText?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, label, alt, isLoading = false, loadingText = "Loading..." }) => {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-gray-300">{label}</h2>
      <div className="relative w-full aspect-square bg-gray-800/70 rounded-lg border border-gray-700 overflow-hidden flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center p-4">
            <ArrowPathIcon className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="mt-2 text-lg font-medium">{loadingText}</p>
          </div>
        )}
        {!src && !isLoading && (
            <div className="flex flex-col items-center justify-center text-gray-500">
                <SparklesIcon className="w-12 h-12" />
                <p className="mt-2 font-medium">Your edited image will appear here</p>
            </div>
        )}
        {src && <img src={src} alt={alt} className="object-contain w-full h-full" />}
      </div>
    </div>
  );
};

export default ImagePreview;
