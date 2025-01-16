import { useState } from 'react'
// import VideoUploader from '../../components/VideoUploader';
import { useContext } from 'react';
import { ScreenContext } from '@/context/ScreenContext';
import VideoEditing from '@/components/VideoEditing';
export default function Upload() {
 const [showVideoUploader, setShowVideoUploader] = useState(true);
 const {setCurrentScreen} = useContext(ScreenContext)
  const handleUpload = (manifestTxid: string | null) => {
    console.log('Upload completed with manifestTxid:', manifestTxid);
    // Handle post-upload actions here
    setShowVideoUploader(false);
    setCurrentScreen("videofeed")
  };

  // const handleCancel = () => {
  //   console.log('Upload canceled');
  //   setShowVideoUploader(false);
  // };


  return (
    <div>
   {showVideoUploader && (
            <div className="mt-4 w-full">
              {/* <VideoUploader onUpload={handleUpload} /> */}
              <VideoEditing onUpload={handleUpload} />
            </div>
          )}
  </div>
  )
}