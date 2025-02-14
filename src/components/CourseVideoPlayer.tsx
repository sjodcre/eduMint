import { X } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  description?: string;
  onClose: () => void;
}

export default function VideoPlayer({ videoUrl, title, description, onClose }: VideoPlayerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
      {/* Close Button */}
      <button
        className="z-10 absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Video Player with Controls */}
        <video
          className="h-full w-full object-cover sm:object-scale-down"
          controls
          autoPlay
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Title and Description Overlay */}
        {(title || description) && (
          <div className="absolute bottom-8 left-8 right-8 text-white bg-black bg-opacity-50 p-4 rounded">
            {title && <h2 className="text-xl font-bold mb-2">{title}</h2>}
            {description && <p className="text-sm">{description}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
