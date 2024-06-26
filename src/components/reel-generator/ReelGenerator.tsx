"use client"

import React from 'react'
import { useGetVideosQuery, useUploadVideoFilesToTLMutation, useUploadYTVideoToTLMutation } from '@/redux/api/media'
import { useToast } from '../ui/use-toast'
import VideosList from './VideosList'
import VideoUploader from '../common/VideoUploader'
import { IMedia, VIDEO_TYPES } from '@/constants/video'

const ReelGenerator = () => {
  const { data, refetch } = useGetVideosQuery({tl:true}, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 60000 * 2,
    skipPollingIfUnfocused: true
  });

  const [uploadYTVideoApi, { isLoading: ytVideoApiIsLoading }] = useUploadYTVideoToTLMutation();
  const [uploadVideoFileApi, { isLoading: videoFileApiIsLoading }] = useUploadVideoFilesToTLMutation();

  const isLoading = ytVideoApiIsLoading || videoFileApiIsLoading;
  const { toast } = useToast();

  const handleVideoUpload = async (video: IMedia) => {
    try {
      if (video.type === VIDEO_TYPES.YOUTUBE) {
        const response = await uploadYTVideoApi({ url: video.data as string, thumbnail: video.thumbnail as string, name: video.title as string }).unwrap();
        if (response.success) {
          toast({ title: "Video uploaded successfully", description: "Your YouTube video was uploaded successfully. It will take around 5 minutes to process your video.", variant: "success" });
        }
      } else {
        const formData = new FormData();
        formData.append("video", video.data);
        const response = await uploadVideoFileApi(formData).unwrap();
        if (response.success) {
          toast({ title: "Video uploaded successfully", description: "Your video was uploaded successfully. It will take around 5 minutes to process your video.", variant: "success" });
        }
      }
      refetch();
    } catch (error) {
      toast({ title: "Video upload failed", description: "Video upload failed due to some reason, please try again.", variant: "destructive" });
      throw error;
    }
  };

  return (
    <div className="md:p-4 flex flex-col">
      <div className="mb-10">
        <h1 className="md:text-3xl text-2xl font-bold text-primary">Short-Form Video Generator</h1>
        <p className="text-gray-500 text-sm font-medium">Effortlessly transform lengthy content into captivating short-form videos. Enhance engagement and reach by generating concise, impactful videos from your extensive content library.</p>
      </div>
      <VideoUploader onUpload={handleVideoUpload} isLoading={isLoading} />
      <VideosList data={data?.data} />
    </div>
  );
};

export default ReelGenerator;
