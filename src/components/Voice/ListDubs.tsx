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
import { IDubs } from '@/redux/interfaces/media';
import { targetLanguages } from '@/constants/audio';
import { downloadFile, trimText } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import CustomVideoPlayer from '../CustomVideoPlayer/CustomVideoPlayer';
import { useRemoveDubbedFileMutation } from '@/redux/api/media';
import { useToast } from '../ui/use-toast';

import { MdDelete, MdDownload, MdPlayArrow } from "react-icons/md";

interface IDubsList {
    data: IDubs[];
}

const ListDubs: React.FC<IDubsList> = ({ data }) => {
    const [removeDubbingApi] = useRemoveDubbedFileMutation()

    const { toast } = useToast()

    if (!data) return null

    const language = (code: string) => targetLanguages?.find(lan => code === lan.value)?.name

    const onRemoveDubbingHandler = async (videoId: string) => {
        try {
            await removeDubbingApi(videoId).unwrap()
            toast({ title: "Dubbing removed", description: "Your dubbed file is removed from our DB", variant: "success" })
        } catch (error) {
            toast({ title: "Dubbing removal failed", description: "Your dubbed file is not removed from our DB, please try again", variant: "destructive" })
            console.log({ error })
        }
    }

    return (
        <Card className='mt-20'>
            <CardHeader className="px-7">
                <CardTitle>Dubbings</CardTitle>
                <CardDescription>List of all dubbings.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden sm:table-cell">Language</TableHead>
                            <TableHead className="hidden sm:table-cell">Status</TableHead>
                            <TableHead className="hidden sm:table-cell">Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((dub) => (
                            <TableRow key={dub._id}>
                                <TableCell>
                                    <div className="font-medium">{trimText(dub.name, 40)}</div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{language(dub.target_languages[0])}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    {dub.status === "completed" ?
                                        <Badge className="text-xs bg-green-400" >
                                            {dub.status}
                                        </Badge>
                                        :
                                        <Badge className="text-xs bg-yellow-400">
                                            Pending
                                        </Badge>
                                    }
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    {new Date(dub.created_at).toLocaleString('en-US', {
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
                                                <CustomVideoPlayer url={dub.url} />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <div className='w-10 h-10  cursor-pointer bg-primary text-white flex items-center justify-center rounded-full text-xs' onClick={() => downloadFile(dub.url, dub.name)}>
                                        <MdDownload size={18} />
                                    </div>
                                    <div className='w-10 h-10  cursor-pointer bg-destructive flex items-center justify-center rounded-full text-xs' onClick={() => onRemoveDubbingHandler(dub._id)}>
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

export default ListDubs;
