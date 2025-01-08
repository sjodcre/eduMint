import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
// import { useConnection } from '@arweave-wallet-kit/react';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
// import { useArweaveProvider } from '@/context/ProfileContext';
import { connect as aoConnect, createDataItemSigner, message, result } from '@permaweb/aoconnect';
import { getGQLData } from '@/shared/lib/gql-queries';
import { Upload } from 'lucide-react';
import { Progress } from './ui/progress';
import { processId, GATEWAYS } from "@/shared/config/config";
import { TagType, UploadVideosProps, Video } from '@/shared/types/common';
import { cleanProcessField, fileToBuffer } from '@/shared/utils/utils';
import { useArweaveProvider } from '@/context/ArweaveProvider';


const VideoUploader: React.FC<UploadVideosProps> = ({ onUpload }) => {
  const [video, setVideo] = useState<Video | null>(null);
  
  // const { connect: connectWallet } = useConnection();
  const [postDescription, setPostDescription] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const {walletAddress,selectedUser, wallet} = useArweaveProvider();
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  // const { connected } = useConnection();
  // const activeAddress = walletAddress;
  const hasLargeVideo = video?.size && video.size > 5 * 1024 * 1024; // 5MB in bytes

  const onDrop = useCallback( (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]; // Only take the first file
      const newVideo = {
        id: URL.createObjectURL(file),
        file,
        preview: URL.createObjectURL(file),
        size: file.size
      };
      setVideo(newVideo);
    }
  },[] )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'video/*': [] },
    maxFiles: 1 // Only allow one file
  });
  
  const createPosts = async (videoTxId: string, title: string, description: string) => {

    // console.log("arProvider.profile", arProvider.profile);

    // if (!arProvider.profile) {
    //   console.log("No profile found, cannot upload");
    //   return;
    // }

    // if (!manifestTxid) {
    //   toast({
    //     description: 'Please upload slides before creating the post.',
    //   });
    //   return;
    // }
    toast({
      description: "Storing on AO...",
    });
    try {
      // console.log("postTitle: ", title);
      // console.log("postDescription: ", description);
      const res = await message({
        process: processId,
        tags: [
          { name: "Action", value: "Create-Post" },
          { name: "VideoTxId", value: videoTxId },
          { name: "Title", value: title || "Untitled" },
          // { name: "Name", value: arProvider.profile.username || "ANON" },
          { name: "Name", value: "ANON" },
          // { name: "MediaType", value: mediaType.toString() || "video"}, // Add this tag
        ],
        data: description || "No description",
        // signer: createDataItemSigner(window.arweaveWallet),
        signer: createDataItemSigner(wallet),

      });

      const createResult = await result({
        process: processId,
        message: res,
      });

      console.log("Created successfully", createResult);
      console.log(createResult.Messages[0].Data);
      //   toast({
      //     description: "Post createad Successfully!!",
      //   });
      if (createResult.Messages[0].Data === "Post created successfully.") {
        toast({
          description: "Post created successfully!!",
        });
        console.log("Post created successfully!!")
      }
    } catch (error) {
      console.log(error);
    }
  };

  const uploadToArweave = async () => {
    // console.log("connected or not: ", connected);

    setUploading(true)
    setUploadProgress(1)
    const aos = aoConnect();

    if (!video) {
      toast({
        description: "No video to upload!"
      });
      setUploading(false)
      setUploadProgress(0)
      return;
    }
    // if (!connected) {
    //   setUploading(false);
    //   setUploadProgress(0)
    //   await connectWallet();
    // }

    if (walletAddress === null) {
      setUploading(false);
      setUploadProgress(0)
      console.log("no active address when uploading video")
      toast({
        title: "Please connect your Arweave wallet!",
        description: `You must connect your Arweave wallet to continue.`,
      })
      return
    }

    if (selectedUser === null) {
      setUploading(false);
      setUploadProgress(0)
      console.log("no profile when uploading video")
      toast({
        title: "Please create a profile at bazar first!",
        description: `You must create a profile at bazar first to continue. Go to profile for more details.`,
      })
      return
    }


    setUploadProgress(10)

    // const userAddress = await window.arweaveWallet.getActiveAddress()

    const videoTxIds: { txid: string; path: string; type: string }[] = [];

    try {
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const data = event.target?.result;
          if (data) {
            const dateTime = new Date().getTime().toString();
            // const title = "hardcode title";
            // const description = "hardcode description";
            const balance = 1;
            let contentType = video.file.type;
            console.log("contentType", contentType);
            try {
                const assetTags: TagType[] = [
                    { name: 'Content-Type', value: contentType },
                    // { name: 'Creator', value: arProvider?.profile?.id || "ANON" },
                    { name: 'Creator', value: "ANON" },
                    // { name: 'Title', value: title },
                    // { name: 'Description', value: description }, 
                    { name: 'Title', value: postTitle },
                    { name: 'Description', value: postDescription }, 
                    { name: 'Asset-Type', value: contentType },
                    { name: 'Implements', value: 'ANS-110' },
                    { name: 'Date-Created', value: dateTime },
                    { name: 'Action', value: 'Add-Uploaded-Asset' },
                    { name: 'topic:gaming', value: 'gaming' },
                    { name: 'License', value: 'dE0rmDfl9_OWjkDznNEXHaSO_JohJkRolvMzaCroUdw' },
                    { name: 'Currency', value: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10' },
                    { name: 'Access-Fee', value: 'One-Time-0.001' },
                    { name: 'Derivations', value: 'Allowed-With-One-Time-Fee-0.01' },
                    { name: 'Commercial-Use', value: 'Allowed-With-One-Time-Fee-0.01' },
                    { name: 'Data-Model-Training', value: 'Disallowed' },
                    { name: 'Payment-Mode', value: 'Single' },
                    { name: 'Payment-Address', value: 'dMAl8ZjkibRhma_rN8pDYiBW1DeWhvKYcBfqUfu-VhA' }
                ];
                const buffer: any = await fileToBuffer(video.file);
                let processSrc = null;
                try {
                    const processSrcFetch = await fetch("https://arweave.net/6-Km3rEooyc0lS4_mr9pksnJZNCHxb0XcsI7pSCE-yY");
                    if (processSrcFetch.ok) {
                        processSrc = await processSrcFetch.text();
                    }
                } catch (e: any) {
                    console.error(e);
                }
                setUploadProgress(15)
                // if (processSrc) {
                //     processSrc = processSrc.replaceAll('<CREATOR>', arProvider?.profile?.id || "ANON");
                //     processSrc = processSrc.replaceAll(`'<NAME>'`, cleanProcessField(title));
                //     processSrc = processSrc.replaceAll('<TICKER>', 'ATOMIC');
                //     processSrc = processSrc.replaceAll('<DENOMINATION>', '1');
                //     processSrc = processSrc.replaceAll('<BALANCE>', balance.toString());
                //     processSrc = processSrc.replaceAll('<COLLECTION>', "");
                // }
                if (processSrc) {
                  // processSrc = processSrc.replace(/<CREATOR>/g, arProvider?.profile?.id || "ANON");
                  processSrc = processSrc.replace(/<CREATOR>/g, "ANON");
                  processSrc = processSrc.replace(/'<NAME>'/g, cleanProcessField(postTitle));
                  processSrc = processSrc.replace(/<TICKER>/g, 'ATOMIC');
                  processSrc = processSrc.replace(/<DENOMINATION>/g, '1');
                  processSrc = processSrc.replace(/<BALANCE>/g, balance.toString());
                  processSrc = processSrc.replace(/<COLLECTION>/g, "");
              }

                let processId: string | undefined = undefined;
                let retryCount = 0;
                const maxSpawnRetries = 25;
                setUploadProgress(20)

                while (processId === undefined && retryCount < maxSpawnRetries) {
                    try {
                        processId = await aos.spawn({
                            module: "Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350",
                            scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
                            // signer: createDataItemSigner(window.arweaveWallet),
                            signer: createDataItemSigner(wallet),
                            tags: assetTags,
                            data: buffer,
                        });
                        console.log(`Asset process: ${processId}`);
                        setUploadProgress(25)
                    } catch (e: any) {
                        console.error(`Spawn attempt ${retryCount + 1} failed:`, e);
                        retryCount++;
                        if (retryCount < maxSpawnRetries) {
                            await new Promise((r) => setTimeout(r, 1000));
                        } else {
                            throw new Error(`Failed to spawn process after ${maxSpawnRetries} attempts`);
                        }
                    }
                }

                if (!processId) {
                    throw new Error("Failed to get valid process ID");
                }
                setUploadProgress(40)
                let fetchedAssetId: string | undefined = undefined;
                retryCount = 0;
                const maxFetchRetries = 100;
                while (fetchedAssetId === undefined) {
                    await new Promise((r) => setTimeout(r, 2000));
                    const gqlResponse = await getGQLData({
                        gateway: GATEWAYS.goldsky,
                        ids: [processId],
                        tagFilters: null,
                        owners: null,
                        cursor: null,
                    });

                    if (gqlResponse && gqlResponse.data.length) {
                        console.log(`Fetched transaction:`, gqlResponse.data[0].node.id);
                        fetchedAssetId = gqlResponse.data[0].node.id;
                        setUploadProgress(50)
                    } else {
                        console.log(`Transaction not found:`, processId);
                        retryCount++;
                        if (retryCount >= maxFetchRetries) {
                            throw new Error(
                                `Transaction not found after ${maxFetchRetries} attempts, process deployment retries failed`
                            );
                        }
                    }
                }

                if (fetchedAssetId) {
                    const evalMessage = await aos.message({
                        process: processId,
                        // signer: createDataItemSigner(window.arweaveWallet),
                        signer: createDataItemSigner(wallet),
                        tags: [{ name: 'Action', value: 'Eval' }],
                        data: processSrc || "",
                    });

                    const evalResult = await aos.result({
                        message: evalMessage,
                        process: processId,
                    });

                    if (evalResult) {
                        await aos.message({
                            process: processId,
                            // signer: createDataItemSigner(window.arweaveWallet),
                            signer: createDataItemSigner(wallet),
                            tags: [
                                { name: 'Action', value: 'Add-Asset-To-Profile' },
                                // { name: 'ProfileProcess', value: arProvider?.profile?.id || "ANON" },
                                { name: 'ProfileProcess', value: "ANON" },
                                { name: 'Quantity', value: balance.toString() },
                            ],
                            data: JSON.stringify({ Id: processId, Quantity: balance }),
                        });
                        videoTxIds.push({ txid: processId, path: "0", type: video.file.type });
                        resolve();
                    }
                } else {
                    toast({
                      description: "Error fetching from gateway",
                    });
                    reject(new Error("Error fetching from gateway"));
                }
            } catch (error) {
              reject(error);
            }
          }
        };
        reader.readAsArrayBuffer(video.file);
      });

        setUploadProgress(100)
        console.log('Images uploaded successfully:', videoTxIds[0].txid);
        toast({
          description: "Uploaded to Arweave!",
        });
        await createPosts(videoTxIds[0].txid, postTitle, postDescription);
        onUpload(videoTxIds[0].txid, postTitle, postDescription);

    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setUploading(false)
      setUploadProgress(0);

    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-800 p-6 rounded-lg shadow-lg">
      <div className="min-h-screen pb-24"> {/* Add min-height and bottom padding to ensure content is always scrollable */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-zinc-400 bg-zinc-700' : 'hover:border-zinc-500 hover:bg-zinc-700/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-zinc-400" />
          <p className="mt-2 text-sm text-zinc-400">Drag & drop a video here, or click to select a file</p>
        </div>
        {video && (
          <div className="mt-4">
            <video
              src={video.preview}
              controls
              className="w-full rounded-lg max-h-[60vh] object-contain"
            />
            <div className="flex flex-col gap-4 mt-4">
              <input
                type="text"
                placeholder="Enter video title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="p-2 border rounded text-black"
              />
              <textarea
                placeholder="Enter video description"
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
                className="p-2 border rounded text-black"
                rows={4}
              />
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              File: {video.file.name} ({(video.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          </div>
        )}
        <div className="flex items-center mt-4">
          <input type="checkbox" id="license" defaultChecked className="mr-2" />
          <label htmlFor="license" className="text-xs text-zinc-400">This asset will contain a license</label>
        </div>
        {hasLargeVideo && (
          <p className="text-red-500 mt-2 text-sm">Cannot upload videos larger than 5MB</p>
        )}
        {uploading && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-zinc-400 mt-2">Uploading... {uploadProgress}%</p>
          </div>
        )}
        <div className="flex justify-between mt-6">
          <Button
            onClick={uploadToArweave}
            disabled={hasLargeVideo || !video || uploading ||!postTitle || !postDescription }
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
          {/* <Button variant="outline" onClick={onCancel} disabled={uploading}>
            Cancel
          </Button> */}
        </div>
      </div>
    </div>
  );
};



export default VideoUploader;
