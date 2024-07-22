import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { BiSolidDownload } from "react-icons/bi";
import TextSelectionContextMenu, { MenuItem } from '../TextSelectionContextMenu/TextSelectionContextMenu';
import { HiDocumentMinus } from 'react-icons/hi2';
import { MdOutlineRedo, MdOutlineUndo } from 'react-icons/md';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../ui/context-menu';

import { useDownloadResearchMutation } from '@/redux/api/research';
import { Input } from '../ui/input';

interface IProps {
    name: string
    text: string
    setDocumentText: React.Dispatch<React.SetStateAction<string>>
    setName: (newText?: string, name?: string) => Promise<void>
    researchId: string
}

const Document: React.FC<IProps> = ({ name, text, setDocumentText, researchId, setName }) => {
    const [history, setHistory] = useState<string[]>([text]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);
    const [editedText, setEditedText] = useState(text);
    const textRef = useRef<HTMLDivElement>(null);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(name);

    const [downloadResearchApi, { isLoading }] = useDownloadResearchMutation()

    const downloadResearch = async () => {
        try {
            const response = await downloadResearchApi(researchId).unwrap();
            // Check if response is a Blob
            if (response instanceof Blob) {
                const blob = response;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${name || "research"}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a); // Ensure cleanup
                window.URL.revokeObjectURL(url); // Revoke the object URL to free memory
            } else {
                console.error('Response is not a Blob:', response);
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    const onRemoveMediaHandler = (index: number, type: "video" | "image") => {
        setDocumentText(prevContent => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(prevContent, 'text/html');
            const medias = doc.getElementsByClassName(type);

            if (index >= 0 && index < medias.length) {
                medias[index].remove();
            }

            return doc.body.innerHTML;
        });
    };


    useEffect(() => {
        if (textRef.current) {
            const images = textRef.current.getElementsByClassName('image');
            Array.from(images).forEach((img, index) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'relative group mb-4';
                if (img.parentNode) img.parentNode.insertBefore(wrapper, img);
                wrapper.appendChild(img);

                img.className = 'cursor-pointer';

                const overlay = document.createElement('div');
                overlay.className = `absolute h-full top-0 left-0 flex justify-center items-center w-full bg-black bg-opacity-50 flex-col 
                                 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100`;

                const text = document.createElement('h1');
                text.className = 'text-white text-center text-xs';
                text.textContent = 'Click below button to remove image from document';

                const button = document.createElement('button');
                button.className = 'text-xs bg-red-500 text-white px-2 py-1 mt-2 rounded hover:bg-red-800 custom-remove-button';
                button.textContent = 'Remove';
                button.setAttribute('data-index', index.toString());
                button.onclick = (e) => {
                    e.stopPropagation();
                    onRemoveMediaHandler(index, "image");
                };

                overlay.appendChild(text);
                overlay.appendChild(button);
                wrapper.appendChild(overlay);
            });

            // Handle video elements
            const videos = textRef.current.getElementsByClassName('video');
            Array.from(videos).forEach((video, index) => {
                const cancelButton = document.createElement('img');
                cancelButton.src = 'https://res.cloudinary.com/dykwfe4cr/image/upload/v1721377805/multiply_yfothx.png';
                cancelButton.className = 'video-cancel';
                cancelButton.style.width = '15px';
                cancelButton.style.cursor = 'pointer';
                cancelButton.style.position = 'absolute';
                cancelButton.style.top = '0';
                cancelButton.style.right = '0';
                cancelButton.onclick = (e) => {
                    e.stopPropagation();
                    onRemoveMediaHandler(index, "video");
                };

                video.appendChild(cancelButton);
            });

        }
    }, [editedText, onRemoveMediaHandler]);

    useEffect(() => {
        updateHistory(text);
        setEditedText(text)
    }, [text]);

    const updateHistory = (newText: string) => {
        const updatedHistory = [...history.slice(0, currentHistoryIndex + 1), newText];
        setHistory(updatedHistory);
        setCurrentHistoryIndex(updatedHistory.length - 1);
        setDocumentText(newText);
    };

    const onRemoveToDocumentHandler = (selectedText: string) => {
        setDocumentText(prev => {
            const index = prev.indexOf(selectedText);
            if (index !== -1) {
                const newText = prev.slice(0, index) + prev.slice(index + selectedText.length);
                updateHistory(newText);
                return newText;
            }
            return prev;
        });
    };

    const undo = () => {
        if (currentHistoryIndex > 0) {
            const newIndex = currentHistoryIndex - 1;
            setCurrentHistoryIndex(newIndex);
            setDocumentText(history[newIndex]);
        }
    };

    const redo = () => {
        if (currentHistoryIndex < history.length - 1) {
            const newIndex = currentHistoryIndex + 1;
            setCurrentHistoryIndex(newIndex);
            setDocumentText(history[newIndex]);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();
                undo();
            }
            if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
                event.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [undo, redo]);

    const menuItems: MenuItem[] = [
        {
            content: (
                <>
                    <HiDocumentMinus size={20} className="mr-2" />
                    Remove from document
                </>
            ),
            onClick: (text: string) => onRemoveToDocumentHandler(text),
        },

    ];

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedTitle(event.target.value);
    };

    const handleTitleBlur = () => {
        if (name !== editedTitle) setName(undefined, editedTitle)
        setIsEditingTitle(false);
    };

    return (
        <div className="flex flex-col items-center justify-between bg-slate-100 rounded h-full p-2 relative">
            <div className="absolute top-2 right-2 flex">
                <MdOutlineUndo className='text-black cursor-pointer mr-2' onClick={undo} size={25} />
                <MdOutlineRedo className='text-black cursor-pointer mr-2' onClick={redo} size={25} />
            </div>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div className="flex flex-col justify-center items-center">
                        {isEditingTitle ? (
                            <Input
                                className="title-input"
                                value={editedTitle}
                                onChange={handleChange}
                                onBlur={handleTitleBlur}
                            />
                        ) : (
                            <h1 className='text-xl font-bold' onDoubleClick={() => setIsEditingTitle(true)}>{editedTitle}</h1>
                        )}
                        <TextSelectionContextMenu
                            menuItems={menuItems}
                            containerClassName="rounded-lg"
                            menuClassName="bg-white shadow-xl"
                            menuItemClassName="text-sm hover:bg-blue-50"
                        >
                            <div
                                ref={textRef}
                                className="mt-2 p-2 font-medium text-sm max:w-33vw overflow-x-auto h-[calc(85vh-100px)] scrollbar-custom"
                                dangerouslySetInnerHTML={{
                                    __html: editedText
                                }}
                            ></div>
                        </TextSelectionContextMenu>
                    </div>
                </ContextMenuTrigger >
                <ContextMenuContent>
                    <ContextMenuItem onClick={() => onRemoveToDocumentHandler(text)} className='cursor-pointer'>
                        <HiDocumentMinus size={20} className="mr-2" />
                        Remove from document
                    </ContextMenuItem>

                </ContextMenuContent>
            </ContextMenu >


            <Button className='w-full' onClick={downloadResearch} disabled={isLoading} loading={{ isLoading }}>
                <BiSolidDownload className='mr-2' size={20} />
                Download
            </Button>
        </div >
    );
};

export default Document;
