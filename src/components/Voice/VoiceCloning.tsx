import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { MdAddCircleOutline, MdOutlineCheck, MdOutlineRemoveCircle } from 'react-icons/md'
import { LuFlaskConical, LuMoveLeft, LuMoveRight } from "react-icons/lu";
import { RxLightningBolt } from "react-icons/rx";
import { VscVerifiedFilled } from "react-icons/vsc";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { PiInfoFill } from "react-icons/pi";
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { FormProvider, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { IoCloudUploadOutline } from "react-icons/io5";
import { useDropzone } from 'react-dropzone';
import { AiOutlinePlus } from 'react-icons/ai';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { useUploadFileMutation } from '@/redux/api/app';
import { getCloudFrontURL, trimText } from '@/lib/utils';
import { Badge } from '../ui/badge';
import prettyBytes from 'pretty-bytes';
import { useGenerateRandomVoiceMutation, useGetRandonVoiceGenerationParamsQuery, useInstantVoiceCloneMutation, useSaveRandomGeneratedVoiceMutation, useSendProfessionalVoiceCloneInquiryMutation } from '@/redux/api/media';
import { useToast } from '../ui/use-toast';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';
import { useAppSelector } from '@/redux/hook';

interface InstantCloneFormProps {
    setIsFormDialogOpen: (open: boolean) => void;
}

interface UploadedFile {
    name: string;
    url: string;
    size: number;
}

interface InstantCloneFormData {
    name: string;
    files: { url: string }[];
    labels: { key: string; value: string }[];
    description: string;
}

interface SaveRandomGeneratedVoiceFormData {
    voice_name: string;
    labels: { key: string; value: string }[];
    voice_description: string;
    generated_voice_id: string
    preview_url: string
}

interface VoiceGenerateFormData {
    gender: string,
    age: string
    accent: string
    accent_strength: number
    text: string
}

const VoiceCloneOptions = ({ setHandler }: { setHandler: (value: number) => void }) => {
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

                                        Your Professional Voice Clone should finish training usually 6 hours after you've successfully verified it. We will notify you when your clone is ready.

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

const InstantCloneForm: React.FC<InstantCloneFormProps> = ({ setIsFormDialogOpen }) => {
    const { toast } = useToast()
    const methods = useForm<InstantCloneFormData>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            files: [],
            labels: [],
            description: '',
        }
    });
    const { control, handleSubmit, formState: { isValid }, register } = methods;
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [tempLabel, setTempLabel] = useState<{ key: string; value: string }>({ key: "", value: "" });
    const [enableLabelInput, setEnableLabelInput] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    const [instantVoiceCloneApi, { isLoading }] = useInstantVoiceCloneMutation()

    const accept = {
        "video/*": [],
        "audio/*": [],
    };

    const [fileUploadApi] = useUploadFileMutation();

    const { append, remove } = useFieldArray({
        control,
        name: 'files'
    });

    const { fields, append: labelAppend, remove: labelRemove } = useFieldArray({
        control,
        name: 'labels'
    });

    const onFileUploadHandler = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fileUploadApi(formData).unwrap();
            const url = getCloudFrontURL(response.data);
            setUploadedFiles(prev => [...prev, { name: file.name, url, size: file.size }]);

            append({ url: response.data });
        } catch (error) {
            console.log("error");
        }
    };

    const TEN_MB_IN_BYTES = 10485760;
    const { getRootProps, getInputProps, open } = useDropzone({
        accept,
        maxSize: TEN_MB_IN_BYTES,
        noClick: true,
        onDrop: async (acceptedFiles) => {
            for (let i = 0; i < acceptedFiles.length; i++) {
                await onFileUploadHandler(acceptedFiles[i]);
            }
        },
    });

    const onFileRemoveHandler = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        remove(index);
    };

    const onAddLabel = () => {
        if (tempLabel.key && tempLabel.value) {
            labelAppend({ key: tempLabel.key, value: tempLabel.value });
            setEnableLabelInput(false);
        }
    };

    const onLabelRemove = (index: number) => {
        labelRemove(index);
    };

    const onSubmit: SubmitHandler<InstantCloneFormData> = async ({ name, files, description, labels }) => {
        try {
            const modFiles = files.map(data => data.url)
            await instantVoiceCloneApi({ name, files: modFiles, description, labels }).unwrap()
            setIsFormDialogOpen(false)
            toast({ title: "Successfull", description: "Voice generation successfull, now you can try out your voice in voiceover", variant: "success" })

        } catch (error) {
            toast({ title: "Error Occured", description: "Error Occured while generating voice, please try again", variant: "destructive" })
        }
    };


    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader className='font-semibold'>Add voice</DialogHeader>
                <FormField control={control} name='name' render={({ field }) => (
                    <FormItem className='mb-4'>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder='Enter name' {...register('name', { required: 'Name is required' })} />
                        </FormControl>
                    </FormItem>
                )} />

                <FormField control={control} name='files' render={({ field }) => (
                    <FormItem className='mb-4'>
                        <FormControl>
                            <div
                                {...getRootProps()}
                                className="border-dashed border-black border-2 py-6 flex flex-col items-center justify-center mb-2 cursor-pointer"
                                onClick={open}
                            >
                                <IoCloudUploadOutline size={35} className='text-gray-500' />
                                <p className="font-semibold text-sm mt-1 text-gray-600">Click to upload a file or drag and drop</p>
                                <p className="text-xs text-gray-400">Audio or video files, up to 10MB</p>
                                <input {...getInputProps()} id='file-upload' />
                            </div>
                        </FormControl>
                        <FormLabel>Samples {uploadedFiles.length} / 25</FormLabel>

                        {
                            !uploadedFiles.length ?
                                <div className="flex bg-gray-100 p-3">
                                    <div className="flex-shrink-0 mr-3">
                                        <PiInfoFill className='' size={20} />
                                    </div>
                                    <div>
                                        <p className='text-xs text-gray-400 font-medium'>No items uploaded yet. Upload audio samples of the voice you would like to clone.</p>
                                        <br />
                                        <p className='text-xs text-gray-400 font-medium'>Sample quality is more important than quantity. Noisy samples may give bad results. Providing more than 5 minutes of audio in total brings little improvement.</p>
                                    </div>
                                </div> : <div className="">
                                    <p className="text-xs text-gray-400">Samples to upload ({uploadedFiles.length})</p>

                                    <div className="mt-2 max-h-16 overflow-y-auto" >
                                        {
                                            uploadedFiles.map((file, index) => (
                                                <div key={index} className="flex justify-between items-center mb-2">
                                                    <div className="flex">
                                                        <p className="text-xs font-semibold text-gray-500">{trimText(file.name, 20)}</p>
                                                        <Badge>{prettyBytes(file.size)}</Badge>
                                                    </div>
                                                    <MdOutlineRemoveCircle className='text-red-600 cursor-pointer' size={20} onClick={() => onFileRemoveHandler(index)} />
                                                </div>
                                            ))
                                        }

                                    </div>
                                </div>
                        }
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

                <FormField control={control} name='description' render={({ field }) => (
                    <FormItem className='mb-4'>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} className='resize-none placeholder:text-xs placeholder:text-gray-500' placeholder='How would you describe the voice? e.g. "An old American male voice with a slight hoarseness in his throat. Perfect for news."' maxLength={500} rows={4} {...register('description', { required: 'Description is required', maxLength: { value: 500, message: 'Description cannot exceed 500 characters' } })} />
                        </FormControl>
                    </FormItem>
                )} />

                <div className="flex">
                    <div className='flex-shrink-0 mr-3'>
                        <Checkbox id="terms" onCheckedChange={(val: boolean) => setAcceptTerms(val)} />
                    </div>
                    <Label className='text-gray-400 text-xs'>
                        I hereby confirm that I have all necessary rights or consents to upload and clone these voice samples and that I will not use the platform-generated content for any illegal, fraudulent, or harmful purpose. I reaffirm my obligation to abide by ElevenLabs’ Terms of Service and Privacy Policy.
                    </Label>
                </div>

                <div className="flex justify-end mt-3">
                    <Button className='mr-2' type='button' variant={"outline"} onClick={() => setIsFormDialogOpen(false)}>Cancel</Button>
                    <Button loading={{ isLoading }} disabled={!isValid || !acceptTerms || !fields.length || !uploadedFiles.length} type='submit'>Add Voice</Button>
                </div>
            </form>
        </FormProvider>
    );
};

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
                const preview = getCloudFrontURL(resp.data.preview)
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
                                                    <SelectItem value={gender.code}>{gender.name}</SelectItem>
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
                                                    <SelectItem value={age.code}>{age.name}</SelectItem>
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
                                                    <SelectItem value={accent.code}>{accent.name}</SelectItem>
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

const ProfessionalVoiceClone: React.FC<InstantCloneFormProps> = ({ setIsFormDialogOpen }) => {
    const { toast } = useToast()
    const { user } = useAppSelector(state => state.user)
    const form = useForm({
        defaultValues: {
            email: user.email as string,
            name: user.name as string,
            phone: user.phone as string
        }
    })

    const { control, handleSubmit } = form;

    const [sendProssesionalVoiceCloneInquiryApi, { isLoading }] = useSendProfessionalVoiceCloneInquiryMutation()

    const onSubmit: SubmitHandler<{ email: string, phone: string, name: string }> = async (data) => {
        try {
            await sendProssesionalVoiceCloneInquiryApi(data).unwrap()
            toast({ title: "Inquiry sent", description: "We've successfully received your inquiry and will reach out to you soon", variant: "success" })
            setIsFormDialogOpen(false)
        } catch (error) {
            console.log({error})
            toast({ title: "Failed to send inquiry", description: "Please try again", variant: "destructive" })
        }
    }

    return <div>
        <DialogHeader className='font-semibold'>
            Professional voice cloning
        </DialogHeader>
        <p className="text-xs  text-gray-500">
            Interested in creating a professional cloned voice? Send us your inquiry, and we'll reach out to guide you through the process.
        </p>

        <FormProvider {...form}>
            <form className='mt-3' onSubmit={handleSubmit(onSubmit)}>
                <FormField control={control} name='name' render={({ field }) => (
                    <FormItem className='mb-4'>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder='Enter name' disabled value={field.value} />
                        </FormControl>
                    </FormItem>
                )} />
                <FormField control={control} name='email' render={({ field }) => (
                    <FormItem className='mb-4'>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder='Enter name' disabled value={field.value} />
                        </FormControl>
                    </FormItem>
                )} />
                <FormField control={control} name='phone' render={({ field }) => (
                    <FormItem className='mb-4'>
                        <FormLabel>Phone<span className='text-gray-400'>(optional)</span></FormLabel>
                        <FormControl>
                            <Input {...field} placeholder='e.g +918495884755' type='number' value={field.value} />
                        </FormControl>
                    </FormItem>
                )} />

                <Button className='w-full mt-4' type='submit' disabled={isLoading}>
                    Submit Inquiry
                </Button>
            </form>
        </FormProvider>
    </div>
}

const VoiceClonning: React.FC = () => {
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [selectedVoiceCloneOption, setSelectedVoiceCloneOption] = useState<number | null>(null);

    const setOptionHandler = (value: number) => {
        setSelectedVoiceCloneOption(value);
    };

    const onOpenChangeHandler = (open: boolean) => {
        setIsFormDialogOpen(open);
        setSelectedVoiceCloneOption(null);
    };

    const render = (option: number | null) => {
        switch (option) {
            case 0:
                return <VoiceDesignForm setIsFormDialogOpen={setIsFormDialogOpen} />
            case 1:
                return <InstantCloneForm setIsFormDialogOpen={setIsFormDialogOpen} />
            case 2:
                return <ProfessionalVoiceClone setIsFormDialogOpen={setIsFormDialogOpen} />
            default:
                return <VoiceCloneOptions setHandler={setOptionHandler} />
        }
    }

    return (
        <div className="flex justify-end mt-7 px-4">
            <Dialog open={isFormDialogOpen} onOpenChange={onOpenChangeHandler}>
                <DialogTrigger>
                    <Button>
                        <MdAddCircleOutline size={20} className="mr-2" />
                        Add Voice
                    </Button>
                </DialogTrigger>
                <DialogContent onOpenAutoFocus={(event) => event.preventDefault()}>
                    {render(selectedVoiceCloneOption)}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VoiceClonning