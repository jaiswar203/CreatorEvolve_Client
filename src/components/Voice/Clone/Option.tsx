import React from 'react';
import { DialogHeader } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LuFlaskConical } from "react-icons/lu";
import { RxLightningBolt } from "react-icons/rx";
import { VscVerifiedFilled } from "react-icons/vsc";
import { PiInfoFill } from "react-icons/pi";

interface VoiceCloneOptionsProps {
    setHandler: (value: number) => void;
}

const VoiceCloneOptions: React.FC<VoiceCloneOptionsProps> = ({ setHandler }) => {
    return (
        <>
            <DialogHeader className='font-semibold'>Type of voice to create</DialogHeader>
            <div className="">
                <div className="border-2 p-3 rounded shadow cursor-pointer mb-4 border-gray-400 hover:bg-gray-100" onClick={() => setHandler(0)}>
                    <div className="flex items-center mb-2">
                        <LuFlaskConical size={20} className='mr-1' />
                        <h3 className=' font-bold'>Voice Design</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Design entirely new voices by adjusting their parameters. Every voice you create is randomly generated and is entirely unique even if the same settings are applied.</p>
                </div>
                <div className="border-2 p-3 mb-4 rounded shadow cursor-pointer border-gray-400 hover:bg-gray-100" onClick={() => setHandler(1)}>
                    <div className="flex items-center mb-2">
                        <RxLightningBolt size={20} className='mr-1' />
                        <h3 className=' font-bold'>Instant Voice Cloning</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Clone a voice from a clean sample recording. Samples should contain 1 speaker and be over 1 minute long and not contain background noise.</p>
                </div>
                <div className="border-2 p-3 rounded shadow cursor-pointer border-gray-400 hover:bg-gray-100" onClick={() => setHandler(2)}>
                    <div className="flex items-center mb-2">
                        <VscVerifiedFilled size={20} className='mr-1' />
                        <h3 className=' font-bold'>Professional Voice Cloning</h3>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <PiInfoFill size={12} className='ml-1 text-gray-600 font-bold' />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className='text-xs font-semibold text-gray-500 max-w-80'>
                                        Unlike Instant Voice Cloning, which lets you clone voices from very short samples, PVC requires more audio data for training, but speech produced by the model is virtually indistinguishable from the original. <br /> <br />

                                        Your Professional Voice Clone should finish training usually 6 hours after you&apos;ve successfully verified it. We will notify you when your clone is ready.

                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Create the most realistic digital replica of your voice.</p>
                </div>
            </div>
        </>
    )
}


export default VoiceCloneOptions