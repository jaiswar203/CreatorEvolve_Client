"use client"

import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { jwtDecode } from "jwt-decode"
import { useAppDispatch } from '@/redux/hook'
import { setUser } from '@/redux/slices/user'
import { useRouter } from 'next/navigation'

const Page = ({ }) => {
    const query = useSearchParams()
    const access_token = query.get("token")
    const auth_type = query.get("auth_type")
    const router = useRouter()

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (access_token) {
            const decodedData = jwtDecode(access_token)
            console.log({ decodedData,access_token })

            delete decodedData?.sub
            dispatch(setUser({ ...decodedData, access_token }))
            router.push("/")
        }
    }, [access_token, auth_type])
    return null
}

export default Page