import React from 'react';
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
import { IEnhancedAudio } from "@/redux/interfaces/media"
import { IEnhancedAudioStatus } from '@/redux/interfaces/enum';
import { downloadFile, trimText } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import CustomVideoPlayer from '@/components/CustomVideoPlayer/CustomVideoPlayer';

import { useToast } from '@/components/ui/use-toast';

import { MdDelete, MdDownload, MdPlayArrow } from "react-icons/md";
import { useRemoveEnhancedAudioMutation } from '@/redux/api/media';

interface IEnhancedAudiosList {
    data: IEnhancedAudio[];
    refetch: () => void
}

const EnhancedAudiosList: React.FC<IEnhancedAudiosList> = ({ data, refetch }) => {
    const [removeEnhancedAudioApi] = useRemoveEnhancedAudioMutation()

    const { toast } = useToast();

    if (!data) return null;

    const onRemoveEnhancedAudioHandler = async (id: string) => {
        try {
            await removeEnhancedAudioApi(id).unwrap()
            refetch()
            toast({ title: "Enhanced Audio removed", description: "Your Enhanced Audio file is removed from our DB", variant: "success" })
        } catch (error) {
            toast({ title: "Enhanced Audio removal failed", description: "Your Enhanced Audio file is not removed from our DB, please try again", variant: "destructive" })
            console.log({ error })
        }
    };

    return (
        <Card className='mt-20'>
            <CardHeader className="px-7">
                <CardTitle>Enhanced Audios</CardTitle>
                <CardDescription>List of all enhanced audios.</CardDescription>
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
                        {data.map((audio) => (
                            <TableRow key={audio.url}>
                                <TableCell>
                                    <div className="font-medium">{trimText(audio.name, 40)}</div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    {audio.status === IEnhancedAudioStatus.SUCCESS ?
                                        <Badge className="text-xs bg-green-400" >
                                            {audio.status}
                                        </Badge>
                                        :
                                        <Badge className={`text-xs ${audio.status === IEnhancedAudioStatus.PENDING ? 'bg-yellow-400' : 'bg-red-400'}`}>
                                            {audio.status}
                                        </Badge>
                                    }
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    {new Date(audio.created_at).toLocaleString('en-US', {
                                        month: 'numeric',
                                        day: 'numeric',
                                        year: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
                                    <Dialog>
                                        <DialogTrigger>
                                            <div className='w-10 h-10  cursor-pointer border-2 flex items-center justify-center rounded-full text-xs'>
                                                <MdPlayArrow size={18} />
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <div className="flex justify-center items-center">
                                                <CustomVideoPlayer url={audio.url} />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <div className={`w-10 h-10   bg-primary text-white ${audio.status !== "success" ? "bg-gray-300" : "cursor-pointer"} flex items-center justify-center rounded-full text-xs`} onClick={() => audio.status === "success" && downloadFile(audio.url, audio.name)} >
                                        <MdDownload size={18} />
                                    </div>
                                    <div className='w-10 h-10  cursor-pointer bg-destructive flex items-center justify-center rounded-full text-xs' onClick={() => onRemoveEnhancedAudioHandler(audio.id)}>
                                        <MdDelete color='white' size={18} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default EnhancedAudiosList;
