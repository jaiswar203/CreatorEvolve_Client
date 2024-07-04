import React, { useState } from 'react';
import { DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LuMoveLeft, LuMoveRight } from "react-icons/lu";
import { FormProvider, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MdOutlineRemoveCircle, MdOutlineCheck } from 'react-icons/md';
import { AiOutlinePlus } from 'react-icons/ai';
import { useGenerateRandomVoiceMutation, useSaveRandomGeneratedVoiceMutation, useGetRandonVoiceGenerationParamsQuery } from '@/redux/api/media';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { PiInfoFill } from 'react-icons/pi';
import { Badge } from '@/components/ui/badge';

interface InstantCloneFormProps {
    setIsFormDialogOpen: (open: boolean) => void;
}

interface VoiceGenerateFormData {
    gender: string;
    age: string;
    accent: string;
    accent_strength: number;
    text: string;
}

interface SaveRandomGeneratedVoiceFormData {
    voice_name: string;
    labels: { key: string; value: string }[];
    voice_description: string;
    generated_voice_id: string;
    preview_url: string;
}


const VoiceDesignForm: React.FC<InstantCloneFormProps> = ({ setIsFormDialogOpen }) => {
    const { toast } = useToast()
    const [generatedVoice, setGeneratedVoice] = useState<{ preview: string, voice_id: string | null, age: string | null, accent: string | null, gender: string | null }>({ preview: "", voice_id: null, gender: null, accent: null, age: null })

    const [step, setStep] = useState(0)

    const Step1 = () => {
        const methods = useForm<VoiceGenerateFormData>({
            mode: 'onChange',
            defaultValues: {
                gender: "male",
                accent: "american",
                age: "young",
                accent_strength: 150,
                text: "Exploring the beautiful landscapes of the mountains provides a sense of peace and tranquility like no other."
            }
        });
        const { control, handleSubmit } = methods;


        const { data } = useGetRandonVoiceGenerationParamsQuery("")
        const [generateRandomVoiceApi, { isLoading }] = useGenerateRandomVoiceMutation()

        const onGenerateRandomVoiceHandler: SubmitHandler<VoiceGenerateFormData> = async (data) => {
            try {
                const resp = await generateRandomVoiceApi(data).unwrap()
                const preview = resp.data.preview
                setGeneratedVoice({ preview, voice_id: resp.data.voice_id, gender: data.gender, age: data.age, accent: data.accent })
            } catch (error) {
                toast({ title: "Error occurred", description: "Error Occured while generating random voice, please try againg", variant: "destructive" })
            }
        }


        return (
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onGenerateRandomVoiceHandler)}>
                    <DialogHeader className='font-semibold'>Generate voice</DialogHeader>
                    <FormField control={control} name='gender' render={({ field }) => (
                        <FormItem className='mb-4  mt-2'>
                            <FormLabel>Gender</FormLabel>
                            <FormControl className='' >
                                <Select onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Male" />
                                    </SelectTrigger>
                                    <SelectContent >
                                        <SelectGroup>
                                            {
                                                data?.data.genders.map(gender => (
                                                    <SelectItem value={gender.code} key={gender.code}>{gender.name}</SelectItem>
                                                ))
                                            }
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        </FormItem>
                    )} />
                    <FormField control={control} name='gender' render={({ field }) => (
                        <FormItem className='mb-4  mt-2'>
                            <FormLabel>Age</FormLabel>
                            <FormControl className=''>
                                <Select onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Young" />
                                    </SelectTrigger>
                                    <SelectContent >
                                        <SelectGroup>
                                            {
                                                data?.data.ages.map(age => (
                                                    <SelectItem value={age.code} key={age.code}>{age.name}</SelectItem>
                                                ))
                                            }
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        </FormItem>
                    )} />
                    <FormField control={control} name='age' render={({ field }) => (
                        <FormItem className='mb-4  mt-2'>
                            <FormLabel>Accent</FormLabel>
                            <FormControl className=''>
                                <Select onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="American" />
                                    </SelectTrigger>
                                    <SelectContent >
                                        <SelectGroup>
                                            {
                                                data?.data.accents.map(accent => (
                                                    <SelectItem value={accent.code} key={accent.code}>{accent.name}</SelectItem>
                                                ))
                                            }
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        </FormItem>
                    )} />

                    <FormField control={control} name='accent_strength' render={({ field }) => (
                        <FormItem className='mb-4'>
                            <FormLabel>Accent Strength</FormLabel>
                            <FormControl>
                                <Slider className='mt-2' defaultValue={[field.value]} max={200} showTooltip onValueChange={(vals) => field.onChange(vals[0])} />
                            </FormControl>
                        </FormItem>
                    )} />
                    <FormField control={control} name='text' render={({ field }) => (
                        <FormItem className='mb-4'>
                            <FormLabel>Text</FormLabel>
                            <FormControl>
                                <Textarea {...field} value={field.value} className='resize-none' rows={5} placeholder='Type or paste text here. The model works best on longer fragments.' onChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )} />

                    {
                        generatedVoice.preview && !isLoading ? <audio src={generatedVoice.preview} controls autoPlay className='w-full mb-3'></audio> : null
                    }
                    <div className="">
                        <Button className='mr-2 w-full' type='submit' disabled={isLoading} variant={"secondary"}>Generate Voice</Button>
                        <Separator className='my-2' />
                        <Button className='mr-2 w-full' type='button' disabled={isLoading || !generatedVoice.voice_id} onClick={() => setStep(1)}>Use Voice <LuMoveRight className='ml-2' size={24} /> </Button>
                    </div>
                </form>
            </FormProvider>
        );
    }

    const Step2 = () => {
        const methods = useForm<SaveRandomGeneratedVoiceFormData>({
            mode: 'onChange',
            defaultValues: {
                voice_name: '',
                labels: [
                    {
                        key: "accent",
                        value: generatedVoice.accent as string
                    },
                    {
                        key: "gender",
                        value: generatedVoice.gender as string
                    },
                    {
                        key: "age",
                        value: generatedVoice.age as string
                    },
                ],
                voice_description: '',
                generated_voice_id: generatedVoice.voice_id as string,
                preview_url: generatedVoice.preview
            }
        });
        const { control, handleSubmit, formState: { isValid, errors }, register } = methods;

        const [tempLabel, setTempLabel] = useState<{ key: string; value: string }>({ key: "", value: "" });
        const { fields, append: labelAppend, remove: labelRemove } = useFieldArray({
            control,
            name: 'labels'
        });
        const [enableLabelInput, setEnableLabelInput] = useState(false);

        const onAddLabel = () => {
            if (tempLabel.key && tempLabel.value) {
                labelAppend({ key: tempLabel.key, value: tempLabel.value });
                setEnableLabelInput(false);
            }
        };

        const [saveRandomGeneratedVoiceApi, { isLoading }] = useSaveRandomGeneratedVoiceMutation()

        const onLabelRemove = (index: number) => {
            labelRemove(index);
        };

        const onSaveRandomVoiceHandler: SubmitHandler<SaveRandomGeneratedVoiceFormData> = async (body) => {
            try {
                await saveRandomGeneratedVoiceApi(body).unwrap()
                toast({ title: "Voice save successfully", description: "Check in the voice dropdown to access your generated voice", variant: "success" })
                setIsFormDialogOpen(false)
            } catch (error) {
                toast({ title: "Error occurred", description: "Error Occured while saving random generated voice, please try againg", variant: "destructive" })
            }
        }

        return (
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSaveRandomVoiceHandler)}>
                    <div className="flex items-center">
                        <LuMoveLeft className='mr-2 cursor-pointer' onClick={() => setStep(0)} size={25} />
                        <DialogHeader className='font-semibold'>
                            Generate voice
                        </DialogHeader>
                    </div>
                    <div className="w-full">
                        <FormField control={control} name='voice_name' render={({ field }) => (
                            <FormItem className='mb-4'>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter name' {...register('voice_name', { required: 'Name is required' })} />
                                </FormControl>
                                {errors.voice_name?.type === "required" ?
                                    <p className='text-red-600 text-xs'>
                                        {errors.voice_name.message}
                                    </p>
                                    : null}

                            </FormItem>
                        )} />

                        <FormField control={control} name='labels' render={({ field }) => (
                            <FormItem className='mb-4'>
                                <FormLabel>Labels {fields.length} / 5</FormLabel>
                                {
                                    fields.length ?
                                        <div className="flex items-center flex-wrap gap-2">
                                            {
                                                fields.map((label, index) => (
                                                    <Badge key={label.id} className='mr-2'>{label.key} : {label.value} <MdOutlineRemoveCircle className='ml-2 cursor-pointer' onClick={() => onLabelRemove(index)} size={15}></MdOutlineRemoveCircle> </Badge>
                                                ))
                                            }
                                            {
                                                fields.length < 5 &&
                                                <AiOutlinePlus onClick={() => setEnableLabelInput(true)} size={20} className='text-black cursor-pointer' />
                                            }
                                        </div> : null
                                }
                                {
                                    !enableLabelInput && !fields.length ?
                                        <div className="flex bg-gray-100 p-3 items-start">
                                            <div className="flex-shrink-0 mr-3">
                                                <PiInfoFill className='' size={20} />
                                            </div>
                                            <div className='text-xs text-gray-400 font-medium text-center flex items-center'>No Labels. Click <AiOutlinePlus onClick={() => setEnableLabelInput(true)} size={20} className='text-black cursor-pointer' /> to add the first one</div>
                                        </div> : null

                                }
                                {
                                    enableLabelInput && <div className="flex items-center">
                                        <Input placeholder='key e.g accent' className='w-40 h-5 placeholder:text-gray-500 placeholder:text-xs' onChange={(e) => setTempLabel(prev => ({ ...prev, key: e.target.value }))} />
                                        <p className='text-lg mx-2'>&#58;</p>
                                        <Input placeholder='value e.g indian' className='w-40 h-5 placeholder:text-gray-500 placeholder:text-xs' onChange={(e) => setTempLabel(prev => ({ ...prev, value: e.target.value }))} />
                                        <MdOutlineCheck size={20} className='ml-2 cursor-pointer' onClick={onAddLabel} />
                                    </div>
                                }

                            </FormItem>
                        )} />

                        <FormField control={control} name='voice_description' render={({ field }) => (
                            <FormItem className='mb-4'>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea {...field} className='resize-none placeholder:text-xs placeholder:text-gray-500' placeholder='How would you describe the voice? e.g. "An old American male voice with a slight hoarseness in his throat. Perfect for news."' maxLength={500} rows={4} onChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )} />
                    </div>
                    <Button className='mr-2 w-full' type='submit' disabled={!isValid || isLoading} >Create Voice</Button>
                </form>
            </FormProvider>
        )
    }

    return step === 0 ? <Step1 /> : <Step2 />
};


export default VoiceDesignForm