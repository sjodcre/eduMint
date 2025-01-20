import React, { useState, useRef } from 'react';
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import { processId, GATEWAYS } from "@/shared/config/config";
import { connect as aoConnect, createDataItemSigner, message, result } from '@permaweb/aoconnect';
import { useArweaveProvider } from '@/context/ArweaveProvider';
import { TagType, UploadVideosProps } from '@/shared/types';
import { cleanProcessField, fileToBuffer } from '@/shared/utils/utils';
import { getGQLData } from '@/shared/lib/gql-queries';
import { Progress } from './ui/progress';
import { defaultSettings, useFFmpeg } from '@/hooks/useFFMPEG';

// const ffmpeg = createFFmpeg({ log: true });

const VideoEditing: React.FC<UploadVideosProps> = ({ onUpload }) => {

  const {
    convert,
    addWatermark,
    trimVideo,
    compressing,
    fileSizes,
    formatFileSize
  } = useFFmpeg();

  // const [ffmpeg] = useState(() => createFFmpeg({ log: true }));
  // const ffmpeg = new FFmpeg();
  // const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [initialSliderValue, setInitialSliderValue] = useState(0);


  //video trimming states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [endTime, setEndTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [sections, setSections] = useState<{ start: number, end: number, fileName: string }[]>([]);
  // const [trimmedVideo, setTrimmedVideo] = useState<File | null>(null);

  //watermark states
  const [watermarkText, setWatermarkText] = useState<string>("your nana");
  const [isAddingWatermark, setIsAddingWatermark] = useState(false); // New state

  //arweave upload states
  const { walletAddress, selectedUser, wallet } = useArweaveProvider();
  const [postDescription, setPostDescription] = useState("");
  const [postTitle, setPostTitle] = useState("");


  //ui states
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  // const hasLargeVideo = videoFile?.size && videoFile.size > 3 * 1024 * 1024; // 3MB in bytes

  // useEffect(() => {
  //   const loadFFmpeg = async () => {
  //     const ffmpeg = new FFmpeg();
  //     await ffmpeg.load();


  //     console.log("keeps trying to load");
  //     if(isScriptLoaded) {
  //       return;
  //     }
  //     const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'

  //     try {
  //       console.log("Loading FFmpeg...");
  //       await ffmpeg.load({
  //         coreURL: `${baseURL}/ffmpeg-core.js`,
  //         wasmURL: `${baseURL}/ffmpeg-core.wasm`,
  //       });
  //       setIsScriptLoaded(true);
  //       console.log("FFmpeg loaded successfully!");
  //     } catch (error) {
  //       console.error("Error loading FFmpeg:", error);
  //     }
  //   };

  //   loadFFmpeg();
  //   setIsScriptLoaded(true);

  // }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const blobURL = URL.createObjectURL(file);
      console.log("blobURL", blobURL);
      console.log("file", file);
      setVideoFile(file);
      setVideoSrc(blobURL);
      setSections([]); // Reset sections when a new video is selected
      // setTrimmedVideo(null); // Reset trimmed video on new upload
    }
  };

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

    let videoToUpload = videoFile;

    if (videoToUpload === null) {
      toast({
        description: "No video to upload!"
      });
      return;
    }

    if (walletAddress === null) {
      setIsUploading(false);
      setUploadProgress(0)
      console.log("no active address when uploading video")
      toast({
        title: "Please connect your Arweave wallet!",
        description: `You must connect your Arweave wallet to continue.`,
      })
      return
    }

    if (selectedUser === null) {
      setIsUploading(false);
      setUploadProgress(0)
      console.log("no profile when uploading video")
      toast({
        title: "Please create a profile at bazar first!",
        description: `You must create a profile at bazar first to continue. Go to profile for more details.`,
      })
      return
    }



    // setUploadProgress(1)
    const aos = aoConnect();

    try {
      // Compress the video before upload
      videoToUpload = await handleCompress(videoToUpload);
      console.log(`Size after compression: ${(videoToUpload.size / (1024 * 1024)).toFixed(2)} MB`);
      // Upload logic continues here...
    } catch (error) {
      console.error("Compress process failed:", error);
    }


    setIsUploading(true)

    setUploadProgress(1)

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
            let contentType = videoToUpload.type;
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
              const buffer: any = await fileToBuffer(videoToUpload);
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
              // const maxSpawnRetries = 25;
              setUploadProgress(20)
              // while (processId === undefined && retryCount < maxSpawnRetries) {
              //   try {
              //     processId = await aos.spawn({
              //       module: "Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350",
              //       scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
              //       // signer: createDataItemSigner(window.arweaveWallet),
              //       signer: createDataItemSigner(wallet),
              //       tags: assetTags,
              //       data: buffer,
              //     });
              //     console.log(`Asset process: ${processId}`);
              //     setUploadProgress(25)
              //   } catch (e: any) {
              //     // console.error(`Spawn attempt ${retryCount + 1} failed:`, e);
              //     // retryCount++;
              //     // if (retryCount < maxSpawnRetries) {
              //     //   await new Promise((r) => setTimeout(r, 1000));
              //     // } else {
              //     //   throw new Error(`Failed to spawn process after ${maxSpawnRetries} attempts`);
              //     // }
              //     console.log("spawn failed", e);
              //   }
              // }        
              // if (!processId) {
              //   throw new Error("Failed to get valid process ID");
              // }

              const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

              const spawnTimeout = new Promise<string>((_, reject) =>
                setTimeout(() => reject(new Error("aos.spawn() timed out")), 30000)
              );

              try {
                await delay(2000); // Artificial delay before spawning the process

                const spawnPromise: Promise<string> = aos.spawn({
                  module: "Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350",
                  scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
                  signer: createDataItemSigner(wallet),
                  tags: assetTags,
                  data: buffer,
                });

                // Use Promise.race to set a timeout limit for the spawn operation
                processId = await Promise.race([spawnPromise, spawnTimeout]);

                if (!processId) throw new Error("Process ID is null or undefined");

                console.log(`Asset process: ${processId}`);
                setUploadProgress(25);

                await delay(2000); // Artificial delay after spawning the process

              } catch (e) {
                console.error("Spawn process failed:", e);
                toast({ description: `Upload failed: ${e instanceof Error ? e.message : "Unknown error"}` });
                return;
              }



              setUploadProgress(40)
              let fetchedAssetId: string | undefined = undefined;
              retryCount = 0;
              const maxFetchRetries = 200;
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
                  videoTxIds.push({ txid: processId, path: "0", type: videoToUpload.type });
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
        reader.readAsArrayBuffer(videoToUpload);
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
      setIsUploading(false)
      setUploadProgress(0);

    }
  };

  const convertToHHMMSS = (value: string) => {
    const secNum = parseInt(value, 10);
    let hours = Math.floor(secNum / 3600);
    let minutes = Math.floor((secNum - hours * 3600) / 60);
    let seconds = secNum - hours * 3600 - minutes * 60;
    let hoursString = hours.toString();
    let minutesString = minutes.toString();
    let secondsString = seconds.toString();
    if (hours < 10) {
      hoursString = `0${hours}`;
    }
    if (minutes < 10) {
      minutesString = `0${minutes}`;
    }
    if (seconds < 10) {
      secondsString = `0${seconds}`;
    }
    let time;
    if (hoursString === "00") {
      time = `${minutesString}:${secondsString}`;
    } else {
      time = `${hoursString}:${minutesString}:${secondsString}`;
    }
    return time;
  };

  // useEffect(() => {
  //   console.log("useeffect to set duration", videoSrc);
  //   if (videoRef && videoRef.current) {
  //     const currentVideo = videoRef.current;
  //     currentVideo.onloadedmetadata = () => {
  //       console.log("actually setting duration", currentVideo.duration);
  //       setVideoDuration(currentVideo.duration);
  //       setEndTime(currentVideo.duration);
  //     };
  //   }
  // }, [videoFile]);

  // const handlePauseVideo = () => {  
  //   if (videoRef.current) {
  //     videoRef.current.pause();
  //   }
  // };

  const updateOnSliderChange = (values: number[], handle: any) => {
    //   setTrimRange(values);
    let readValue = values[0];
    // setVideoTrimmedUrl('');
    if (handle) {
      readValue = values[handle] || 0;
      console.log("readValue", readValue);
      console.log("endTime", endTime);
      if (endTime !== readValue) {
        console.log("setting endTime", readValue);
        setEndTime(readValue);
      }
    } else {
      readValue = values[handle] || 0;
      // console.log("readValue", readValue);
      // console.log("initialSliderValue", initialSliderValue);
      if (initialSliderValue !== readValue) {
        setInitialSliderValue(readValue);
        if (videoRef && videoRef.current) {
          // console.log("setting currentTime", readValue);
          videoRef.current.currentTime = readValue;
          setStartTime(readValue);
        }
      }
    }
    console.log("readValue", readValue);

  };

  const handlePlay = () => {


    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Set up a timeupdate listener to pause at endTime
          const timeUpdateHandler = () => {
            if (videoRef.current && videoRef.current.currentTime >= endTime) {
              videoRef.current.pause();
              videoRef.current.removeEventListener('timeupdate', timeUpdateHandler);
            }
          };
          if (videoRef.current) {
            videoRef.current.addEventListener('timeupdate', timeUpdateHandler);
          }
        }).catch(error => {
          console.error("Error playing video:", error);
        });
      }
    }
  };

  const handleAddWatermark = async () => {
    if (!videoFile) {
      console.error('No video file selected.');
      return;
    }

    setIsAddingWatermark(true);

    try {
      const { file, url } = await addWatermark(videoFile, watermarkText, isMuted);
      setVideoFile(file);
      // setTrimmedVideo(file);
      setVideoSrc(url);
      toast({ description: 'Watermark added successfully!' });
    } catch (error) {
      console.error('Error adding watermark:', error);
      toast({ description: 'Failed to add watermark.', variant: 'destructive' });
    } finally {
      setIsAddingWatermark(false);
    }
  };

  const handleTrim = async () => {
    if (!videoFile) {
      console.error('No video file selected.');
      return;
    }

    try {
      const { file, url } = await trimVideo(videoFile, sections, isMuted);
      setVideoFile(file);
      // setTrimmedVideo(file);
      setVideoSrc(url);
      setSections([]); // Reset sections after successful trim and merge
      toast({ description: 'Trimming and merging successful!' });
    } catch (error) {
      console.error('Error trimming video:', error);
      toast({ description: 'Failed to trim video.', variant: 'destructive' });
    }
  };

  const handleCompress = async (file: File): Promise<File> => {
    // const ffmpeg = new FFmpeg();
    // await ffmpeg.load();
    try {

      if (file.size <= 5 * 1024 * 1024) {
        console.log("File is already under 5MB. Skipping compression.");
        return file; // Skip compression
      }

      // const inputName = file.name;
      // const outputName = `compressed-${inputName}`;
      // await ffmpeg.writeFile(inputName, await fetchFile(file));
      // // Calculate the target bitrate
      // const targetBitrate = Math.floor((5 * 1024 * 1024 * 8) / Math.max(1, duration));

      // // Compress the video
      // await ffmpeg.exec([
      //   "-i", inputName,
      //   "-b:v", `${targetBitrate}b`,
      //   "-maxrate", `${targetBitrate}b`,
      //   "-bufsize", `${targetBitrate / 2}b`,
      //   "-vf", "scale=w=1280:h=-1",
      //   "-c:a", "aac",
      //   "-b:a", "128k",
      //   outputName,
      // ]);

      // const compressedData = await ffmpeg.readFile(outputName);
      // const compressedFile = new File([compressedData], outputName, { type: "video/mp4" });

      // const compressedBlob = new Blob([compressedData], { type: "video/mp4" });
      // const compressedBlobUrl = URL.createObjectURL(compressedBlob);

      //@ts-ignore
      const { file: compressedFile, url: compressedBlobUrl } = await convert(file, defaultSettings);
      console.log(`Original size: ${formatFileSize(fileSizes.original)}`);
      console.log(`Converted size: ${formatFileSize(fileSizes.converted || 0)}`);
      // setCompressedVideoSrc(compressedBlobUrl);
      console.log(`Compressed file size: ${(compressedFile.size / (1024 * 1024)).toFixed(2)} MB`);

      return compressedFile;


    } catch (error) {
      console.error("Compression failed:", error);
      toast({ description: "Failed to compress video.", variant: "destructive" });
      throw error;
    } finally {
    }
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      { start: startTime, end: endTime, fileName: `section${sections.length + 1}.mp4` }]);
  };

  return (
    <div className="video-trimmer p-6 pb-24 bg-gray-800 rounded-lg shadow-lg max-h-screen overflow-y-auto">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {/* {processing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="text-center text-white flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-center">Processing... Please wait. Longer videos may take longer to process.</p>
          </div>
        </div>
      )} */}

      {isAddingWatermark && (
        <div
          className="fixed top-0 left-0 right-0 bottom-16 flex items-center justify-center bg-black bg-opacity-75 z-50"
          style={{ paddingBottom: '4rem' }} // Match your BottomNav height
        >
          <div className="text-center text-white flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-center">Watermarking... Please wait. Won't be long!</p>
          </div>
        </div>
      )}

      {compressing && (
        <div
          className="fixed top-0 left-0 right-0 bottom-16 flex items-center justify-center bg-black bg-opacity-75 z-50"
          style={{ paddingBottom: '4rem' }}
        >
          <div className="text-center text-white flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-center">Compressing video... Please wait.</p>
          </div>
        </div>
      )}
      {isUploading && (
        <div
          className="fixed top-0 left-0 right-0 bottom-16 flex items-center justify-center bg-black bg-opacity-75 z-50"
          style={{ paddingBottom: '4rem' }}
        >
          <div className="text-center text-white flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-center">Uploading video... {uploadProgress}% complete</p>
          </div>
        </div>
      )}

      {videoFile && videoSrc && (
        <div className="mt-4">
          <video
            key={videoSrc}
            ref={videoRef}
            src={videoSrc}
            controls
            className="w-full mb-4 rounded"
            onLoadedMetadata={() => {
              if (videoRef.current) {
                const duration = videoRef.current.duration || 0;
                console.log("actually setting duration", duration);
                setVideoDuration(duration);
                setEndTime(duration);
              }
            }}
          />

          <div className="w-full">
            <div className="mb-4 text-white">
              <h3 className="text-lg font-semibold mb-2">How to trim your video:</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Use the slider below to select start and end points for a section</li>
                <li>Click "Add Section" to save that section</li>
                <li>Repeat to add multiple sections if needed</li>
                <li>Click "Trim and Merge" when done to create your final video</li>
              </ol>
            </div>

            <Nouislider
              behaviour="drag"
              range={{ min: 0, max: videoDuration || 2 }}
              start={[0, videoDuration || 2]}
              step={1}
              connect
              onUpdate={(values, handle) => updateOnSliderChange(values.map(Number), handle)}
              className="w-full"
            />

            <div className="mb-4 text-white">
              Start duration: {convertToHHMMSS(startTime.toString())} &nbsp;
              End duration: {convertToHHMMSS(endTime.toString())}
            </div>

            <div className="flex space-x-4 mb-4">
              <Button
                onClick={handlePlay}
                className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
              >
                Preview Section
              </Button>
              <Button
                onClick={handleAddSection}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md shadow-md hover:bg-yellow-600">
                Add Section
              </Button>
            </div>

            {sections.length > 0 && (
              <div className="mb-4 text-gray-700 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-2 text-white">
                  Selected Sections
                </h2>
                <ul>
                  {sections.map((section, index) => (
                    <li key={index}>
                      <span className="text-white">Section {index + 1}:</span>
                      <span className="text-white">{convertToHHMMSS(section.start.toString())}</span>
                      <span className="text-white">- {convertToHHMMSS(section.end.toString())}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-4 mb-4 mt-4">
              <Button
                onClick={handleTrim}
                className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600">
                Trim and Merge
              </Button>
              {/* <Button 
                onClick={() => handleCompress(videoFile)}
                className="px-4 py-2 bg-purple-500 text-white rounded-md shadow-md hover:bg-purple-600">
                Test Compression
              </Button> */}
            </div>

            {/* {compressedVideoSrc && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Compressed Video Preview</h3>
                <video
                  src={compressedVideoSrc}
                  controls
                  className="w-full rounded shadow-lg"
                />
                <div className="flex text-white justify-between mb-1">
                  <span>Original size: {formatFileSize(fileSizes.original)}</span>
                  <span>Converted size: {formatFileSize(fileSizes.converted || 0)}</span>
                </div>
              </div>
            )} */}

            {videoDuration > 30 ? (
              <div className="text-red-500 mb-4">
                Video is too long. Please trim first - maximum duration is 30 seconds.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter watermark text"
                    className="p-2 border rounded text-black"
                    onChange={(e) => setWatermarkText(e.target.value)}
                  />
                  <Button
                    onClick={handleAddWatermark}
                    className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600"
                  >
                    Add Watermark
                  </Button>
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isMuted}
                    onChange={() => setIsMuted(!isMuted)}
                    className="form-checkbox h-5 w-5 text-blue-500"
                  />
                  <span className="text-gray-400">Mute Video</span>
                </label>
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
              </div>

            )}
          </div>

          <p className="mt-2 text-sm text-zinc-400">
            File: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
          </p>

        </div>
      )}
      <div className="flex items-center mt-4">
        <input type="checkbox" id="license" defaultChecked className="mr-2" />
        <label htmlFor="license" className="text-xs text-zinc-400">This asset will contain a license</label>
      </div>
      {/* {hasLargeVideo && (
        <p className="text-red-500 mt-2 text-sm">Cannot upload videos larger than 5MB</p>
      )} */}
      {isUploading && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-zinc-400 mt-2">Uploading... {uploadProgress}%</p>
        </div>
      )}
      <div className="flex justify-between mt-6 mb-4">
        <Button
          onClick={uploadToArweave}
          disabled={!videoFile || isUploading || !postTitle || !postDescription}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </div>
  );
};

export default VideoEditing;
