import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import type { ConversionSettings } from '../shared/types';

export const defaultSettings: ConversionSettings = {
    videoCodec: 'libx264',
    audioCodec: 'aac',
    // videoBitrate: '2500k',
    videoBitrate: '1500k',
    audioBitrate: '128k',
    frameRate: '24',
    // frameRate: '30',
    // resolution: '1280x720',
    // resolution: '854x480',
    resolution: '640x360',
    compressionMethod: 'bitrate'
  };

export function useFFmpeg() {
  const [ffmpegLoadProgress, setFFmpegLoadProgress] = useState(0);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingFFmpeg, setIsLoadingFFmpeg] = useState(false);
  const ffmpegRef = useRef<any>(null);
  const ffmpegLoadPromise = useRef<Promise<boolean> | null>(null);

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegLoadPromise.current) {
      return ffmpegLoadPromise.current;
    }

    ffmpegLoadPromise.current = (async () => {
      try {
        setIsLoadingFFmpeg(true);
        setError(null);

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm';
        const ffmpeg = new FFmpeg();
        
        ffmpeg.on('progress', ({ progress }) => {
            setFFmpegLoadProgress(Math.round(progress * 100));
        });

        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        ffmpegRef.current = ffmpeg;
        return true;
      } catch (err) {
        console.error('FFmpeg loading error:', err);
        setError('Failed to load FFmpeg. Please try again.');
        return false;
      } finally {
        setIsLoadingFFmpeg(false);
      }
    })();

    return ffmpegLoadPromise.current;
  }, []);

  const getScaleFilter = (resolution: string) => {
    const [width] = resolution.split('x');
    // Force divisible by 2 for compatibility, maintain aspect ratio
    return `scale='min(${width},iw)':'-2'`;
  };

  const getCompressionArgs = (settings: ConversionSettings): string[] => {
    switch (settings.compressionMethod) {
      case 'percentage': {
        // For percentage, we'll use CRF with a scaled quality value
        // 100% = CRF 18 (best), 1% = CRF 51 (worst)
        const percentage = parseFloat(settings.targetPercentage || '100');
        const crf = Math.round(51 - ((percentage / 100) * (51 - 18)));
        return ['-qp', crf.toString()];
      }
      case 'filesize': {
        // For filesize target, we'll also use CRF with a moderate value
        // and rely on the two-pass encoding
        const targetSize = parseFloat(settings.targetFilesize || '100');
        // Larger target = lower CRF (better quality)
        const crf = Math.max(18, Math.min(51, Math.round(51 - (Math.log(targetSize) / Math.log(10240)) * (51 - 18))));
        return ['-qp', crf.toString()];
      }
      case 'crf':
        // FFmpeg.wasm uses -qp instead of -crf
        return ['-qp', settings.crfValue || '23'];
      case 'bitrate':
      default:
        return ['-b:v', settings.videoBitrate];
    }
  };

  const addWatermark = async (file: File, watermarkText: string, isMuted: boolean): Promise<{ file: File; url: string }> => {
    try {
      setError(null);
      
      if (!ffmpegRef.current) {
        const loaded = await loadFFmpeg();
        if (!loaded) throw new Error('Failed to load FFmpeg');
      }
  
    //   setCompressing(true);
      const ffmpeg = ffmpegRef.current;
      const { fetchFile } = await import('@ffmpeg/util');
  
      const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
      const outputFileName = 'output-watermarked.mp4';
      const fontFileName = 'arial.ttf';
  
      // Load files
      await ffmpeg.writeFile(inputFileName, await fetchFile(file));
      await ffmpeg.writeFile(fontFileName, await fetchFile('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/arial.ttf'));
  
      // Command to add watermark
      await ffmpeg.exec([
        '-i', inputFileName,
        '-vf', `scale=1280:-1,drawtext=fontfile=/${fontFileName}:text='${watermarkText}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=30:fontcolor=white@0.2`,
        ...(isMuted ? ['-an'] : ['-c:a', 'copy']), // Remove audio if muted, otherwise copy it
        '-b:v', defaultSettings.videoBitrate,
        '-preset', 'ultrafast',
        outputFileName,
      ]);
  
      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const watermarkedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '_watermarked.mp4', { type: 'video/mp4' });
  
      return {
        file: watermarkedFile,
        url: url,
      };
  
    } catch (err) {
      console.error('Watermarking error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during watermarking');
      throw err;
    } finally {
    //   setCompressing(false);
    }
  };

  const trimVideo = async (
    file: File,
    sections: { start: number; end: number; fileName: string }[],
    isMuted: boolean
  ): Promise<{ file: File; url: string }> => {
    try {
      setError(null);
  
      if (!ffmpegRef.current) {
        const loaded = await loadFFmpeg();
        if (!loaded) throw new Error('Failed to load FFmpeg');
      }
  
      setCompressing(true);
      const ffmpeg = ffmpegRef.current;
      const { fetchFile } = await import('@ffmpeg/util');
  
      const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
      const outputFileName = 'trimmed-output.mp4';
  
      await ffmpeg.writeFile(inputFileName, await fetchFile(file));
  
      // Process each section
      for (const { start, end, fileName } of sections) {
        await ffmpeg.exec([
          '-i', inputFileName,
          '-ss', start.toString(),
          '-to', end.toString(),
          ...(isMuted ? ['-an'] : ['-c:a', 'copy']),
          '-c:v', 'copy',
          fileName,
        ]);
      }
  
      // Create a concat list for merging
      const concatFileContent = sections.map(({ fileName }) => `file '${fileName}'`).join('\n');
      await ffmpeg.writeFile('concatList.txt', concatFileContent);
  
      // Merge trimmed sections
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concatList.txt',
        '-c', 'copy',
        outputFileName,
      ]);
  
      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const trimmedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '_trimmed.mp4', { type: 'video/mp4' });
  
      return { file: trimmedFile, url };
    } catch (err) {
      console.error('Trimming error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during trimming');
      throw err;
    } finally {
      setCompressing(false);
    }
  };
  
  

  const convert = async (file: File, settings: ConversionSettings): Promise<{ file: File, url: string }> => {
    try {
      setError(null);
      
      if (!ffmpegRef.current) {
        const loaded = await loadFFmpeg();
        if (!loaded) throw new Error('Failed to load FFmpeg');
      }

      setCompressing(true);
      setFileSizes({ original: file.size, converted: null });
      const ffmpeg = ffmpegRef.current;
      const { fetchFile } = await import('@ffmpeg/util');
      
      const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
      const outputFileName = 'output.mp4';
      
      await ffmpeg.writeFile(inputFileName, await fetchFile(file));

      const scaleFilter = getScaleFilter(settings.resolution);
      console.log("scaleFilter", scaleFilter);
      const compressionArgs = getCompressionArgs(settings);
      
      const command = [
        '-i', inputFileName,
        '-c:v', settings.videoCodec,
        '-c:a', settings.audioCodec,
        ...compressionArgs,
        '-b:a', settings.audioBitrate,
        '-r', settings.frameRate,
        '-vf', scaleFilter,
        '-preset', 'ultrafast',
        '-f', 'mp4',
        '-movflags', '+faststart',
        outputFileName
      ];

      await ffmpeg.exec(command);
      
      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([data], { type: 'video/mp4' });
      setFileSizes(prev => ({ ...prev, converted: blob.size }));
      
      const url = URL.createObjectURL(blob);
      const convertedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '_converted.mp4', { type: 'video/mp4' });

      return {
        file: convertedFile,
        url: url
      };

    } catch (err) {
      console.error('Conversion error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during conversion');
      throw err;
    } finally {
      setCompressing(false);
      setFFmpegLoadProgress(0);
    }
  };

  const [fileSizes, setFileSizes] = useState<{ original: number; converted: number | null }>({
    original: 0,
    converted: null
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return {
    convert,
    addWatermark,
    trimVideo,
    error,
    compressing,
    ffmpegLoadProgress,
    isLoadingFFmpeg,
    fileSizes,
    formatFileSize
  };
}