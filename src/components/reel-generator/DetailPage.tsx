"use client"

import { VIDEO_TYPES } from '@/constants/video'
import { downloadVideo, getCloudFrontURL, secondsToHms } from '@/lib/utils'
import { useExtractShortContentMutation, useGenerateChaptersMutation, useGetVideoByIdQuery } from '@/redux/api/media'
import { IChaptersResponse, IExtractVideoDataInfo } from "@/redux/interfaces/media"
import Image from 'next/image'
import React from 'react'
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { ArrowLeft, CirclePlay, Info, Save } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import CustomVideoPlayer from '../CustomVideoPlayer/CustomVideoPlayer'
import { ThreeCircles } from 'react-loader-spinner'
import { useToast } from '../ui/use-toast'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link'

interface DetailProps {
    id: string
}

enum VideoDimension {
    NINE_SIXTEEN = "9 / 16",
    SIXTEEN_NINE = "16 / 9",
}

enum ContentGeneration {
    REEL = "reel",
    CHAPTER = "chapter"
}

interface IFormInput {
    prompt: string;
    videoDimension: VideoDimension;
    contentType: { type: ContentGeneration }[]
}

const DetailPage = ({ id }: DetailProps) => {
    const { data } = useGetVideoByIdQuery(id, {
        refetchOnMountOrArgChange: true
    })

    const [extractShortContentApi, { isLoading: isExtractShortApiLoading, data: extractedData, isSuccess }] = useExtractShortContentMutation()
    const [generateChaptersApi, { isLoading: isChapterApiLoading, data: chaptersData, isSuccess: isChapterApiSuccess }] = useGenerateChaptersMutation()

    const isLoading = isExtractShortApiLoading || isChapterApiLoading

    const { register, handleSubmit, setValue, watch, control } = useForm<IFormInput>({
        defaultValues: {
            videoDimension: VideoDimension.NINE_SIXTEEN,
            contentType: [{ type: ContentGeneration.REEL }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "contentType"
    })

    const video = data?.data
    const { toast } = useToast()

    if (!data?.success || !video) return null

    const imgUrl = video.type === VIDEO_TYPES.FILE_UPLOAD ? getCloudFrontURL(video.thumbnail) : video.thumbnail

    const imageDimension = {
        width: video.type === VIDEO_TYPES.FILE_UPLOAD ? 500 : 450,
        height: 300
    }

    const onSubmit: SubmitHandler<IFormInput> = async ({ prompt, videoDimension, contentType }) => {
        const aspectArray = videoDimension.split("/").map((val) => parseInt(val))
        const aspect = aspectArray[0] / aspectArray[1]

        try {
            if (contentType.findIndex((data) => data.type === ContentGeneration.CHAPTER) > -1)
                await generateChaptersApi({ id, prompt }).unwrap()

            if (contentType.findIndex((data) => data.type === ContentGeneration.REEL) > -1)
                await extractShortContentApi({ id, aspect, prompt }).unwrap()

            if (data.success) toast({ title: "Shorts Generated", description: "Your short videos have been successfully generated.", variant: "success" })
            if (chaptersData?.success) toast({ title: "Chapters Generated", description: "Your chapters have been successfully generated.", variant: "success" })
        } catch (error) {
            console.log({ error })
        }
    }

    const currentDimension = watch("videoDimension")

    const promptValue = watch("prompt")

    const handleContentTypeClick = (type: ContentGeneration) => {
        const index = fields.findIndex(field => field.type === type)
        if (index >= 0) {
            remove(index)
        } else {
            append({ type })
        }
    }


    return (
        <div className=" md:p-5">
            <Link href={"/reel-generator"} replace>
                <Button className='w-32 mb-4' variant={"secondary"}>
                    <ArrowLeft className='mr-4' />
                    Go back
                </Button>
            </Link>
            <h1 className="text-3xl font-semibold text-primary">{video.name}</h1>
            <div className="md:flex md:mt-5 md:items-start">
                <div className="mr-4 md:w-3/4 w-full my-2 md:my-0">
                    <Image className='rounded-sm cursor-pointer' src={imgUrl} width={imageDimension.width} height={imageDimension.height} alt={video.name} />
                </div>

                <div className="w-full mt-4 md:mt-0">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <Label htmlFor='prompt' className="text-lg font-semibold text-gray-700">Custom Prompt </Label>
                            <div className="flex justify-end">
                                <p className='text-gray-500 text-xs'>{promptValue?.length}/300 characters</p>
                            </div>
                            <Textarea className='w-full resize-none h-28' {...register("prompt", { maxLength: 300 })} placeholder='Describe the type of short video you want to generate' id="prompt" />
                            {promptValue?.length >= 300 && <span className="text-red-600 text-xs">Should be less than 300 characters</span>}
                        </div>
                        <div className="flex ">
                            <div className='mr-10'>
                                <div className="flex items-start">
                                    <Label className="text-lg font-semibold text-gray-700">Dimension</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info size={12} className='ml-1 text-gray-600 font-bold' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className='text-xs text-center text-gray-500'>Dimension of the video could be portrait or landscapce, by default its portrait</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="flex mt-3">
                                    <div className={`flex-col items-center justify-center cursor-pointer mr-5`} onClick={() => setValue("videoDimension", VideoDimension.NINE_SIXTEEN)}>
                                        <div className={`flex justify-center items-center w-14 rounded h-14 bg-slate-100 ${currentDimension === VideoDimension.NINE_SIXTEEN ? "border-primary border-3" : ""}`}>
                                            <div className="w-4 h-8 border-2 border-black"></div>
                                        </div>
                                        <p className='text-xs mt-1 text-center font-medium text-gray-500'>9:16</p>
                                    </div>
                                    <div className={`flex-col items-center justify-center cursor-pointer`} onClick={() => setValue("videoDimension", VideoDimension.SIXTEEN_NINE)}>
                                        <div className={`flex justify-center items-center w-14 rounded h-14 bg-slate-100 ${currentDimension === VideoDimension.SIXTEEN_NINE ? "border-primary border-3" : ""}`}>
                                            <div className="h-4 w-8 border-2 border-black"></div>
                                        </div>
                                        <p className='text-xs mt-1 text-center font-medium text-gray-500'>16:9</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-start">
                                    <Label className="text-lg font-semibold text-gray-700">Generate</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info size={12} className='ml-1 text-gray-600 font-bold' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className='text-xs text-center text-gray-500'>You can generate short videos as Reels or Chapters, or both.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="flex mt-3">
                                    <div className={`text-sm font-medium rounded px-4 py-2 cursor-pointer mr-4 w-24 text-center bg-slate-200 border-3 ${fields.some(field => field.type === ContentGeneration.REEL) ? "border-primary border-3" : ""}`} onClick={() => handleContentTypeClick(ContentGeneration.REEL)}>
                                        <p>Reels</p>
                                    </div>
                                    <div className={`text-sm font-medium rounded px-4 py-2 cursor-pointer w-24 text-center bg-slate-200 border-3 ${fields.some(field => field.type === ContentGeneration.CHAPTER) ? "border-primary border-3" : ""}`} onClick={() => handleContentTypeClick(ContentGeneration.CHAPTER)}>
                                        <p>Chapter</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Button className='md:w-32 w-full' type="submit" disabled={isLoading} loading={{
                                isLoading, customLoader: <ThreeCircles
                                    visible={true}
                                    height={25}
                                    width={25}
                                    color="white"
                                    ariaLabel="three-circles-loading"
                                    wrapperStyle={{}}
                                    wrapperClass=""
                                />
                            }}>
                                Generate
                            </Button>
                        </div>
                    </form>
                </div>
            </div>


            {
                isSuccess && extractedData.data?.length &&
                <div>
                    <h1 className="text-3xl font-semibold text-primary mt-14">Short Videos</h1>
                    <div className="flex mt-5 flex-col ">
                        {isSuccess && extractedData?.data.map((data: IExtractVideoDataInfo) => (
                            <div className="border-2 border-gray-300 rounded p-4 relative bg-slate-50 w-full flex flex-col justify-between cursor-pointer mb-10" key={data.title}>
                                <div>
                                    <div className="absolute top-2 right-3 text-gray-500 text-sm font-medium">{secondsToHms(data.start)} - {secondsToHms(data.end)}</div>
                                    <h1 className='font-semibold mt-4 text-lg text-black'>{data.title}</h1>
                                    <p className='text-sm mt-2 text-gray-400'>{data.summary}</p>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Dialog>
                                        <DialogTrigger>
                                            <Button variant={"secondary"} className='mr-4'>
                                                <CirclePlay className='text-primary' size={25} />
                                                <h3 className='ml-2'>Play Video</h3>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <div className="flex justify-center items-center">
                                                <CustomVideoPlayer url={data.url} />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button onClick={() => downloadVideo(data.url, data.title)}>
                                        <Save size={20} />
                                        <h3 className='ml-2'>Save Video</h3>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            }

            {
                isChapterApiSuccess && chaptersData.data?.length &&
                <div className='mt-10'>
                    <div className="flex justify-between w-full">
                        <h1 className="text-3xl font-semibold text-primary">Chapters</h1>

                        <div className=''>
                            <Button>
                                Publish to Youtube
                            </Button>
                        </div>
                    </div>
                    <div className="flex mt-5 flex-col ">
                        {chaptersData.data?.map((data: IChaptersResponse) => (
                            <div className="border-2 border-gray-300 bg-slate-50 rounded p-4 relative  w-full flex flex-col justify-between cursor-pointer mb-10" key={data.title}>
                                <div>
                                    <div className="absolute top-2 right-3 text-gray-500 text-sm font-medium">{secondsToHms(data.start)} - {secondsToHms(data.end)}</div>
                                    <h1 className='font-semibold mt-4 text-lg text-black'>{data.title}</h1>
                                    <p className='text-sm mt-2 text-gray-400'>{data.summary}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            }
        </div>
    )
}

export default DetailPage
