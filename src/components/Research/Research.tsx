"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import Document from './Document'
import ChatBox from './ChatBox'
import { useGetResearchByIdQuery, useUpdateDocumentByIdMutation } from '@/redux/api/research'
import { Button } from '../ui/button'
import { TiArrowBack } from "react-icons/ti";
import { useRouter } from 'next/navigation'

// Custom debounce function
export const useDebounce = (func: (...args: any[]) => void, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedFunc = useCallback((...args: any[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            func(...args);
        }, delay);
    }, [func, delay]);

    return debouncedFunc;
};

const Research = ({ id }: { id: string }) => {
    const { data, refetch } = useGetResearchByIdQuery(id)
    const [documentText, setDocumentText] = useState<string>("")
    const [initialDocumentText, setInitialDocumentText] = useState<string>("")

    const [updateDocumentByIdApi] = useUpdateDocumentByIdMutation()

    const router = useRouter()

    useEffect(() => {
        refetch()
    }, [refetch])

    const updateDocument = useCallback(async (newText?: string, name?: string) => {
        try {
            const payload: { document?: string, name?: string } = {}
            if (newText && newText !== initialDocumentText) {
                payload["document"] = newText
            }

            if (name) payload["name"] = name

            if (Object.keys(payload).length > 0) {
                await updateDocumentByIdApi({ id, body: payload }).unwrap()
                refetch()
            }
        } catch (error) {
            console.error('Failed to update document:', error)
        }
    }, [id, updateDocumentByIdApi, refetch, initialDocumentText])

    const debouncedUpdateDocument = useDebounce(updateDocument, 500)

    useEffect(() => {
        if (documentText && documentText !== initialDocumentText) {
            debouncedUpdateDocument(documentText)
        }
    }, [documentText, debouncedUpdateDocument, initialDocumentText])

    useEffect(() => {
        setDocumentText(data?.data?.document)
        setInitialDocumentText(data?.data?.document)
    }, [data])

    if (!data?.data) return null

    return (
        <>
            <Button className="w-44" onClick={() => router.push("/research")}>
                <TiArrowBack size={20} className='mr-2' />
                <p>Back to research</p>
            </Button>
            <div className=" bg-gray-100 mt-3">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel className='w-1/2'>
                        <ChatBox id={data.data.chat_id} chat={data.data.chat.messages} refetch={refetch} setDocumentText={setDocumentText} documentText={documentText} />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel className='overflow-auto' minSize={35} maxSize={40}>
                        <Document name={data.data?.name} text={documentText} setDocumentText={setDocumentText} researchId={id} setName={updateDocument} />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </>
    )
}

export default Research