"use client"
import React, { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VoiceDub from './VoiceDub';
import VoiceOver from './VoiceOver';
import { useGetMediaDubsQuery } from '@/redux/api/media';
import ListDubs from './ListDubs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import VoiceClonning from './Clone/Clone';

const Voice = () => {
    const { data: mediaDubs, refetch } = useGetMediaDubsQuery("")
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        refetch()
    }, [refetch])

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('tab', value)
        router.push(`${pathname}?${params.toString()}`)
    }

    const currentTab = searchParams.get('tab') || 'dubbing'
    return (
        <div className="md:p-4 flex flex-col">
            <div className="mb-10">
                <h1 className="md:text-3xl text-2xl font-bold text-primary">Voice Feature</h1>
                <p className="text-gray-500 text-sm font-medium">Effortlessly transform lengthy content into captivating short-form videos. Enhance engagement and reach by generating concise, impactful videos from your extensive content library.</p>
            </div>
            <div>
                <Tabs defaultValue={currentTab} onValueChange={handleTabChange}>
                    <TabsList className='w-full'>
                        <TabsTrigger className='w-full' value="dubbing">Voice Dubbing</TabsTrigger>
                        <TabsTrigger className='w-full' value="voiceover">Voice Over</TabsTrigger>
                    </TabsList>
                    <TabsContent value="dubbing">
                        <VoiceDub refetch={refetch} />
                        <ListDubs data={mediaDubs?.data as any} />
                    </TabsContent>
                    <TabsContent value="voiceover">
                        <VoiceClonning />
                        <VoiceOver />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default Voice;
