import React from 'react';
import { DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { useSendProfessionalVoiceCloneInquiryMutation } from '@/redux/api/media';
import { useToast } from '@/components/ui/use-toast';
import { useAppSelector } from '@/redux/hook';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';

interface InstantCloneFormProps {
    setIsFormDialogOpen: (open: boolean) => void;
}


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
            Interested in creating a professional cloned voice? Send us your inquiry, and we&apos;ll reach out to guide you through the process.
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

export default ProfessionalVoiceClone