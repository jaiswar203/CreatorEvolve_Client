import React from 'react';
import Image from 'next/image';
import { getCloudFrontURL, trimText } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';
import { VIDEO_TYPES } from '@/constants/video';
import { useGetAudiosQuery, useGetVideosQuery } from '@/redux/api/media';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MdAudiotrack } from "react-icons/md";
import { MediaType } from '@/redux/interfaces/media';

interface MediaLibraryProps {
    onSelect: (media: any, type: MediaType) => void;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect }) => {
    const { data: videos } = useGetVideosQuery({});
    const { data: audios } = useGetAudiosQuery("")

    const handleSelect = (video: any,type:MediaType) => {
        onSelect(video, type);
    };

    return (
        <div className="flex items-start h-full">
            <Tabs defaultValue="videos" className='h-full'>
                <TabsList className=''>
                    <TabsTrigger className='w-full' value="videos">Videos</TabsTrigger>
                    <TabsTrigger className='w-full' value="audios">Audios</TabsTrigger>
                </TabsList>
                <TabsContent value="videos" className='overflow-auto relative h-48vh'>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
                        {videos?.data?.length && videos?.data?.map((video: any) => (
                            <div
                                className="flex flex-col cursor-pointer"
                                onClick={() => handleSelect(video,"video")}
                                key={video._id}
                            >
                                {video.thumbnail ? video.type === VIDEO_TYPES.YOUTUBE ? (
                                    <Image
                                        src={video.thumbnail}
                                        width={300}
                                        height={300}
                                        alt={video.name}
                                        className='rounded object-contain w-full'
                                    />
                                ) : (
                                    <div className="py-5 rounded bg-black flex justify-center items-center md:block">
                                        <Image
                                            src={getCloudFrontURL(video.thumbnail)}
                                            width={300}
                                            height={300}
                                            alt={video.name}
                                            className='rounded w-full'
                                        />
                                    </div>
                                ) : (
                                    <div className="flex w-full border-1 bg-gray-200 h-46 justify-center items-center rounded-md mr-4">
                                        <ImageIcon size={30} />
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 font-medium">{trimText(video.name, 35)}</p>
                            </div>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="audios" className='overflow-auto relative h-48vh'>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
                        {audios?.data?.length && audios?.data?.map((audio: any) => (
                            <div
                                className="flex flex-col cursor-pointer"
                                onClick={() => handleSelect(audio,"audio")}
                                key={audio._id}
                            >
                                <div className="flex w-48 border-1 bg-gray-200 h-40 justify-center items-center rounded-md mr-4">
                                    <MdAudiotrack size={30} />
                                </div>
                                <p className="text-xs text-gray-500 font-medium">{trimText(audio.name, 35)}</p>
                            </div>
                        ))}
                    </div>

                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MediaLibrary;
