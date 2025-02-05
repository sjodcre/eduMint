import { X } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  onClose: () => void;
}

export default function VideoPlayer({ videoUrl, onClose }: VideoPlayerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video Player with Controls */}
      <video
        className="w-full h-auto max-w-4xl"
        controls
        autoPlay
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
