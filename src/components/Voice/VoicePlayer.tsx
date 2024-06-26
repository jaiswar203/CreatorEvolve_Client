import React, { useEffect, useRef, useState } from 'react';
import { RxCross2 } from "react-icons/rx";
import { AiFillPlayCircle, AiFillPauseCircle } from "react-icons/ai";

interface IVoicePlayer {
    url: string;
    name: string;
    playing: boolean;
    onClose: () => void;
    onAudioEnd: () => void
}

const VoicePlayer = ({ url, name, playing, onClose, onAudioEnd }: IVoicePlayer) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(playing);

    useEffect(() => {
        if (playing) {
            audioRef.current?.play();
            setIsPlaying(true);
        } else {
            audioRef.current?.pause();
            setIsPlaying(false);
        }
    }, [playing, url]);

    useEffect(() => {
        const handleEnded = () => {
            setIsPlaying(false);
            onAudioEnd()
        };

        const audioElement = audioRef.current;
        audioElement?.addEventListener('ended', handleEnded);

        return () => {
            audioElement?.removeEventListener('ended', handleEnded);
        };
    }, []);

    const handlePlayPause = () => {
        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play();
        }
        setIsPlaying(!isPlaying);
    };

    if (!url || !name) return null;

    return (
        <div className="absolute top-0 right-0 shadow-md bg-white rounded-bl-md p-4">
            <audio ref={audioRef} src={url} />
            <RxCross2 className='top-1 absolute right-1 cursor-pointer' onClick={onClose} />
            <div className="flex items-center">
                <div onClick={handlePlayPause} className="rounded-full cursor-pointer mr-2">
                    {isPlaying ? <AiFillPauseCircle size={50} /> : <AiFillPlayCircle size={50} />}
                </div>
                <h1 className='text-sm font-medium'>Voice Preview for {name}</h1>
            </div>
        </div>
    );
};

export default VoicePlayer;
