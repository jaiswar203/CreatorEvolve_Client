import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { IMedia, VIDEO_TYPES } from '@/constants/video';
import { MediaType } from '@/redux/interfaces/media';
import { useGetEnhancedAudioListQuery, useUploadAudioFileMutation, useUploadVideoFileMutation, useUploadVideoUrlMutation } from '@/redux/api/media';

import EnhanceTab from './EnhanceTab';
import EnhancedAudiosList from './EnhancedAudiosList';
import useSSE, { SSEData } from '@/hooks/useSSE';
import { useAppSelector } from '@/redux/hook';
import AnalyzeTab from './AnalyzeTab';
import AnalyzedAudioList from './AnalyzedAudioList';

const Enhance = () => {
    const [uploadYTVideoApi, { isLoading: ytVideoApiIsLoading }] = useUploadVideoUrlMutation();
    const [uploadVideoFileApi, { isLoading: videoFileApiIsLoading }] = useUploadVideoFileMutation();
    const [uploadAudioFileApi, { isLoading: audioFileApiIsLoading }] = useUploadAudioFileMutation();

    const { data: enhancedList, refetch } = useGetEnhancedAudioListQuery()

    const [media, setMedia] = useState<{ id: string, url: string, type: MediaType }>();
    const [dialogState, setDialogState] = useState({ upload: false, library: false });

    const isLoading = useMemo(() => ytVideoApiIsLoading || videoFileApiIsLoading || audioFileApiIsLoading, [ytVideoApiIsLoading, videoFileApiIsLoading, audioFileApiIsLoading]);

    const { toast } = useToast();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { user } = useAppSelector(state => state.user)

    const handleSSEMessage = (data: SSEData) => {
        if (data.status === 'success') {
            refetch()
            toast({ title: "Enhance Completed", description: "Your Enhanced file is ready", variant: "success" })
        } else if (data.status === "failed") {
            toast({ title: "Enhance Failed", description: "Enhance request failed", variant: "destructive" })
        }
    };

    useSSE(`media/audios/enhance/events/${user._id}`, handleSSEMessage)

    const handleTabChange = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('sub', value);
        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    const currentTab = searchParams.get('sub') || 'enhance';

    const onFileUploadHandler = useCallback(async (media: IMedia) => {
        try {
            let response: any;
            if (media.type === VIDEO_TYPES.YOUTUBE) {
                response = await uploadYTVideoApi({ url: media.data as string, thumbnail: media.thumbnail as string, name: media.title as string, quality: "high" }).unwrap();
            } else {
                const formData = new FormData();
                if (media.media_type === "audio") {
                    formData.append("audio", media.data);
                    response = await uploadAudioFileApi({ body: formData }).unwrap();
                    setMedia({ id: response.data._id, url: response.data.url, type: "audio" });
                } else {
                    formData.append("video", media.data);
                    response = await uploadVideoFileApi({ body: formData }).unwrap();
                    setMedia({ id: response.data._id, url: response.data.url, type: "video" });
                }
            }
            setDialogState(prev => ({ ...prev, upload: false }));
        } catch (error) {
            toast({ title: "Video upload failed", description: "Video upload failed due to some reason, please try again.", variant: "destructive" });
            throw error;
        }
    }, [uploadYTVideoApi, uploadAudioFileApi, uploadVideoFileApi, toast]);

    const onLibrarySelectHandler = useCallback(async (media: any, type: MediaType) => {
        if (!media) return;

        let url = media?.url;
        if (type === "video" && media?.type === VIDEO_TYPES.YOUTUBE) {
            url = media.url;
        }

        setMedia({ id: media._id, url, type });
        setDialogState(prev => ({ ...prev, library: false }));
    }, []);


    return (
        <div className='mt-5'>
            <div className="flex justify-center">
                <Tabs defaultValue={currentTab} onValueChange={handleTabChange} className='w-full'>
                    <TabsList className='w-full'>
                        <TabsTrigger className='w-full' value="enhance">Enhancer</TabsTrigger>
                        <TabsTrigger className='w-full' value="analyze">Analyzer</TabsTrigger>
                    </TabsList>
                    <TabsContent value="enhance">
                        <EnhanceTab
                            media={media}
                            onLibrarySelectHandler={onLibrarySelectHandler}
                            onFileUploadHandler={onFileUploadHandler}
                            isLoading={isLoading}
                            dialogState={dialogState}
                            setDialogState={setDialogState}
                            refetch={refetch}
                        />
                        {
                            enhancedList?.data &&
                            <EnhancedAudiosList data={enhancedList.data} refetch={refetch} />
                        }
                    </TabsContent>
                    <TabsContent value="analyze">
                        <AnalyzeTab
                            media={media}
                            onLibrarySelectHandler={onLibrarySelectHandler}
                            onFileUploadHandler={onFileUploadHandler}
                            isLoading={isLoading}
                            dialogState={dialogState}
                            setDialogState={setDialogState}
                            refetch={() => { }}
                        />
                        <AnalyzedAudioList handleTabChange={handleTabChange} />

                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Enhance;
