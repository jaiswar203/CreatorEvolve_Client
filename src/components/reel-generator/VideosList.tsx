import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { IVideoResponse } from './types/video'
import Image from 'next/image'
import { ellipsesText } from '@/utils'
import { Button } from '../ui/button'
import { CheckCircle, CircleX, Info } from 'lucide-react'
import { Image as ImageIcon } from 'lucide-react'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ThreeCircles } from 'react-loader-spinner'
import Link from 'next/link'
import { APP_ROUTES } from '@/constants/routes'
import { getCloudFrontURL } from '@/lib/utils'
import { VIDEO_TYPES } from '@/constants/video'


interface IProps {
    data: IVideoResponse[]
}

const VideosList = ({ data }: IProps) => {
    if (!data) return

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10 w-full'>
            {
                data.map((video, index) => (
                    <Card key={index} className='cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-200 mr-16 p-1 relative '>
                        <CardHeader>
                            {video.thumbnail ? video.type === VIDEO_TYPES.YOUTUBE ?
                                <Image
                                    src={video.thumbnail}
                                    width={300}
                                    height={150}
                                    alt={video.name}
                                    className='rounded-t-md object-cover'
                                />
                                :
                                <div className="py-5 rounded-t-md bg-black">
                                    <Image
                                        src={getCloudFrontURL(video.thumbnail)}
                                        width={300}
                                        height={150}
                                        alt={video.name}
                                        className='rounded-t-md object-cover'
                                    />
                                </div>
                                : <div className="flex w-full border-1 bg-gray-200 h-46 justify-center items-center  rounded-md mr-4">
                                    <ImageIcon size={30} />
                                </div>
                            }
                            <CardTitle className='text-sm text-gray-500 font-semibold'>{ellipsesText(video.name, 35)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center">
                                {
                                    video?.tl_video_id ? <>
                                        <CheckCircle className='mr-3 text-green-500' size={18} />
                                        <h2 className='text-sm flex text-gray-500'>Ready for generation
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info size={12} className='ml-1' />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className='text-xs text-center text-gray-500'>Your video is processed and ready for <br /> content generation</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </h2>
                                    </> : <>
                                        <CircleX className='mr-3 text-red-700' size={18} />
                                        <h2 className='text-sm flex text-gray-500'>Not ready for generation
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info size={12} className='ml-1' />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className='text-xs text-center text-gray-500'>Your video is still processing and will take some <br /> time for completion</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </h2>
                                    </>

                                }
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href={`${APP_ROUTES.REEL_GENERATOR}/${video._id}`} className='w-full'>
                                <Button className='w-full' loading={{
                                    isLoading: !video.tl_video_id, customLoader: <ThreeCircles
                                        visible={true}
                                        height={25}
                                        width={25}
                                        color="white"
                                        ariaLabel="three-circles-loading"
                                        wrapperStyle={{}}
                                        wrapperClass=""
                                    />

                                }} disabled={!video.tl_video_id}>Open video</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                ))
            }
        </div>
    )
}

export default VideosList