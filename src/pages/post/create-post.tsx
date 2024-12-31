import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import type {UDLLicense} from "../../shared/types/user"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../../components/ui/drawer';
import { Button } from '../../components/ui/button';

// interface CreatePostDrawerProps {
//   onSubmit: (data: PostFormData) => void;
// }

export interface PostFormData {
  title: string;
  description: string;
  price: number;
  license: UDLLicense;
  videoFile?: File;
}

// const LICENSE_OPTIONS: UDLLicense[] = [
//   'CC0',
//   'CC-BY',
//   'CC-BY-SA',
//   'CC-BY-NC',
//   'CC-BY-ND',
//   'CC-BY-NC-SA',
//   'CC-BY-NC-ND'
// ];

export function CreatePostDrawer() {
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    description: '',
    price: 0,
    license: 'CC-BY',
  });
  const [videoPreview, setVideoPreview] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, videoFile: file }));
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   onSubmit(formData);
  // };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>
          <Plus className="text-white" size={24} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-gray-200 overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Create New Post</DrawerTitle>
        </DrawerHeader>
        
        <form  className="space-y-6 mt-6">
          {/* Video Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Upload Video
            </label>
            <div className="relative">
              {videoPreview ? (
                <video
                  src={videoPreview}
                  className="w-full h-48 object-cover rounded-lg"
                  controls
                />
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary hover:bg-accent hover:bg-opacity-10 transition-colors">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <span className="mt-2 text-sm text-muted-foreground">
                    Click to upload video
                  </span>
                </label>
              )}
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md border-input bg-background"
              placeholder="Enter video title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md border-input bg-background"
              rows={4}
              placeholder="Describe your video"
              required
            />
          </div>

          {/* Price */}
          {/* <div>
            <label className="block text-sm font-medium mb-1">
              Price (AR)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="w-full pl-10 pr-3 py-2 border rounded-md border-input bg-background"
                placeholder="0.00"
                required
              />
            </div>
          </div> */}

          {/* License */}
          {/* <div>
            <label className="block text-sm font-medium mb-1">
              License
            </label>
            <select
              value={formData.license}
              onChange={e => setFormData(prev => ({ ...prev, license: e.target.value as UDLLicense }))}
              className="w-full px-3 py-2 border rounded-md border-input bg-background"
              required
            >
              {LICENSE_OPTIONS.map(license => (
                <option key={license} value={license}>
                  {license}
                </option>
              ))}
            </select>
          </div> */}

          {/* Submit Button */}
          <DrawerClose>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Post Video
          </Button>
          </DrawerClose>
        </form>
      </DrawerContent>
    </Drawer>
  );
}