"use client"

import { VIDEO_TYPES } from '@/constants/video'
import { getCloudFrontURL, secondsToHms } from '@/lib/utils'
import { IChaptersResponse, IExtractVideoDataInfo, useExtractShortContentMutation, useGenerateChaptersMutation, useGetVideoByIdQuery } from '@/redux/api/video'
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

const dummyRes = [
    {
        "id": 0,
        "summary": "The video begins with an introduction to LeetCode, emphasizing its importance in the tech industry for securing high-paying jobs. The speaker shares personal experiences and insights on how LeetCode practice transformed their career, highlighting the usefulness of data structures and algorithms (DSA) knowledge. Despite the common perception of LeetCode being unnecessary for full-stack jobs, the speaker argues for its value in personal development and job preparation.",
        "title": "Introduction to LeetCode and Its Impact",
        "start": 0,
        "end": 180
    },
    {
        "id": 1,
        "summary": "This section delves into effective strategies for mastering LeetCode problems, focusing on systems, processes, and methodologies. The speaker shares their journey of learning through trial and error, emphasizing the importance of understanding core algorithms and the role of repetition in mastering coding challenges. Insights into the evolution of LeetCode's resources over the years are shared, including the transition from forum discussions to detailed solution guides.",
        "title": "Learning Methodologies for LeetCode",
        "start": 180,
        "end": 360
    },
    {
        "id": 2,
        "summary": "The video highlights the critical role of mastering fundamental concepts in programming, such as binary search and basic algorithms, before tackling medium or hard LeetCode problems. The speaker discusses the common pitfalls learners face, such as focusing on advanced problems without a solid understanding of the basics, and offers advice on incremental learning and the significance of repetition.",
        "title": "The Importance of Fundamentals in Coding",
        "start": 360,
        "end": 540
    },
    {
        "id": 3,
        "summary": "In this segment, the focus shifts to more advanced problem-solving strategies, including the application of core algorithms like binary search, DFS, and BFS. The speaker shares personal advice on improving problem-solving skills, emphasizing the importance of practice and familiarity with basic algorithms to tackle complex LeetCode problems effectively.",
        "title": "Advanced Problem-Solving Techniques",
        "start": 540,
        "end": 720
    },
    {
        "id": 4,
        "summary": "This chapter discusses the application of algorithms to solve complex LeetCode problems, stressing the importance of understanding the underlying principles of algorithms rather than memorizing solutions. The speaker encourages viewers to practice by solving problems repeatedly and to focus on the reasoning behind algorithms to enhance problem-solving skills.",
        "title": "Applying Algorithms to Solve Complex Problems",
        "start": 720,
        "end": 900
    },
    {
        "id": 5,
        "summary": "The final section of the video emphasizes the importance of deeply understanding algorithms, beyond just being able to implement them. The speaker discusses the 'why' behind algorithmic solutions, the use of two pointers technique, and the significance of understanding the conditions under which certain algorithms are applied. The importance of curiosity, self-exploration, and the use of examples to grasp complex concepts is highlighted.",
        "title": "Deep Dive into Algorithm Understanding",
        "start": 900,
        "end": 1080
    },
    {
        "id": 6,
        "summary": "The video concludes with a reflection on the importance of structured learning and practice in mastering programming and algorithmic problem-solving. The speaker reiterates the value of repetition, understanding the fundamentals, and the need for a curious mindset to excel in coding challenges like those found on LeetCode.",
        "title": "Conclusion",
        "start": 1080,
        "end": 1083
    }
]

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
        <div className="p-5">
            <Link href={"/reel-generator"} replace>
                <Button className='w-32 mb-4' variant={"secondary"}>
                    <ArrowLeft className='mr-4' />
                    Go back
                </Button>
            </Link>
            <h1 className="text-3xl font-semibold text-primary">{video.name}</h1>
            <div className="flex mt-5 items-start">
                <div className="mr-4 w-3/4">
                    <Image className='rounded-sm cursor-pointer' src={imgUrl} width={imageDimension.width} height={imageDimension.height} alt={video.name} />
                </div>

                <div className="w-full">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <Label htmlFor='prompt' className="text-lg font-semibold text-gray-700">Custom Prompt </Label>
                            <div className="flex justify-end">
                                <p className='text-gray-500 text-xs'>{promptValue?.length}/300 characters</p>
                            </div>
                            <Textarea className='w-full resize-none h-28' {...register("prompt", { maxLength: 300 })} placeholder='Describe the type of short video you want to generate' id="prompt" />
                            {promptValue?.length >= 300 && <span className="text-red-600 text-xs">Should be less than 300 characters</span>}
                        </div>
                        <div className="flex">
                            <div className='mr-10'>
                                <Label className="text-lg font-semibold text-gray-700">Video Dimension</Label>
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
                            <Button className='w-32' type="submit" disabled={isLoading} loading={{
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
                                    <Button>
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
