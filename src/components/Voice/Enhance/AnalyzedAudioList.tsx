import React, { useState } from 'react';
import { HiOutlineArrowLongRight } from "react-icons/hi2";
import GaugeChart from 'react-gauge-chart'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LuInfo } from 'react-icons/lu';
import { TailSpin } from 'react-loader-spinner';

import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { IEnhancedAudioStatus } from '@/redux/interfaces/enum';
import { trimText } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhanceAudioWithDiagnoseMutation, useGenerateDetailedInfoOnLoudnessMutation, useGetDiagnosedAudioListQuery } from '@/redux/api/media';
import { Button } from '@/components/ui/button';
import useSSE, { SSEData } from '@/hooks/useSSE';
import { useAppSelector } from '@/redux/hook';
import { useToast } from '@/components/ui/use-toast';

const platforms = [
    'YouTube',
    'Spotify',
    'Apple',
    'Amazon',
    'SoundCloud',
    'Pandora',
    'Facebook',
    'Vimeo',
    'Laptop Playback',
    'Mobile Playback',
    'TV Broadcast (ATSC A/85)',
    'European Broadcast (EBU R128)'
];

interface IProps {
    handleTabChange: (value: string) => void
}

const AnalyzedAudioList: React.FC<IProps> = ({ handleTabChange }) => {
    const [detailedLoudnessResp, setDetailedLoudnessResp] = useState<string>("")
    const [platform, setPlatform] = useState<string>("")
    const [dialogState, setDialogState] = useState(false)

    const [enhanceAudioWithDiagnoseApi, { isLoading: isEnhanceAudioWithDiagnoseLoading }] = useEnhanceAudioWithDiagnoseMutation()
    const [generateDetailedInfoOnLoudness, { isLoading: isgenerateDetailedInfoOnLoudnessLoading, data }] = useGenerateDetailedInfoOnLoudnessMutation()
    const { data: diagnosedAudioList, refetch } = useGetDiagnosedAudioListQuery()

    const { user } = useAppSelector(state => state.user)

    const { toast } = useToast()

    const handleSSEMessage = (data: SSEData) => {
        if (data.status === 'success') {
            refetch()
            toast({ title: "Diagnosis Completed", description: "Your Diagnosis report is ready", variant: "success" })
        } else if (data.status === "failed") {
            toast({ title: "Diagnosis Failed", description: "Diagnosis request failed", variant: "destructive" })
        }
    };

    useSSE(`media/audios/diagnose/events/${user._id}`, handleSSEMessage)

    if (!diagnosedAudioList) return null


    const onPlatformValueChangeHandler = async (id: string, platform: string) => {
        try {
            const resp = await generateDetailedInfoOnLoudness({ platform, mediaId: id }).unwrap()
            setPlatform(platform)
            setDetailedLoudnessResp(resp.data)
        } catch (error) {
            console.log({ error })
        }
    }

    const onEnhanceHandler = async (mediaId: string, mediaType: string, loudness: object) => {
        try {
            await enhanceAudioWithDiagnoseApi({ type: mediaType, mediaId, loudness, platform }).unwrap()
            setDialogState(false)
            handleTabChange("enhance")
        } catch (error) {
            console.log({ error })
        }
    }

    return (
        <>
            <Card className='mt-20'>
                <CardHeader className="px-7">
                    <CardTitle>Analyzed Audios Result</CardTitle>
                    <CardDescription>List of all analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden sm:table-cell">Status</TableHead>
                                <TableHead className="hidden sm:table-cell">Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                diagnosedAudioList.data.map((data) => (
                                    <TableRow key={data.id}>
                                        <TableCell>
                                            <div className="font-medium">{trimText(data.name, 40)}</div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {data.status === IEnhancedAudioStatus.SUCCESS ?
                                                <Badge className="text-xs bg-green-400" >
                                                    {data.status}
                                                </Badge>
                                                :
                                                <Badge className={`text-xs ${data.status === IEnhancedAudioStatus.PENDING ? 'bg-yellow-400' : 'bg-red-400'}`}>
                                                    {data.status}
                                                </Badge>
                                            }
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {new Date(data.created_at).toLocaleString('en-US', {
                                                month: 'numeric',
                                                day: 'numeric',
                                                year: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Dialog open={dialogState} onOpenChange={(open) => setDialogState(open)}>
                                                <DialogTrigger>
                                                    <Button>
                                                        Show Result
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-screen-md w-full" onOpenAutoFocus={(event) => event.preventDefault()}>
                                                    {
                                                        data.status === "success" ? <div className=" mt-8 w-full">
                                                            <h1 className="text-lg font-bold mb-4 text-gray-800">Media Analysis Report</h1>

                                                            <Card className="shadow-lg w-full">
                                                                <CardContent className=" text-gray-600 w-full">
                                                                    <div className="flex items-center justify-evenly flex-wrap gap-6 p-4 ">
                                                                        <div className="flex items-center flex-col justify-center">
                                                                            <GaugeChart
                                                                                id="quality-gauge-chart"
                                                                                nrOfLevels={10}
                                                                                percent={data.diagnosis.quality_score.average / 10}
                                                                                textColor="#000000"
                                                                                colors={['#FF0000', '#00FF00']} // Changed colors from red to green and green to red
                                                                            />
                                                                            <p className='font-semibold flex items-center'>
                                                                                Quality Score
                                                                                <TooltipProvider>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger>
                                                                                            <LuInfo size={12} className='ml-1 text-gray-600 font-bold' />
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent className='w-48 md:w-60'>
                                                                                            <p className='text-xs text-gray-500'>
                                                                                                {data.summary.voice_quality}
                                                                                            </p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex items-center flex-col justify-center">
                                                                            <GaugeChart
                                                                                id="noise-gauge-chart"
                                                                                nrOfLevels={10}
                                                                                percent={data.diagnosis.noise_score.average / 10}
                                                                                textColor="#000000"
                                                                                colors={['#00FF00', '#FF0000']} // Changed colors from red to green and green to red
                                                                            />
                                                                            <p className='font-semibold flex items-center'>
                                                                                Noise Score
                                                                                <TooltipProvider>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger>
                                                                                            <LuInfo size={12} className='ml-1 text-gray-600 font-bold' />
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent className='w-48 md:w-full'>
                                                                                            <p className='text-xs text-gray-500'>
                                                                                                {data.summary.noise_quality}
                                                                                            </p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex items-center flex-col justify-center">
                                                                            <GaugeChart
                                                                                id="speech-gauge-chart"
                                                                                nrOfLevels={10}
                                                                                percent={data.diagnosis.speech.percentage / 100}
                                                                                textColor="#000000"
                                                                                colors={['#FF0000', '#00FF00']} // Changed colors from red to green and green to red
                                                                            />
                                                                            <p className='font-semibold flex items-center'>
                                                                                Speech Score
                                                                                <TooltipProvider>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger>
                                                                                            <LuInfo size={12} className='ml-1 text-gray-600 font-bold' />
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent className='w-48 md:w-full'>
                                                                                            <p className='text-xs text-gray-500'>
                                                                                                {data.summary.speech}
                                                                                            </p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-4">
                                                                        <h3 className="text-base font-bold">Loudness</h3>

                                                                        <div className="">
                                                                            <div className="mt-1 p-2">

                                                                                <div className="flex items-center">
                                                                                    <div className="flex items-center">
                                                                                        <h2 className='font-semibold text-sm '>Measured Loudness</h2>
                                                                                        <TooltipProvider>
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger>
                                                                                                    <LuInfo size={12} className='ml-1 text-gray-600 font-bold' />
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent className='w-48 md:w-full'>
                                                                                                    <p className='text-xs text-gray-800'>
                                                                                                        The average loudness level of your audio file.
                                                                                                    </p>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </TooltipProvider>
                                                                                    </div>
                                                                                    <HiOutlineArrowLongRight size={25} className="mx-5" />
                                                                                    <p className="text-xs border-black border-b-2 font-semibold">{data.diagnosis.loudness.measured}</p>
                                                                                </div>
                                                                                <div className="flex items-center">
                                                                                    <div className="flex items-center">
                                                                                        <h2 className='font-semibold text-sm '>Loudness Range</h2>
                                                                                        <TooltipProvider>
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger>
                                                                                                    <LuInfo size={12} className='ml-1 text-gray-600 font-bold' />
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent className='w-48 md:w-full'>
                                                                                                    <p className='text-xs text-gray-800'>
                                                                                                        The difference between the quietest and loudest parts of your audio.
                                                                                                    </p>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </TooltipProvider>
                                                                                    </div>
                                                                                    <HiOutlineArrowLongRight size={25} className="mx-5" />
                                                                                    <p className="text-xs border-black border-b-2 font-semibold">{data.diagnosis.loudness.range}</p>
                                                                                </div>
                                                                                <div className="flex items-center">
                                                                                    <div className="flex items-center">
                                                                                        <h2 className='font-semibold text-sm '>Gating Mode</h2>
                                                                                        <TooltipProvider>
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger>
                                                                                                    <LuInfo size={12} className='ml-1 text-gray-600 font-bold' />
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent className='w-48 md:w-full'>
                                                                                                    <p className='text-xs text-gray-800'>
                                                                                                        The mode used to measure loudness, focusing on speech.
                                                                                                    </p>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </TooltipProvider>
                                                                                    </div>
                                                                                    <HiOutlineArrowLongRight size={25} className="mx-5" />
                                                                                    <p className="text-xs border-black border-b-2 font-semibold">{data.diagnosis.loudness.gating_mode}</p>
                                                                                </div>
                                                                                <div className="flex items-center">
                                                                                    <div className="flex items-center">
                                                                                        <h2 className='font-semibold text-sm '>Sample Peak Level</h2>
                                                                                        <TooltipProvider>
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger>
                                                                                                    <LuInfo size={12} className='ml-1 text-gray-600 font-bold' />
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent className='w-48 md:w-full'>
                                                                                                    <p className='text-xs text-gray-800'>
                                                                                                        The highest audio level in your file, measured by sample.
                                                                                                    </p>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </TooltipProvider>
                                                                                    </div>
                                                                                    <HiOutlineArrowLongRight size={25} className="mx-5" />
                                                                                    <p className="text-xs border-black border-b-2 font-semibold">{data.diagnosis.loudness.sample_peak}</p>
                                                                                </div>
                                                                                <div className="flex items-center">
                                                                                    <div className="flex items-center">
                                                                                        <h2 className='font-semibold text-sm'>True Peak Level</h2>
                                                                                        <TooltipProvider>
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger>
                                                                                                    <LuInfo size={12} className='ml-1 text-gray-600 font-bold' />
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent className='w-48 md:w-full'>
                                                                                                    <p className='text-xs text-gray-800'>
                                                                                                        The highest actual audio level, considering inter-sample peaks.
                                                                                                    </p>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </TooltipProvider>
                                                                                    </div>
                                                                                    <HiOutlineArrowLongRight size={25} className="mx-5" />
                                                                                    <p className="text-xs border-black border-b-2 font-semibold">{data.diagnosis.loudness.true_peak}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="w-full p-2" >
                                                                                <div className="flex items-center justify-start">
                                                                                    <h2 className='font-semibold text-sm mr-4'>Where do you want to upload your video/audio? based on that we'll provide you the ideal loudness value</h2>

                                                                                    <div className="w-52">
                                                                                        <Select onValueChange={(val: string) => onPlatformValueChangeHandler(data.id, val)}>
                                                                                            <SelectTrigger>
                                                                                                <SelectValue placeholder="Select" />
                                                                                            </SelectTrigger>
                                                                                            <SelectContent>
                                                                                                {
                                                                                                    platforms.map(platform => (
                                                                                                        <SelectItem value={platform} key={platform}>{platform}</SelectItem>
                                                                                                    ))
                                                                                                }
                                                                                            </SelectContent>
                                                                                        </Select>
                                                                                    </div>
                                                                                </div>
                                                                                {
                                                                                    detailedLoudnessResp &&
                                                                                    <p className="text-sm mt-2 font-medium text-gray-500">{detailedLoudnessResp}</p>
                                                                                }
                                                                                {
                                                                                    isgenerateDetailedInfoOnLoudnessLoading && <TailSpin
                                                                                        visible={true}
                                                                                        height="25"
                                                                                        width="25"
                                                                                        color="black"
                                                                                        ariaLabel="tail-spin-loading"
                                                                                        radius="1"
                                                                                        wrapperStyle={{}}
                                                                                        wrapperClass=""
                                                                                    />
                                                                                }
                                                                                <p className='text-sm text-gray-500'>See <a className='underline text-blue-500 mt-3' href="https://docs.dolby.io/media-apis/docs/loudness#profiles">here</a> for detailed range </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {
                                                                        platform &&
                                                                        <Button type="button" disabled={isEnhanceAudioWithDiagnoseLoading} onClick={() => onEnhanceHandler(data.media_id, data.media_type, data.diagnosis.loudness)} className='w-full mt-4'>Enhance Audio for {platform}</Button>
                                                                    }
                                                                </CardContent>
                                                            </Card >
                                                        </div > : null
                                                    }
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </>
    )
}

export default AnalyzedAudioList