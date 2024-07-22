"use client";
import React, { useEffect } from 'react';
import { Card, CardHeader } from '../ui/card';
import { useDeleteResearchByIdMutation, useGetResearchListQuery, useStartResearchMutation } from '@/redux/api/research';
import { trimText } from '@/lib/utils';
import { MdDelete, MdOutlineAddCircleOutline } from 'react-icons/md';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Controller, useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useToast } from '../ui/use-toast';
import Link from 'next/link';

interface IFormInput {
    name: string;
    system_prompt?: string;
}

const List: React.FC = () => {
    const { data, refetch } = useGetResearchListQuery();
    const [startResearchApi, { isLoading }] = useStartResearchMutation();
    const [deleteResearchByIdApi] = useDeleteResearchByIdMutation()

    const { control, handleSubmit } = useForm<IFormInput>();
    const router = useRouter();

    const { toast } = useToast()

    useEffect(() => {
        refetch();
    }, [refetch]);

    const onSubmitHandler: SubmitHandler<IFormInput> = async (data) => {
        try {
            const resp = await startResearchApi({
                name: data.name,
                system_prompt: data.system_prompt,
            }).unwrap();
            router.push(`/research/${resp.data._id}`);
        } catch (error) {
            console.error(error);
        }
    };

    const onDeleteById = async (id: string, event: React.MouseEvent) => {
        event.stopPropagation()
        try {
            await deleteResearchByIdApi(id).unwrap()
            refetch()
        } catch (error) {
            toast({ title: "Failed to delete", description: "Failed delete the research, please try again", variant: "destructive" })
        }
    }

    return (
        <div className="flex flex-wrap gap-5">
            <Dialog>
                <DialogTrigger>
                    <div className="cursor-pointer w-52 mr-4 flex bg-black text-white items-center space-y-1.5 p-6 h-20 shadow-sm rounded-lg border  text-card-foreground">
                        <div className="flex justify-between w-full">
                            <MdOutlineAddCircleOutline size={40} />
                            <h1 className="mt-2">New Research</h1>
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>Start New Research</DialogHeader>
                    <form onSubmit={handleSubmit(onSubmitHandler)}>
                        <div className="mb-2">
                            <Label>Name</Label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: "Name is required" }}
                                render={({ field }) => (
                                    <Input {...field} />
                                )}
                            />
                        </div>
                        <div className="mb-4">
                            <Label>System Prompt <span className="text-gray-500">(Optional)</span></Label>
                            <Controller
                                name="system_prompt"
                                control={control}
                                render={({ field }) => (
                                    <Textarea {...field} rows={4} className="resize-none" />
                                )}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading} loading={{ isLoading }}>
                            Create
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
            {data?.data && data.data.map(research => (
                <Link href={`/research/${research._id}`} passHref key={research._id}>
                    <Card className="cursor-pointer w-56 mr-4 h-20 hover:bg-gray-200 transition duration-300  flex items-center relative" key={research._id} >
                        <CardHeader className="font-semibold">{trimText(research.name, 20)}</CardHeader>
                        <div className="flex items-center justify-center absolute w-8 h-8 top-1 right-1 border-1 bg-gray-100  rounded-full" onClick={(e) => onDeleteById(research._id, e)}>
                            <MdDelete className="text-red-500" size={15} />
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

export default List;
