"use client"

import React, { useRef, useState } from 'react'
import axios from 'axios'
import { Input } from "@/components/ui/input"
import { CircleX, Link2 } from 'lucide-react'
import DropZone from "@/components/dropzone/Dropzone"
import { Button } from '../ui/button'
import Image from 'next/image'
import { Image as ImageIcon } from "lucide-react"
import { useGetVideosQuery, useUploadVideoFilesMutation, useUploadYTVideoMutation } from '@/redux/api/video'
import { useToast } from '../ui/use-toast'
import VideosList from './VideosList'
import { VIDEO_TYPES } from '@/constants/video'

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY


interface IVideo {
  type: VIDEO_TYPES,
  data: string | File,
  thumbnail?: string | null
  title: string | null
}

const DefaultVideoState: IVideo = { type: VIDEO_TYPES.YOUTUBE, data: "", thumbnail: null, title: null }

const ReelGenerator = () => {
  const [video, setVideo] = useState<IVideo>(DefaultVideoState);
  const [error, setError] = useState<string | null>(null);

  const { data, refetch, isLoading: isVideosListLoading, isFetching } = useGetVideosQuery(null, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 60000 * 2,
    skipPollingIfUnfocused: true
  })

  const [uploadYTVideoApi, { isLoading: ytVideoApiIsLoading }] = useUploadYTVideoMutation()
  const [uploadVideoFileApi, { isLoading: videoFileApiIsLoading }] = useUploadVideoFilesMutation()

  const isLoading = ytVideoApiIsLoading || videoFileApiIsLoading

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { toast } = useToast()

  const getYouTubeVideoId = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v');
    } catch (e) {
      return null;
    }
  };

  const handleYTInputChange = async (url: string) => {
    if (!url.length) {
      setError(null);
      setVideo({ type: VIDEO_TYPES.YOUTUBE, data: "", thumbnail: null, title: null });
      return;
    }

    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      setError("Please enter valid youtube url link");
      setVideo({ type: VIDEO_TYPES.YOUTUBE, data: "", thumbnail: null, title: null });
      return;
    }

    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails`
      );

      if (response.data.items.length > 0) {
        const video = response.data.items[0];
        const thumbnail = video.snippet.thumbnails?.standard?.url || video.snippet.thumbnails?.high?.url;
        setVideo(prev => ({ type: VIDEO_TYPES.YOUTUBE, data: url, title: video?.snippet?.title, thumbnail }));
        setError("");
      } else {
        setError("Please enter valid youtube url link");
      }
    } catch (error) {
      console.error('Error checking video:', error);
    }
  };

  const handleFileChange = (files: any) => {
    const file = files[0];

    if (file) {
      setVideo(prev => ({ ...prev, type: VIDEO_TYPES.FILE_UPLOAD, data: file, title: file.name, thumbnail: null }));
      setError(null);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleUploadClick = async () => {
    try {
      if (video.type === VIDEO_TYPES.YOUTUBE) {
        const response = await uploadYTVideoApi({ url: video.data as string, thumbnail: video.thumbnail as string, name: video.title as string }).unwrap()
        if (response.success)
          toast({ title: "Video uploaded successfully", description: "Your youtube video uploaded sucessfully, it will take around 5 minute to process your video", variant: "success" })
      } else {
        const formData = new FormData()
        formData.append("video", video.data)
        const response = await uploadVideoFileApi(formData).unwrap()
        if (response.success)
          toast({ title: "Video uploaded successfully", description: "Your video uploaded sucessfully, it will take around 5 minute to process your video", variant: "success" })
      }
      setVideo(DefaultVideoState)
      refetch()
    } catch (error) {
      toast({ title: "Video upload failed", description: "Video upload is failed due to some reason, please try again", variant: "destructive" })
    }
  };

  return (
    <div className="md:p-4 flex items-center flex-col">
      <h1 className="md:text-4xl text-2xl font-bold mb-10 text-primary">Short/Reel Generator</h1>
      <div className="bg-slate-100 dark:bg-black w-full bg-opacity-50 p-6 border-1 rounded-md border-black border-opacity-5">
        <h1 className="md:text-2xl text-xl font-bold text-primary">Upload Videos</h1>
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

          {!video.data ? (
            <DropZone onHandleChange={handleFileChange} />
          ) : (
            <div className="flex flex-col justify-start">
              <h4 className="text-sm font-medium mb-2">Video details</h4>
              <div className="flex items-center bg-slate-100 rounded-sm p-4 relative">
                <div className="absolute -top-2 -right-2" onClick={() => setVideo(DefaultVideoState)}>
                  <CircleX color='red' />
                </div>
                {video.thumbnail ?
                  <Image
                    src={video.thumbnail as string}
                    width={80}
                    height={30}
                    className='rounded-sm mr-3'
                    alt={video.title as string}
                  /> :
                  <div className="flex justify-center items-center py-5 px-8 rounded-md mr-4 bg-white">
                    <ImageIcon size={20} />
                  </div>
                }
                <p className='text-sm text-gray-800 font-medium'>{video.title}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-4">
            {video?.data && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files)}
                  accept='video/*'
                />
                <Button variant={"secondary"} className='mr-4' onClick={handleBrowseFiles} >
                  Browse files
                </Button>
              </>
            )}
            <Button onClick={handleUploadClick} disabled={!video.data || isLoading} className='w-36' loading={{ isLoading, width: 30, height: 30 }}>
              Upload
            </Button>
          </div>
        </div>
      </div>
      <VideosList data={data?.data} />
    </div>
  );
};

export default ReelGenerator;
