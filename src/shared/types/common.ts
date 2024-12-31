export type TagType = { name: string; value: string };

export type TagFilterType = { name: string; values: string[]; match?: string };

export type ProfileHeaderType = AOProfileType;

export type AOProfileType = {
    id: string;
    walletAddress: string;
    displayName: string | null;
    username: string | null;
    bio: string | null;
    profileImage: string | null;
    banner: string | null;
    version: string | null;
  };
  
  export interface Video {
    id: string;
    file: File;
    preview: string;
    size: number;
  }

  export interface UploadVideosProps {
    onUpload: (videoTxId: string | null, title: string, description: string) => void;
    // onCancel: () => void;
    
  }