import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { api } from '../../lib/axios';

export interface HlsUploaderRef {
  startUpload: (file: File) => Promise<{ key: string; duration: number }>;
  cancelUpload: () => void;
}

export const HlsVideoUploader = forwardRef<HlsUploaderRef, {}>((_props, ref) => {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const ffmpegRef = useRef(new FFmpeg());
  const loadPromiseRef = useRef<Promise<void> | null>(null);

  // Load FFmpeg WebAssembly on mount
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    if (ffmpegRef.current.loaded) {
      setLoaded(true);
      return;
    }
    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    setStatusText('Loading Video Processor Engine...');
    const p = (async () => {
      try {
        const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';
        const ffmpeg = ffmpegRef.current;

        ffmpeg.on('progress', ({ progress }) => {
          // progress is 0 to 1
          setProgress(Math.round(progress * 100));
        });

        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        });

        setLoaded(true);
        setStatusText('');
      } catch (err) {
        console.error(err);
        setStatusText('Error loading engine');
      } finally {
        loadPromiseRef.current = null;
      }
    })();

    loadPromiseRef.current = p;
    return p;
  };

  const extractDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        resolve(Math.ceil(videoElement.duration / 60)); // Return duration in minutes
      };
      videoElement.src = URL.createObjectURL(file);
    });
  };

  useImperativeHandle(ref, () => ({
    startUpload: async (file: File) => {
      setIsLoading(true);
      setProgress(0);
      try {
        const duration = await extractDuration(file);
        const ffmpeg = ffmpegRef.current;

        // If not loaded yet, wait for load to complete
        if (!ffmpeg.loaded) {
          setStatusText('Loading Video Processor Engine...');
          await load();
        }

        setStatusText('Writing file to memory...');
        await ffmpeg.writeFile('input.mp4', await fetchFile(file));

        // Define our resolutions for sequential encoding
        const RESOLUTIONS = [
          { name: '144p', scale: '-2:144', bitrate: '400k', bufsize: '800k', resolution_meta: '256x144' },
          { name: '360p', scale: '-2:360', bitrate: '800k', bufsize: '1200k', resolution_meta: '640x360' }
        ];

        let masterPlaylistContent = '#EXTM3U\n#EXT-X-VERSION:3\n';

        // Generate ONE unique folder ID for this entire lesson
        const folderId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // SEQUENTIAL PROCESSING TO SAVE RAM
        for (const res of RESOLUTIONS) {
          setStatusText(`Transcoding ${res.name} (This takes time)...`);
          setProgress(0);

          await ffmpeg.exec([
            '-i', 'input.mp4',
            '-threads', '5',
            '-preset', 'ultrafast',
            '-vf', `scale=${res.scale}`,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-b:v', res.bitrate,
            '-maxrate', res.bitrate,
            '-bufsize', res.bufsize,
            '-hls_time', '10',
            '-hls_playlist_type', 'vod',
            '-hls_segment_filename', `${res.name}_segment%03d.ts`,
            `${res.name}.m3u8`
          ]);

          setStatusText(`Uploading ${res.name} chunks...`);

          // Read generated files from WASM memory for this resolution
          const filesInDir = (await ffmpeg.listDir('/')).filter(f => !f.isDir && f.name.startsWith(res.name));

          // Get presigned URLs for this batch
          const filesPayload = filesInDir.map(f => ({
            filename: f.name,
            contentType: f.name.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/MP2T'
          }));

          const { data } = await api.post('/admin/upload/presign/batch', { 
            files: filesPayload,
            folderId 
          });
          const presignedUrls = data.data.presignedUrls;

          let uploadedCount = 0;
          for (const item of presignedUrls) {
            const fileData = await ffmpeg.readFile(item.filename);
            const blob = new Blob([fileData as any], {
              type: item.filename.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/MP2T'
            });

            await axios.put(item.uploadUrl, blob, {
              headers: { 'Content-Type': blob.type }
            });

            // FREE MEMORY IMMEDIATELY AFTER UPLOAD!
            await ffmpeg.deleteFile(item.filename);

            uploadedCount++;
            setProgress(Math.round((uploadedCount / presignedUrls.length) * 100));
          }

          // Build master playlist entries based on resolution
          const bandwidth = parseInt(res.bitrate.replace('k', '000'));
          masterPlaylistContent += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${res.resolution_meta}\n`;
          masterPlaylistContent += `${res.name}.m3u8\n`;
        }

        setStatusText('Finalizing master playlist...');
        // Write master.m3u8 manually
        await ffmpeg.writeFile('master.m3u8', masterPlaylistContent);

        // Upload master.m3u8
        const masterPayload = [{ filename: 'master.m3u8', contentType: 'application/vnd.apple.mpegurl' }];
        const { data: masterData } = await api.post('/admin/upload/presign/batch', { 
          files: masterPayload,
          folderId
        });
        const masterUpload = masterData.data.presignedUrls[0];

        const masterFileData = await ffmpeg.readFile('master.m3u8');
        const masterBlob = new Blob([masterFileData as any], { type: 'application/vnd.apple.mpegurl' });
        await axios.put(masterUpload.uploadUrl, masterBlob, { headers: { 'Content-Type': masterBlob.type } });

        await ffmpeg.deleteFile('master.m3u8');
        await ffmpeg.deleteFile('input.mp4'); // Clear original file from memory

        setStatusText('Upload Complete!');
        setIsLoading(false);
        return { key: masterUpload.key, duration };

      } catch (err: any) {
        if (err?.message === 'cancelled') {
          throw new Error('Upload cancelled by user');
        }
        console.error("Transcode Error: ", err);
        setIsLoading(false);
        setStatusText('Upload Failed');
        throw new Error(err.message || "An error occurred during transcoding.");
      }
    },
    cancelUpload: () => {
      // Force terminate the FFmpeg WebAssembly process
      try {
        ffmpegRef.current.terminate();
      } catch (e) {}
      setIsLoading(false);
      setStatusText('Cancelled');
      // Re-initialize FFmpeg so it can be used again without refreshing the page
      ffmpegRef.current = new FFmpeg();
      load();
    }
  }));

  if (!loaded && statusText) {
    return <div className="text-sm text-slate-500 animate-pulse">{statusText}</div>;
  }

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="space-y-2 p-4 border rounded-md bg-slate-50">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              {statusText}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
      {statusText === 'Upload Complete!' && (
        <div className="flex items-center gap-2 text-green-600 font-medium text-sm p-2 bg-green-50 rounded-md">
          <CheckCircle className="w-4 h-4" />
          <span>Video processed and uploaded securely!</span>
        </div>
      )}
    </div>
  );
});
