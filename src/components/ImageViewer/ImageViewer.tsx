import React, { useState } from 'react'
import { Separator } from '../ui/separator'
import { TbExternalLink } from "react-icons/tb"

interface IProps {
    images: { context: string, title: string, thumbnail: string, link: string }[],
    selectedIndex: number
}

// use this componet with Dialog only, its intend is to serve images in full view
const ImageViewer: React.FC<IProps> = ({ images, selectedIndex = 0 }) => {
    const [imgIndex, setImgIndex] = useState(selectedIndex)

    const imagesLen = images.length

    const halfLen = Math.round(imagesLen / 2) - (imagesLen % 2 !== 0 ? 1 : 0)

    const imagesArr1 = images.slice(0, halfLen)
    const imagesArr2 = images.slice(halfLen)


    return (
        <div className="h-screen">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl text-white font-semibold">{images[imgIndex].title}</h1>

                <a className="border-2 border-white mr-10 rounded flex justify-between items-start py-1 px-4 cursor-pointer hover:bg-black transition" target='_blank' href={images[imgIndex].context}>
                    <p className='text-white text-base mr-1'>Source</p>
                    <TbExternalLink size={15} className='text-white' />
                </a>
            </div>
            <Separator className='w-full my-4' />
            <div className="flex  justify-between">
                <div className="  w-full">
                    <div className="col-span-7 flex h-full w-full select-none items-center justify-center py-md pl-lg">
                        <img className='max-w-96' src={images[imgIndex].link} alt="" />
                    </div>
                </div>
                <div className="flex h-[calc(100vh-100px)] overflow-y-auto justify-between">
                    <div className="mr-2 w-full">
                        {
                            imagesArr1.map((image, index) => (
                                <div className={`mb-2 cursor-pointer ${imgIndex === index ? "border-2 border-white" : ""}`} onClick={() => setImgIndex(index)}>
                                    <img src={image.link} className='w-96' alt="" />
                                </div>
                            ))
                        }
                    </div>
                    <div className=" w-full">
                        {
                            imagesArr2.map((image, index) => (
                                <div className={`mb-2 cursor-pointer ${imgIndex === (halfLen + index) ? "border-2 border-white" : ""}`} onClick={() => setImgIndex(halfLen + index)}>
                                    <img src={image.link} className='w-96' alt="" />
                                </div>
                            ))
                        }
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ImageViewer