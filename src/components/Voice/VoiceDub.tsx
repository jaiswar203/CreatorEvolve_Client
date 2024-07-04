import React, { useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { MdCancel, MdFileUpload, MdVideoLibrary } from "react-icons/md"
import VideoUploader from '../common/VideoUploader'
import { Input } from '../ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { numberOfSpeakers, sourceLanguages, targetLanguages, videoResolution } from '@/constants/audio'
import { IMedia, VIDEO_TYPES } from '@/constants/video'
import { useDubVideoFileMutation, useUploadAudioFileMutation, useUploadVideoFileMutation, useUploadVideoUrlMutation } from '@/redux/api/media'
import { useToast } from '../ui/use-toast'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { MdInfo as Info } from "react-icons/md";
import { getYouTubeVideoId } from '@/lib/utils'
import { FaMinus } from 'react-icons/fa'

import useSSE, { SSEData } from '@/hooks/useSSE'
import { useAppSelector } from '@/redux/hook'
import MediaLibrary from '../MediaLibrabry/MediaLibrabry'
import { IDubRequest, MediaType } from '@/redux/interfaces/media'

interface IFormInput {
    source_lang: string,
    target_lang: string,
    highest_resolution: boolean
    num_speakers: number
    name?: string
    start_time?: string
    end_time?: string
}

const VoiceDub = ({ refetch }: { refetch: () => {} }) => {
    const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<IFormInput>({
        defaultValues: {
            source_lang: "auto",
            target_lang: "",
            highest_resolution: true,
            num_speakers: 0,
            name: ""
        }
    })

    const [media, setMedia] = useState<{ id: string, url: string, type: MediaType }>()
    const [dialogState, setDialogState] = useState({ upload: false, library: false })
    const [uploadYTVideoApi, { isLoading: ytVideoApiIsLoading }] = useUploadVideoUrlMutation()
    const [uploadVideoFileApi, { isLoading: videoFileApiIsLoading }] = useUploadVideoFileMutation()
    const [uploadAudioFileApi, { isLoading: audioFileApiIsLoading }] = useUploadAudioFileMutation()
    const [dubVideoFileApi, { isLoading: generateApiIsLoading }] = useDubVideoFileMutation()

    const isLoading = ytVideoApiIsLoading || videoFileApiIsLoading || audioFileApiIsLoading
    const { toast } = useToast()

    const { user } = useAppSelector(state => state.user)

    const handleSSEMessage = (data: SSEData) => {
        if (data.status === 'completed') {
            refetch()
            toast({ title: "Dubbing Completed", description: "Your dubbed file is ready", variant: "success" })
        } else if (data.status === "failed") {
            toast({ title: "Dubbing Failed", description: "Dubbing request failed", variant: "destructive" })
        }
    };

    useSSE(`media/audios/dubbing/events/${user._id}`, handleSSEMessage)

    const onFileUploadHandler = async (media: IMedia) => {
        try {
            let response: any
            if (media.type === VIDEO_TYPES.YOUTUBE) {
                response = await uploadYTVideoApi({ url: media.data as string, thumbnail: media.thumbnail as string, name: media.title as string, quality: "high" }).unwrap()
            } else {
                const formData = new FormData()
                if (media.media_type === "audio") {
                    formData.append("audio", media.data)
                    response = await uploadAudioFileApi({ body: formData }).unwrap()
                    setMedia({ id: response.data._id, url: response.data.url, type: "audio" })
                } else {
                    formData.append("video", media.data)
                    response = await uploadVideoFileApi({ body: formData }).unwrap()
                    setMedia({ id: response.data._id, url: response.data.url, type: "video" })
                }
            }
            setDialogState(prev => ({ ...prev, upload: false }))
        } catch (error) {
            toast({ title: "Video upload failed", description: "Video upload failed due to some reason, please try again.", variant: "destructive" })
            throw error
        }
    }

    const onLibrarySelectHandler = async (media: any, type: MediaType) => {
        if (!media) return

        let url = media?.url
        if (type === "video" && media?.type === VIDEO_TYPES.YOUTUBE) {
            url = media.url
        }

        setMedia({ id: media._id, url, type })
        setDialogState(prev => ({ ...prev, library: false }))
    }

    const onVideoDubGenerator: SubmitHandler<IFormInput> = async (data) => {
        if (!media?.id) return

        try {
            const payload: IDubRequest = {
                mediaId: media?.id,
                highest_resolution: data.highest_resolution,
                num_speakers: data.num_speakers,
                target_lang: data.target_lang,
                source_lang: data.source_lang,
                start_time: data.start_time,
                end_time: data.end_time,
                type: media.type
            }
            await dubVideoFileApi(payload).unwrap()
            refetch()
            toast({ title: 'Request Sent for Dubbing', variant: "success" })
        } catch (error) {
            toast({ title: "Video upload failed", description: "Video upload failed due to some reason, please try again.", variant: "destructive" });

        }
    }

    return (
        <form onSubmit={handleSubmit(onVideoDubGenerator)} className="mt-10 shadow-lg p-4 rounded">
            <div className="source">
                <h3 className="text-xs text-gray-500 font-medium">Video Name (Optional)</h3>
                <Input className='mt-2' placeholder='Video Name' {...register('name')} />
            </div>
            <div className="flex my-4">
                <div className="w-full mr-5">
                    <h3 className="text-xs text-gray-500 font-medium">Source Language</h3>
                    <div className="mt-2">
                        <Select onValueChange={(value) => setValue("source_lang", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Detect" />
                            </SelectTrigger>
                            <SelectContent position='item-aligned'>
                                <SelectItem value='detect' key={"auto"}>Detect</SelectItem>
                                {sourceLanguages.map(lang => (
                                    <SelectItem value={lang.value} key={lang.value}>{lang.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="w-full">
                    <h3 className="text-xs text-gray-500 font-medium">Target Language</h3>
                    <div className="mt-2">
                        <Controller
                            name="target_lang"
                            control={control}
                            rules={{ required: "Target language is required" }}
                            render={({ field }) => (
                                <Select {...field} onValueChange={(value) => field.onChange(value)} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent position='item-aligned'>
                                        {targetLanguages.map(lang => (
                                            <SelectItem value={lang.value} key={lang.value}>{lang.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </div>
            </div>
            <div className="my-4">
                <h3 className="text-xs text-gray-500 font-medium">Video Source</h3>
                <div className="flex mt-2">
                    <Dialog onOpenChange={(open) => setDialogState(prev => ({ ...prev, library: open }))} open={dialogState.library}>
                        <DialogTrigger>
                            <Button className="w-28 h-9 mr-3" variant={"outline"} type='button'>
                                <MdVideoLibrary size={20} className='mr-2' />
                                Library
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-screen-md h-3/4 flex flex-col'>
                            <h2 className='h-4'>Video/Audio Library</h2>
                            <MediaLibrary onSelect={onLibrarySelectHandler} />
                        </DialogContent>
                    </Dialog>
                    <Dialog onOpenChange={(open) => setDialogState(prev => ({ ...prev, upload: open }))} open={dialogState.upload}>
                        <DialogTrigger>
                            <Button className="w-28 h-9" type='button' variant={"secondary"}>
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
            <div className="flex">
                <Accordion type="single" collapsible className='w-full'>
                    <AccordionItem value="item-1">
                        <AccordionTrigger className='hover:no-underline text-sm text-gray-800 font-medium'>Advanced Settings</AccordionTrigger>
                        <AccordionContent className='w-full'>
                            <div className="flex justify-between items-center">
                                <div className='flex items-start'>
                                    <h1 className='text-xs text-gray-500 font-medium'>Number of speakers</h1>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info size={12} className='ml-1 text-gray-600 font-bold' />
                                            </TooltipTrigger>
                                            <TooltipContent className='w-64 bg-primary'>
                                                <p className='text-xs text-white'>Total number of distinct speakers in the video. If you are not sure, have us automatically detect the speakers. This value is not required for us to dub the video, but it helps us to improve the quality of the dubbing.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="mt-2">
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Detect" />
                                        </SelectTrigger>
                                        <SelectContent position='item-aligned'>
                                            <SelectItem onClick={() => setValue("num_speakers", 0)} value={"0"}>Detect</SelectItem>
                                            {numberOfSpeakers.map(val => (
                                                <SelectItem onClick={() => setValue("num_speakers", val)} value={val.toString()} key={val}>{val}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <div className='flex items-start'>
                                    <h1 className='text-xs text-gray-500 font-medium'>Video Resolution</h1>
                                </div>
                                <div className="mt-2">
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Highest" />
                                        </SelectTrigger>
                                        <SelectContent position='item-aligned'>
                                            {videoResolution.map(res => (
                                                <SelectItem onClick={() => setValue("highest_resolution", res.value)} value={res.name} key={res.name}>{res.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="mt-2 w-full">
                                <h1 className='text-xs text-gray-500 font-medium'>Extract a time range for dubbing</h1>
                                <div className="flex items-center w-full p-2 px-1">
                                    <Input placeholder='hh:mm:ss' {...register("start_time")} className='w-full' />
                                    <FaMinus className='mx-2' />
                                    <Input placeholder='hh:mm:ss' {...register("end_time")} className='w-full' />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            {
                errors?.target_lang?.type === "required" ?
                    <div className="flex my-4 bg-red-100 bg-opacity-60 py-3 px-2">
                        <MdCancel className='mr-2 text-red-400' size={20} />
                        <p className="text-red-400 font-medium text-sm ">
                            &quot;Please select a target language&quot;
                        </p>
                    </div>
                    : null
            }
            <Button type='submit' className='w-full mt-3' disabled={generateApiIsLoading || (!media)} loading={{ isLoading: generateApiIsLoading, width: 30, height: 30 }}>Generate</Button>
        </form>
    )
}

export default VoiceDub
