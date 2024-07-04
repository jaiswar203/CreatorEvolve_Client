import { IMedia } from '@/constants/video';
import { MediaType } from '@/redux/interfaces/media';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import MediaLibrary from '@/components/MediaLibrabry/MediaLibrabry';
import VideoUploader from '@/components/common/VideoUploader';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MdFileUpload, MdVideoLibrary } from 'react-icons/md';
import { getYouTubeVideoId } from '@/lib/utils';
import { dolbyContentTypes } from "./default";
import { useDiagnoseAudioMutation, useGenerateDetailedInfoOnLoudnessMutation, useGetDiagnosedAudioListQuery } from '@/redux/api/media';
import { useToast } from '@/components/ui/use-toast';

interface AnalyzeTabProps {
    media: { id: string, url: string, type: MediaType } | undefined;
    onLibrarySelectHandler: (media: any, type: MediaType) => Promise<void>;
    onFileUploadHandler: (media: IMedia) => Promise<void>;
    isLoading: boolean;
    dialogState: { upload: boolean, library: boolean }
    setDialogState: Dispatch<SetStateAction<{ upload: boolean, library: boolean }>>
    refetch: () => void
}


const AnalyzeTab: React.FC<AnalyzeTabProps> = ({ dialogState, isLoading, media, onFileUploadHandler, onLibrarySelectHandler, refetch, setDialogState }) => {
    const { control, handleSubmit } = useForm();

    const [diagnoseAudioApi, { isLoading: isdiagnoseAudioApiLoading }] = useDiagnoseAudioMutation()

    const { toast } = useToast()

    const onSubmit = async (data: any) => {
        if (!media?.id) return
        try {
            await diagnoseAudioApi({ type: media.type, mediaId: media.id, content: data.content_type }).unwrap()
            toast({ title: "Request send", description: "We're diagnosing the audio, it will take few minutes", variant: "success" })
        } catch (error) {
            console.log({ error })
            toast({
                title: "Request failed",
                description: "There was an error while diagnosing the audio. Please try again later.",
                variant: "destructive"
            });

        }
    };

    return (
        <>
            <form className="shadow-lg p-4 rounded" onSubmit={handleSubmit(onSubmit)}>
                <div className="my-8 flex items-center">
                    <div className="flex">
                        <h3 className="text-sm text-gray-700 font-semibold">Content Type(Optional)</h3>
                    </div>

                    <div className="w-40 ml-6">
                        <Controller
                            name="content_type"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent position='item-aligned'>
                                        {dolbyContentTypes.map(content => (
                                            <SelectItem value={content.value} key={content.value}>{content.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-sm text-gray-700 font-semibold">Video/Audio Source</h3>
                    <div className="flex mt-2">
                        <Dialog open={dialogState.library} onOpenChange={(open) => setDialogState(prev => ({ ...prev, library: open }))}>
                            <DialogTrigger>
                                <Button className="w-28 h-9 mr-3" variant="outline" type='button'>
                                    <MdVideoLibrary size={20} className='mr-2' />
                                    Library
                                </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-screen-md h-3/4 flex flex-col'>
                                <h2 className='h-4'>Video/Audio Library</h2>
                                <MediaLibrary onSelect={onLibrarySelectHandler} />
                            </DialogContent>
                        </Dialog>
                        <Dialog open={dialogState.upload} onOpenChange={(open) => setDialogState(prev => ({ ...prev, upload: open }))}>
                            <DialogTrigger>
                                <Button className="w-28 h-9" type='button' variant="secondary">
                                    <MdFileUpload size={20} className='mr-2' />
                                    Upload
                                </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-screen-md'>
                                <div className="mt-3">
                                    <VideoUploader onUpload={onFileUploadHandler} acceptAudio isLoading={isLoading} />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {
                        media?.url && media.id && (
                            media.type === "video" ? (
                                media.url.includes("youtube.com") || media.url.includes("youtu.be") ? (
                                    <iframe
                                        className='rounded mt-4 w-full h-72 md:h-96'
                                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(media.url)}`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video className='rounded mt-4 w-full' src={media.url} controls></video>
                                )
                            ) : (
                                <audio src={media?.url} className='w-full mt-4' controls />
                            )
                        )
                    }
                </div>
                <Button type="submit" disabled={!media?.id || isLoading || isdiagnoseAudioApiLoading} className='w-full mt-4'>Analyze</Button>
            </form>

        </>
    );
}

export default AnalyzeTab;
