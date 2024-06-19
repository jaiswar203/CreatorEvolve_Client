
"use client";

import { Accept, useDropzone } from 'react-dropzone';

interface IDropZone {
    onHandleChange: (files: any) => void
    acceptAudio?: boolean
}

const FileUpload = ({ onHandleChange, acceptAudio = false }: IDropZone) => {
    const accept: Accept = acceptAudio ? {
        "video/*": [],
        "audio/*": [],

    } : {
        "video/*": [],
    }

    const { getRootProps, getInputProps } = useDropzone({
        accept,
        onDrop: onHandleChange
    });

    const points = [
        {
            title: "Duration",
            value: "4sec-20min"
        },
        {
            title: "Audio",
            value: "Required"
        },
        {
            title: "Resolution",
            value: "360p-4k"
        },
        {
            title: "File size",
            value: "≤2GB per video"
        },
    ]

    return (
        <div {...getRootProps()} className="border-2 border-dashed w-full border-gray-400 p-6 rounded-lg text-center py-8 cursor-pointer">
            <input {...getInputProps()} accept={acceptAudio ? 'video/*, audio/*' : 'video/*'} />
            <p className="text-base font-semibold">Drop video {acceptAudio ? "or audio" : ""} here or click to browse file</p>
            <div className="mt-4 flex flex-col items-center">
                <p className='text-sm font-semibold text-gray-500'>Supported videos according to:</p>
                <div className=" mt-2 flex md:justify-between md:flex-row flex-col">
                    {points.map((item, index) => (
                        <div key={index} className='flex mr-4 justify-between items-center'>
                            <h2 className="mr-1 text-sm font-semibold text-gray-500 ">{item.title}: </h2>
                            <p className="text-xs text-gray-700">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
