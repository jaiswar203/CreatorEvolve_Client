"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"

import { cn, trimText } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
} from "@/components/ui/select"
import { IVoicesList } from "@/redux/interfaces/media"
import { MdKeyboardArrowRight, MdOutlineAdd, MdOutlinePlayCircleFilled } from "react-icons/md"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { useAddSharedVoiceInLibraryMutation, useLazyGetSharedVoicesListQuery } from "@/redux/api/media"
import { useToast } from "../ui/use-toast"
import { Skeleton } from "../ui/skeleton"
import VoicePlayer from "./VoicePlayer"

interface IVoiceSelector {
    voices: IVoicesList[] | undefined
    privateVoices: IVoicesList[] | undefined
    onChange: (voiceId: string) => void
}

const SharedVoices = ({ libVoices, onPlayerDataHandler }: { libVoices: IVoicesList[], onPlayerDataHandler: (url: string, name: string) => void }) => {
    const { toast } = useToast()
    const [trigger, { data: sharedVoices, isLoading }] = useLazyGetSharedVoicesListQuery()
    const [addSharedVoiceInLibApi] = useAddSharedVoiceInLibraryMutation()

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const onAddHandler = async (public_owner_id: string, voice_id: string, name: string) => {
        try {
            await addSharedVoiceInLibApi({ public_owner_id, voice_id, name }).unwrap()
            toast({ title: "Voice added", description: "Voice is successfully added in the library", variant: "success" })
            setIsDialogOpen(false)
        } catch (error) {
            toast({ title: "Failed", description: "Voice is not added in the library for some reason, try again", variant: "destructive" })
        }
    }

    const handleDialogOpen = (open: boolean) => {
        setIsDialogOpen(open)
        if (open) trigger("")
    }

    const filteredSharedVoices = sharedVoices?.data.filter(
        sharedVoice => !libVoices.some(libVoice => libVoice.id === sharedVoice.id)
    )

    return (
        <Dialog onOpenChange={handleDialogOpen} open={isDialogOpen}>
            <DialogTrigger className="flex justify-end cursor-pointer mt-3 hover:underline items-center w-full">
                <p className="text-sm">Show more voices</p> <MdKeyboardArrowRight size={20} />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">More voices</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-72 w-full">
                    {
                        isLoading ? [1, 2, 3, 4, 5].map(
                            () => (
                                <div className="flex justify-between items-center mb-2" >
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="flex items-center">
                                        <Skeleton className="w-[330px] h-8" />
                                    </div>
                                    <Skeleton className="w-16 h-8">

                                    </Skeleton>
                                </div>
                            )
                        ) : (
                            filteredSharedVoices?.map(voice => (
                                <div className="flex justify-between items-center mb-2" key={voice.name}>
                                    <div className="flex items-center">
                                        <MdOutlinePlayCircleFilled size={35} className="mr-2 cursor-pointer z-50" onClick={(e) => {
                                            onPlayerDataHandler(voice.preview, voice.name)
                                            e.stopPropagation()
                                        }} />
                                        <p className="text-sm text-gray-500 max-w-80">{voice.name}</p>
                                    </div>
                                    <div className="flex rounded-lg justify-center items-center p-2 border-1 text-gray-500 cursor-pointer hover:bg-slate-100" onClick={() => onAddHandler(voice.public_owner_id, voice.id, voice.name)}>
                                        <MdOutlineAdd />
                                        <p className="text-sm">Add</p>
                                    </div>
                                </div>
                            ))
                        )
                    }
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

const DEFAULT_PLAYER_DATA_STATE = { show: false, url: "", name: "", playing: false }

export function VoiceSelector({ voices, onChange, privateVoices = [] }: IVoiceSelector) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedVoice, setSelectedVoice] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const [playerData, setPlayerData] = useState(DEFAULT_PLAYER_DATA_STATE)

    const onPlayerDataHandler = (url: string, name: string, playing: boolean = true) => {
        setPlayerData({ url, name, show: true, playing })
    }

    if (!voices) return null

    const filteredVoices = voices.filter((voice) =>
        voice.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const privateFilterVoices = privateVoices?.filter((voice) =>
        voice.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelect = (voiceId: string) => {
        setSelectedVoice(selectedVoice === voiceId ? null : voiceId)
        onChange(voiceId)
        setIsOpen(false)
    }

    const selectedVoiceObj = selectedVoice ? (privateVoices?.find((voice) => voice.id === selectedVoice) || voices.find((voice) => voice.id === selectedVoice)) : voices[0]


    return (
        <div className="w-[200px]">
            <Select open={isOpen} onOpenChange={setIsOpen}>
                <SelectTrigger className="w-full ">
                    <div className="flex items-center">
                        <MdOutlinePlayCircleFilled size={25} className="mr-2 cursor-pointer z-50" />
                        <SelectValue placeholder={selectedVoiceObj?.id ? trimText(selectedVoiceObj.name, 15) : "Select voice..."} />
                    </div>
                </SelectTrigger>
                <SelectContent className="p-0 right-0">
                    <Command>
                        <CommandInput
                            placeholder="Search voice..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                        />
                        <CommandList>
                            <CommandEmpty>No voice found.</CommandEmpty>
                            <CommandGroup className=" border-b-2 border-gray-200">
                                <p className="text-xs text-gray-400 font-medium">Cloned</p>
                                {privateFilterVoices.map((voice) => (
                                    <CommandItem
                                        key={voice.id}
                                        value={voice.name}
                                        onSelect={() => handleSelect(voice.id)}
                                        className="flex justify-between"
                                    >
                                        <div className="flex items-center">
                                            <MdOutlinePlayCircleFilled size={25} className="mr-2 cursor-pointer z-50" onClick={(e) => {
                                                onPlayerDataHandler(voice.preview, voice.name)
                                                e.stopPropagation()
                                            }} />
                                            {voice.name}
                                        </div>
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedVoice === voice.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandGroup>
                                <p className="text-xs text-gray-400 font-medium">Premade</p>
                                {filteredVoices.map((voice) => (
                                    <CommandItem
                                        key={voice.id}
                                        value={voice.name}
                                        onSelect={() => handleSelect(voice.id)}
                                        className="flex justify-between"
                                    >
                                        <div className="flex items-center">
                                            <MdOutlinePlayCircleFilled size={25} className="mr-2 cursor-pointer z-50" onClick={(e) => {
                                                onPlayerDataHandler(voice.preview, voice.name)
                                                e.stopPropagation()
                                            }} />
                                            {voice.name}
                                        </div>
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedVoice === voice.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <SharedVoices libVoices={voices} onPlayerDataHandler={onPlayerDataHandler} />
                        </CommandList>
                    </Command>
                </SelectContent>
            </Select>

            {
                playerData.show &&
                <VoicePlayer url={playerData.url} name={playerData.name} playing={playerData.playing} onClose={() => setPlayerData(DEFAULT_PLAYER_DATA_STATE)} onAudioEnd={() => setPlayerData(DEFAULT_PLAYER_DATA_STATE)} />
            }
        </div>
    )
}
