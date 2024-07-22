import Research from '@/components/Research/Research'
import React from 'react'

const Page = ({ params }: { params: { id: string } }) => {
    return (
        <Research id={params.id} />
    )
}

export default Page