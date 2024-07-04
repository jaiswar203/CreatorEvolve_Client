import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { IEnhanceSettings, MediaType } from '@/redux/interfaces/media';
import { useEnhanceAudioMutation } from '@/redux/api/media';
import { IFormInput, dolbyAmount, dolbyContentTypes, options } from "./default";
import MediaLibrary from '@/components/MediaLibrabry/MediaLibrabry';
import VideoUploader from '@/components/common/VideoUploader';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MdFileUpload, MdVideoLibrary } from 'react-icons/md';
import { IMedia } from '@/constants/video';
import { getYouTubeVideoId } from '@/lib/utils';

interface EnhanceTabProps {
    media: { id: string, url: string, type: MediaType } | undefined;
    onLibrarySelectHandler: (media: any, type: MediaType) => Promise<void>;
    onFileUploadHandler: (media: IMedia) => Promise<void>;
    isLoading: boolean;
    dialogState: { upload: boolean, library: boolean }
    setDialogState: Dispatch<SetStateAction<{ upload: boolean, library: boolean }>>
    refetch: () => void
}

const EnhanceTab: React.FC<EnhanceTabProps> = ({ media, onLibrarySelectHandler, onFileUploadHandler, isLoading, dialogState, setDialogState, refetch }) => {
    const [selectedOptions, setSelectedOptions] = useState([options[0]]);
    const [mergedSettings, setMergedSettings] = useState<IEnhanceSettings>(options[0].settings);
    const { toast } = useToast();
    const [enhanceAudioApi, { isLoading: isEnhanceAudioApiLoading }] = useEnhanceAudioMutation();

    const onOptionSelectHandler = useCallback((option: any) => {
        setSelectedOptions((prev) => {
            if (option.key === "enhance") {
                setMergedSettings(option.settings);
                return [option];
            }

            const isActive = prev.some((opt) => opt.key === option.key);
            const newOptions = isActive
                ? prev.filter((opt) => opt.key !== option.key)
                : [...prev.filter((opt) => opt.key !== "enhance"), option];

            if (newOptions.length === 0) {
                // If no options are selected, default to "enhance"
                setMergedSettings(options[0].settings);
                return [options[0]];
            }

            const merged = newOptions.reduce((acc, opt) => {
                for (const key in opt.settings) {
                    if (acc[key]) {
                        acc[key] = { ...acc[key], ...opt.settings[key] };
                    } else {
                        acc[key] = opt.settings[key];
                    }
                }
                return acc;
            }, {});

            setMergedSettings(merged);
            return newOptions;
        });
    }, []);

    const isActiveOption = useCallback((key: string) => {
        const keys = selectedOptions.map(opt => opt.key);
        return keys.includes(key);
    }, [selectedOptions]);

    const { control, handleSubmit } = useForm<IFormInput>();

    const onSubmit = async (data: IFormInput) => {
        try {
            await enhanceAudioApi({ mediaId: media?.id as string, settings: mergedSettings, content: data.content_type, type: media?.type as string }).unwrap();
            toast({
                title: "Enhancement Request Submitted",
                description: "Your enhancement request has been submitted. Please wait a moment while we process it.",
                variant: "success"
            });
            refetch()
        } catch (error) {
            toast({
                title: "Enhancement Request Failed",
                description: "There was an error processing your request. Please try again later.",
                variant: "destructive"
            });
        }
    };

    const renderSettings = (settings: IEnhanceSettings) => {
        const renderSetting = (key: string, label: string, settingKey: string, value: string | number | undefined) => (
            <div className="flex justify-between items-center mt-4" key={`${key}-${settingKey}`}>
                <h3 className="text-sm">{label}</h3>
                <div>
                    <Select onValueChange={(value) => handleSettingChange(key, settingKey, value)}>
                        <SelectTrigger>{value || 'Auto'}</SelectTrigger>
                        <SelectContent>
                            {dolbyAmount.map((amount) => (
                                <SelectItem key={amount.value} value={amount.value}>
                                    {amount.key}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );

        return (
            <>
                {Object.keys(settings).map((key) => {
                    if (key === 'noise' && settings[key]?.reduction?.enable) {
                        return renderSetting(key, 'Background Noise Reduction', 'reduction', settings[key]?.reduction?.amount);
                    }

                    if (key === 'dynamics' && settings[key]?.range_control?.enable) {
                        return renderSetting(key, 'Dynamic Range Control', 'range_control', settings[key]?.range_control?.amount);
                    }

                    if (key === 'speech') {
                        return (
                            <div key={key}>
                                {settings[key]?.isolation?.enable && (
                                    <div className="mt-4" key={`${key}-isolation`}>
                                        <h3 className="text-sm">Voice Isolation</h3>
                                        <div className='mt-2'>
                                            <Slider
                                                defaultValue={[settings[key]?.isolation?.amount as number]}
                                                max={100}
                                                showTooltip
                                                onValueChange={(vals) => handleSettingChange(key, 'isolation', vals[0])}
                                            />
                                        </div>
                                    </div>
                                )}
                                {settings[key]?.click?.reduction?.enable && renderSetting(key, 'Click Reduction', 'click', settings[key]?.click?.reduction?.amount)}
                                {settings[key]?.plosive?.reduction?.enable && renderSetting(key, 'Plosive Reduction', 'plosive', settings[key]?.plosive?.reduction?.amount)}
                                {settings[key]?.sibilance?.reduction?.enable && renderSetting(key, 'Sibilance Reduction', 'sibilance', settings[key]?.sibilance?.reduction?.amount)}
                            </div>
                        );
                    }

                    return null;
                })}
            </>
        );
    };


    const handleSettingChange = (category: string, setting: string, value: string | number) => {
        setMergedSettings((prev) => {
            const updatedSettings = { ...prev };

            if (updatedSettings[category] && updatedSettings[category][setting]) {
                if ('reduction' in updatedSettings[category][setting]) {
                    updatedSettings[category][setting].reduction.amount = value;
                } else if ('amount' in updatedSettings[category][setting]) {
                    updatedSettings[category][setting].amount = value;
                }
            }

            return updatedSettings;
        });
    };

    return (
        <form className="shadow-lg p-4 rounded" onSubmit={handleSubmit(onSubmit)}>
            <div className="">
                <h3 className="text-sm text-gray-700 font-semibold">Options</h3>
                <p className='text-xs text-gray-500'>Select "Enhance" for general improvement or choose multiple settings for specific enhancements.</p>

                <div className="">
                    <div className="flex mt-2 flex-wrap gap-3">
                        {options.map((option, index) => (
                            <div key={index} className={`relative group text-sm font-medium rounded px-4 py-2 cursor-pointer mr-4 w-auto text-center bg-slate-100 border-2 ${isActiveOption(option.key) ? "border-primary" : ""} flex items-start`} onClick={() => onOptionSelectHandler(option)}>
                                <p className='text-xs '>{option.label}</p>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info size={12} className='ml-1 text-gray-600 font-bold' />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className='text-xs text-center text-gray-500'>{option.tooltip}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="my-8 flex items-center">
                <div className="flex">
                    <h3 className="text-sm text-gray-700 font-semibold">Content Type(Optional)</h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger >
                                <Info size={12} className='ml-1 text-gray-600 font-bold' />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className='text-xs text-gray-500'>Providing a category for the content will configure the processing to use settings that <br /> are most suitable for that type of media recording.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
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
                                    {
                                        dolbyContentTypes.map(content => (
                                            <SelectItem value={content.value} key={content.value}>{content.name}</SelectItem>
                                        ))
                                    }
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

            <Accordion type="single" collapsible className='w-full'>
                <AccordionItem value="item-1">
                    <AccordionTrigger className='hover:no-underline text-sm text-gray-800 font-medium'>Advanced Settings</AccordionTrigger>

                    <AccordionContent className='w-full '>
                        <p className="text-xs font-medium text-gray-500">Use this setting to change the intensity.</p>

                        <div className="p-3">
                            {renderSettings(mergedSettings)}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <Button type="submit" disabled={!media?.id || isEnhanceAudioApiLoading} className='w-full mt-4'>Enhance</Button>
        </form>
    );
};

export default EnhanceTab;
