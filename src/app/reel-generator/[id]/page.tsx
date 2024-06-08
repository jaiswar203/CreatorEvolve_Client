import DetailPage from '@/components/reel-generator/DetailPage';
import React from 'react';

const Page = async ({params}:{params:{id:string}}) => {
    
    return (
        <DetailPage id={params.id} />
    );
};

export default Page;
