"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback, Dispatch, SetStateAction } from 'react';
import { HiDocumentAdd } from "react-icons/hi";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from '../ui/input';
import { BiSearchAlt } from 'react-icons/bi';
import { useAppSelector } from '@/redux/hook';
import { FaRegStopCircle } from 'react-icons/fa';
import { IChatMessage } from '@/redux/interfaces/research';
import { Separator } from '../ui/separator';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import TextSelectionContextMenu, { MenuItem } from '../TextSelectionContextMenu/TextSelectionContextMenu';
import { Button } from '../ui/button';
import { useSearchMediaMutation } from '@/redux/api/research';
import { AiOutlinePlus } from 'react-icons/ai';
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogFooter, DialogHeader } from '../ui/dialog';
import ImageViewer from '../ImageViewer/ImageViewer';
import { RxCross1 } from "react-icons/rx";
import { PiVideoFill } from 'react-icons/pi';
import { MdAdd, MdPhotoSizeSelectActual } from 'react-icons/md';
import { BsPlayCircle } from "react-icons/bs";
import { FaRegEye } from "react-icons/fa";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


interface IProps {
    id: string;
    chat: IChatMessage[];
    refetch: () => void;
    documentText: string
    setDocumentText: Dispatch<SetStateAction<string>>
}

interface IQAPair {
    question: string;
    answer: string;
    images?: { context: string, title: string, thumbnail: string, link: string }[];
    videos?: { context: string, title: string, thumbnail: string, link: string, id: string }[];
}


const processQAData = (data: IChatMessage[]) => {
    if (!data || !data.length) return [];
    const filteredData = data.filter(item => item.role !== 'system');
    const qaPairs = [];
    for (let i = 0; i < filteredData.length; i += 2) {
        if (filteredData[i].role === 'user' && filteredData[i + 1] && filteredData[i + 1].role === 'assistant') {
            qaPairs.push({
                question: filteredData[i].content,
                answer: filteredData[i + 1].content,
                images: filteredData[i + 1].images,
                videos: filteredData[i + 1].videos
            });
        }
    }
    return qaPairs;
};

const MarkdownRenderer = React.memo(({ content }: { content: string }) => (
    <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
            a: ({ href, children, ...props }) => (
                <a href={href} style={{ color: 'blue', textDecoration: 'underline' }} {...props} target='_blank'>
                    {children}
                </a>
            ),
            h3: ({ children, ...props }) => (
                <h3 {...props} className="text-lg font-semibold">{children}</h3>
            ),
            ul: ({ children, ...props }) => (
                <ul {...props} className="list-disc p-3">{children}</ul>
            ),
            code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                    <SyntaxHighlighter style={okaidia} language={match[1]} PreTag="div" {...props}>
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                ) : (
                    <code className={className} {...props}>
                        {children}
                    </code>
                );
            }
        }}
    />
));

const ChatBox: React.FC<IProps> = ({ id, chat, refetch, setDocumentText, documentText }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [chatContent, setChatContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [selecteMediaIndex, setSelectMediaIndex] = useState(0)

    const [qaPairs, setQAPairs] = useState<IQAPair[]>(() => processQAData(chat));

    const { user } = useAppSelector(state => state.user);
    const [selectedHtml, setSelectedHtml] = useState('');

    const [searchMediaApi, { isLoading: isSeachMediaApiLoading }] = useSearchMediaMutation()

    useEffect(() => {
        setQAPairs(processQAData(chat));
    }, [chat]);

    const onSearchMediaHandler = async ({ assistant_answer, index, prompt, type = "image" }: { prompt: string, index: number, assistant_answer: string, type?: "image" | "video" }) => {
        try {
            const assistantIndex = (index * 2) + 2 // this is the index of assistant role object inside the message array
            const resp = await searchMediaApi({ assistant_answer, prompt, message_index: assistantIndex, chat_id: id, type }).unwrap()
            setQAPairs(processQAData(resp.data.messages))
        } catch (error) {
            console.error('Error searching images:', error);
        }
    }

    const sendRequest = useCallback(async () => {
        if (isStreaming || !inputRef.current) return;
        setIsStreaming(true);
        abortControllerRef.current = new AbortController();
        const inputValue = inputRef.current.value;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/research/chat/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.access_token}`
                },
                body: JSON.stringify({ prompt: inputValue }),
                signal: abortControllerRef.current.signal
            });

            if (!response.body) return;

            const reader = response.body
                .pipeThrough(new TextDecoderStream())
                .getReader();

            inputRef.current.value = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    refetch();
                    setChatContent('');
                    break;
                }
                setChatContent((prev) => prev + value);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                console.error('Error during streaming:', error);
            }
        } finally {
            setIsStreaming(false);
        }
    }, [id, user.access_token, refetch, isStreaming]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputRef?.current && inputRef.current.value.trim() && !isStreaming) {
            sendRequest();
        }
    }, [isStreaming, sendRequest]);

    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsStreaming(false);
        }
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatContent]);

    const addImageToDocument = (img: string) => {
        const imgTag = `${!documentText.length ? <br /> : ""}<img src=${img} class="image" style="width:100%;"></img>`
        onAddToDocumentHandler(imgTag)
    }

    const addVideoToDocument = (link: string, thumbnail: string, title: string) => {
        const videoTag = `<div class="video" style="display:flex; margin: .5rem 0;position:relative;">
                    <img src=${thumbnail} class="video-image" style="width:8rem; max-width: 8rem; border-radius: 5px;" alt="" />
                    <div style="margin-left: .5rem">
                        <p style="font-weight:600;">${title}</p>
                        <a style="text-decoration:underline; color: blue; font-size: .8rem;" href=${link}>${link}</a>
                    </div>
                </div>`
        onAddToDocumentHandler(videoTag)
    }


    const renderQAPairs = useMemo(() => (
        qaPairs.map((message, index) => (
            <React.Fragment key={index}>
                <div>
                    <h1 className='text-2xl'>{message.question}</h1>
                    <p className="text-sm mt-2">
                        <MarkdownRenderer content={message.answer} />
                    </p>
                </div>

                {
                    message?.images?.length ? <div className="flex flex-wrap gap-2 mb-2 ">
                        <Dialog>
                            {
                                message.images.map((image, index) => (
                                    <>
                                        <DialogTrigger asChild onClick={() => setSelectMediaIndex(index)}>
                                            <div className="relative group">
                                                <img
                                                    src={image.link}
                                                    className='cursor-pointer'
                                                    style={{ width: "200px", height: "133.3px", objectFit: "cover" }}
                                                    alt={image.title}
                                                />
                                                <div
                                                    className="absolute h-full top-0 left-0 flex justify-center items-center w-full bg-black bg-opacity-50 flex-col 
                     transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                                                >
                                                    {/* <h1 className='text-white text-center text-xs'>Click below button to add image to document</h1> */}
                                                    <div className="flex">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger className='mr-2'>
                                                                    <div
                                                                        className='text-xs bg-black text-white border-2 px-2 py-1 mt-2  hover:bg-gray-400 custom-remove-button rounded-full w-8 h-8 flex items-center justify-center cursor-pointer'
                                                                    >
                                                                        <FaRegEye size={15} />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="text-xs font-light text-gray-700">Click here to view the image</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <div
                                                                        className='text-xs bg-white text-black px-2 py-1 mt-2  hover:bg-gray-400 custom-remove-button rounded-full w-8 h-8 flex items-center justify-center cursor-pointer mr-2'
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            addImageToDocument(image.link);
                                                                        }}
                                                                    >
                                                                        <MdAdd size={15} />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="text-xs font-light text-gray-700">Click here to add to image to document</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogTrigger>
                                    </>
                                ))
                            }
                            <DialogContent className='max-w-full  bg-black \-opacity-90 py-0 !rounded-none' dialogOverlayClassName='p-0 rounded-none' showCloseButton={false}>
                                <DialogHeader className='justify-end'>
                                    <DialogClose className='absolute top-2 right-2'>
                                        <div className="bg-offsetPlus dark:bg-offsetPlusDark text-textMain dark:text-textMainDark  md:hover:text-textOff md:dark:hover:text-textOffDark  focus:outline-none outline-none outline-transparent transition duration-300 ease-in-out   select-none  relative group/button  justify-center text-center items-center rounded-full cursor-point active:scale-95 origin-center whitespace-nowrap inline-flex text-base aspect-square h-10">
                                            <RxCross1 size={20} className='text-white' />
                                        </div>
                                    </DialogClose>
                                </DialogHeader>

                                <ImageViewer selectedIndex={selecteMediaIndex} images={message.images} />

                                <DialogFooter className="sm:justify-start">
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        {/* <div className="flex flex-col justify-center items-center border cursor-pointer" style={{ width: "200px", height: "133.3px", objectFit: "cover" }} onClick={() => onSearchMediaHandler({ index, prompt: message.question, assistant_answer: message.answer })}>
                            <AiOutlinePlus size={25} className='text-gray-500' />
                            <h2 className='text-gray-500'>More</h2>
                        </div> */}

                    </div> : null
                }

                {
                    message?.videos?.length ? <div className="flex flex-wrap gap-2">
                        <Dialog>
                            {
                                message.videos.map((image, index) => (
                                    <>
                                        <DialogTrigger asChild onClick={() => setSelectMediaIndex(index)}>

                                            <div className="relative group">
                                                <img src={image.thumbnail} className='cursor-pointer' style={{ width: "200px", height: "133.3px", objectFit: "cover" }} alt={image.title} />
                                                <div className="flex absolute bottom-0 right-0  text-white justify-center items-center bg-black py-2 px-3 rounded-sm"  >
                                                    <BsPlayCircle className='text-white mr-1' size={15} />
                                                    <p className="text-xs">Watch</p>
                                                </div>
                                                <div
                                                    className="absolute h-full top-0 left-0 flex justify-center items-center w-full bg-black bg-opacity-50 flex-col 
                     transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                                                >
                                                    {/* <h1 className='text-white text-center text-xs'>Click below button to add image to document</h1> */}
                                                    <div className="flex">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger className='mr-2'>
                                                                    <div
                                                                        className='text-xs bg-black text-white border-2 px-2 py-1 mt-2  hover:bg-gray-400 custom-remove-button rounded-full w-8 h-8 flex items-center justify-center cursor-pointer'
                                                                    >
                                                                        <FaRegEye size={15} />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="text-xs font-light text-gray-700">Click here to view the video</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <div
                                                                        className='text-xs bg-white text-black px-2 py-1 mt-2  hover:bg-gray-400 custom-remove-button rounded-full w-8 h-8 flex items-center justify-center cursor-pointer mr-2'
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            addVideoToDocument(image.link, image.thumbnail, image.title);
                                                                        }}
                                                                    >
                                                                        <MdAdd size={15} />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="text-xs font-light text-gray-700">Click here to add to video to document</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <div className="relative">
                                                <img src={image.thumbnail} className='cursor-pointer' style={{ width: "200px", height: "133.3px", objectFit: "cover" }} alt={image.title} />
                                                <div className="flex absolute bottom-0 right-0  text-white justify-center items-center bg-black py-2 px-3 rounded-sm"  >
                                                    <BsPlayCircle className='text-white mr-1' size={15} />
                                                    <p className="text-xs">Watch</p>
                                                </div>
                                            </div> */}
                                        </DialogTrigger>
                                    </>
                                ))
                            }
                            <DialogContent className='max-w-full h-dvh  bg-black bg-opacity-90 py-0 !rounded-none flex items-center justify-center' dialogOverlayClassName='p-0 rounded-none' showCloseButton={false}>
                                <DialogHeader className='justify-end'>
                                    <DialogClose className='absolute top-4 right-4'>
                                        <div className="bg-offsetPlus dark:bg-offsetPlusDark text-textMain dark:text-textMainDark  md:hover:text-textOff md:dark:hover:text-textOffDark  focus:outline-none outline-none outline-transparent transition duration-300 ease-in-out   select-none relative group/button  justify-center text-center items-center rounded-full cursor-point active:scale-95 origin-center whitespace-nowrap inline-flex text-base aspect-square h-10">
                                            <RxCross1 size={20} className='text-white' />
                                        </div>
                                    </DialogClose>

                                    {
                                        message.videos[selecteMediaIndex]?.link && (
                                            <iframe
                                                title={message.videos[selecteMediaIndex].title}
                                                width="800"
                                                height="450.19"
                                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                src={`https://www.youtube.com/embed/${message.videos[selecteMediaIndex].id}?autoplay=1`}
                                            ></iframe>
                                        )
                                    }

                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                        {/* DO NOT REMOVE THIS, ITS CODE FOR ADDING MORE MEDIA */}
                        {/* <div className="flex flex-col justify-center items-center border cursor-pointer" style={{ width: "200px", height: "133.3px", objectFit: "cover" }} onClick={() => onSearchMediaHandler({ index, prompt: message.question, assistant_answer: message.answer })}>
                            <AiOutlinePlus size={25} className='text-gray-500' />
                            <h2 className='text-gray-500'>More</h2>
                        </div> */}
                    </div> : null
                }


                <div className="flex justify-end mt-2">
                    <div className="flex">
                        {
                            !message?.images?.length &&
                            <div className="flex justify-end mr-4">
                                <Button className="" disabled={isSeachMediaApiLoading} variant={"outline"} onClick={() => onSearchMediaHandler({ index, prompt: message.question, assistant_answer: message.answer })}>

                                    <AiOutlinePlus className='mr-4' />
                                    <p className='text-xs mr-1'>Search images</p>
                                    <MdPhotoSizeSelectActual size={17} />
                                </Button>
                            </div>
                        }
                        {
                            !message?.videos?.length &&
                            <div className="flex justify-end">
                                <Button className="" disabled={isSeachMediaApiLoading} variant={"outline"} onClick={() => onSearchMediaHandler({ index, prompt: message.question, assistant_answer: message.answer, type: "video" })}>
                                    <AiOutlinePlus className='mr-4' />
                                    <p className='text-xs mr-1'>Search videos</p>
                                    <PiVideoFill size={17} />
                                </Button>
                            </div>
                        }
                    </div>
                </div>
                <Separator className='my-6' />
            </React.Fragment>
        ))
    ), [qaPairs, onSearchMediaHandler]);

    const handleTextSelect = () => {
        const selection = window.getSelection();
        if (selection?.rangeCount) {
            const range = selection.getRangeAt(0);
            const container = document.createElement('div');
            container.appendChild(range.cloneContents());
            const selectedHtml = container.innerHTML;
            setSelectedHtml(selectedHtml.toString());
        }
    };


    useEffect(() => {
        document.addEventListener('mouseup', handleTextSelect);
        return () => {
            document.removeEventListener('mouseup', handleTextSelect);
        };
    }, []);

    const onAddToDocumentHandler = (text: string) => {
        setDocumentText(prev => prev + text)
    }

    const menuItems: MenuItem[] = [
        {
            content: (
                <>
                    <HiDocumentAdd size={20} className="mr-2" />
                    Add to document
                </>
            ),
            onClick: (text: string) => onAddToDocumentHandler(text),
        },
    ];

    return (
        <ContextMenu >
            <ContextMenuTrigger>
                <div className="h-full flex flex-col justify-between p-2">
                    <div ref={chatContainerRef} className="overflow-y-auto h-[calc(85vh-100px)] scrollbar-custom text-sm bg-white">
                        <div className="p-6 rounded-l">
                            <TextSelectionContextMenu menuItems={menuItems} containerClassName=""
                                menuClassName="bg-white shadow-xl"
                                menuItemClassName="text-sm hover:bg-blue-50"
                            >
                                {renderQAPairs}
                                {isStreaming && <MarkdownRenderer content={chatContent} />}
                            </TextSelectionContextMenu>
                        </div>
                    </div>
                    <div className="sticky w-full">
                        <Input
                            placeholder="Enter any topic you'd like to create content on with the Research Wizard"
                            className='outline-none border-0'
                            ref={inputRef}
                            onKeyDown={handleKeyDown}
                        />
                        {isStreaming ? (
                            <FaRegStopCircle
                                size={20}
                                className='absolute right-2 top-3 cursor-pointer'
                                onClick={stopStreaming}
                            />
                        ) : (
                            <BiSearchAlt
                                size={20}
                                className='absolute right-2 top-3 cursor-pointer'
                                onClick={sendRequest}
                            />
                        )}
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={() => onAddToDocumentHandler(selectedHtml)} className='cursor-pointer'>
                    <HiDocumentAdd size={20} className="mr-2" />
                    Add to document
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export default React.memo(ChatBox);
