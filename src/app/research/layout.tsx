import React from 'react'

const Layout = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="md:p-4 flex flex-col">
            

            <>{children}</>
        </div>
    )
}

export default Layout