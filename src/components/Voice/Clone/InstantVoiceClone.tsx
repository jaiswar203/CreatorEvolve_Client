import React, { useState } from 'react';
import { DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MdOutlineRemoveCircle, MdOutlineCheck } from 'react-icons/md';
import { AiOutlinePlus } from 'react-icons/ai';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { useDropzone } from 'react-dropzone';
import { FormProvider, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useUploadFileMutation } from '@/redux/api/app';
import { getCloudFrontURL, trimText } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import prettyBytes from 'pretty-bytes';
import { useInstantVoiceCloneMutation } from '@/redux/api/media';
import { useToast } from '@/components/ui/use-toast';
import { PiInfoFill } from 'react-icons/pi';

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

export default InstantCloneForm