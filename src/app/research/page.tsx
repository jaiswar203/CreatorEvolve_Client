import List from '@/components/Research/List'
import React from 'react'

const Page = () => {
  return (
    <>
      <div className="mb-10">
        <h1 className="md:text-3xl text-2xl font-bold text-primary">Research Wizard</h1>
        <p className="text-gray-500 text-sm font-medium">Research Wizard Streamline your content creation process with the Research Wizard. This tool swiftly gathers and organizes high-quality, relevant information, saving you valuable time. By ensuring access to well-researched content, the Research Wizard enhances the efficiency and quality of your videos, empowering creators to produce engaging, well-informed content effortlessly.</p>
      </div>
      <List />
    </>
  )
}

export default Page