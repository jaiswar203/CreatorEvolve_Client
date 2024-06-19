"use client"

import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { CircleX, Link2 } from 'lucide-react';
import DropZone from "@/components/dropzone/Dropzone";
import { Button } from '../ui/button';
import Image from 'next/image';
import { Image as ImageIcon } from "lucide-react";
import { VIDEO_TYPES, IMedia } from '@/constants/video';
import { useToast } from '../ui/use-toast';

import { MdAudiotrack } from "react-icons/md";
import { getYouTubeVideoId } from '@/lib/utils';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

const DefaultVideoState = { type: VIDEO_TYPES.YOUTUBE, data: "", thumbnail: null, title: null, media_type: null };

interface VideoUploaderProps {
  onUpload: (video: IMedia) => Promise<void>;
  isLoading: boolean;
  acceptAudio?: boolean
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onUpload, isLoading, acceptAudio = false }) => {
  const [media, setMedia] = useState<IMedia>(DefaultVideoState);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();


  const handleYTInputChange = async (url: string) => {
    if (!url.length) {
      setError(null);
      setMedia({ type: VIDEO_TYPES.YOUTUBE, data: "", thumbnail: null, title: null, media_type: null });
      return;
    }

    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      setError("Please enter a valid YouTube URL link");
      setMedia({ type: VIDEO_TYPES.YOUTUBE, data: "", thumbnail: null, title: null, media_type: null });
      return;
    }

    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails`
      );

      if (response.data.items.length > 0) {
        const video = response.data.items[0];
        const thumbnail = video.snippet.thumbnails?.standard?.url || video.snippet.thumbnails?.high?.url;
        setMedia({ type: VIDEO_TYPES.YOUTUBE, data: url, title: video?.snippet?.title, thumbnail, media_type: "video" });
        setError("");
      } else {
        setError("Please enter a valid YouTube URL link");
      }
    } catch (error) {
      console.error('Error checking video:', error);
    }
  };

  const handleFileChange = (files: any) => {
    const file = files[0];

    if (file) {
      if (acceptAudio && file.type.startsWith('audio/')) {
        setMedia(prev => ({ ...prev, type: VIDEO_TYPES.FILE_UPLOAD, data: file, title: file.name, thumbnail: null, media_type: "audio" }));
      } else {
        setMedia({ data: file, title: file.name, thumbnail: null, media_type: "video" });
      }
      setError(null);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleUploadClick = async () => {
    try {
      await onUpload(media as IMedia);
      setMedia(DefaultVideoState);
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({ title: "Video upload failed", description: "Video upload failed due to some reason, please try again", variant: "destructive" });
    }
  };

  return (

    <div className="bg-slate-100 dark:bg-black w-full bg-opacity-50 p-6 border-1 rounded-md border-black border-opacity-5">
      <h1 className="md:text-2xl text-xl font-bold text-primary">Upload Videos {acceptAudio ? "/ Audios" : ""}</h1>
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-500">Upload video by URL</h4>
        <div className="mt-2 mb-5">
          <Input
            placeholder="Drop a YouTube link"
            className=""
            icon={<Link2 />}
            onChange={(event) => handleYTInputChange(event.target.value)}
          />
          {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
        </div>

        {!media.data ? (
          <DropZone onHandleChange={handleFileChange} acceptAudio={acceptAudio} />
        ) : (
          <div className="flex flex-col justify-start">
            <h4 className="text-sm font-medium mb-2">Video details</h4>
            <div className="flex items-center bg-slate-100 rounded-sm p-4 relative">
              <div className="absolute -top-2 -right-2" onClick={() => setMedia(DefaultVideoState)}>
                <CircleX color='red' />
              </div>
              {
                media?.thumbnail ?
                  <Image
                    src={media?.thumbnail as string}
                    width={80}
                    height={30}
                    className='rounded-sm mr-3'
                    alt={media.title as string}
                  /> :
                  <div className="flex justify-center items-center py-4 px-7 rounded-md mr-4 bg-white">
                    {
                      media.media_type==="video" ?
                        <ImageIcon size={25} /> : <MdAudiotrack size={25} />
                    }
                  </div>

              }
              <p className='text-sm text-gray-800 font-medium'>{media.title}</p>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-4">
          {media?.data && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files)}
                accept={acceptAudio ? 'video/*, audio/*' : 'video/*'}
              />
              <Button variant={"secondary"} className='mr-4' onClick={handleBrowseFiles} >
                Browse files
              </Button>
            </>
          )}
          <Button onClick={handleUploadClick} disabled={!media.data || isLoading} className='w-36' loading={{ isLoading, width: 30, height: 30 }}>
            Upload
          </Button>
        </div>
      </div>
    </div>

  );
};

export default VideoUploader;
