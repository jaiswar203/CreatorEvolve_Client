import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    children: ReactNode;
    className?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, children, className }) => {
    return (
        <div
            className={`fixed bg-white border border-gray-200 rounded-md shadow-lg z-50 ${className}`}
            style={{ top: y, left: x }}
        >
            {children}
        </div>
    );
};

export interface MenuItem {
    content: ReactNode;
    onClick: (selectedText: string) => void;
}

interface TextSelectionContextMenuProps {
    children: ReactNode;
    menuItems: MenuItem[];
    containerClassName?: string;
    menuClassName?: string;
    menuItemClassName?: string;
}

// ... (previous code for ContextMenu and interfaces remains the same)

const TextSelectionContextMenu: React.FC<TextSelectionContextMenuProps> = ({
    children,
    menuItems,
    containerClassName,
    menuClassName,
    menuItemClassName,
}) => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number, text: string } | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Create a temporary element to get the HTML content
            const tempElement = document.createElement('div');
            tempElement.appendChild(range.cloneContents());
            const selectedHtml = tempElement.innerHTML;

            setContextMenu({
                x: rect.left + rect.width / 2,
                y: rect.bottom + window.scrollY,
                text: selectedHtml
            });
        } else {
            setContextMenu(null);
        }
    };

    const handleClick = (event: MouseEvent) => {
        if (contextMenu && ref.current && !ref.current.contains(event.target as Node)) {
            setContextMenu(null);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClick);
        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    return (
        <>
            <div
                ref={ref}
                onMouseUp={handleMouseUp}
                className={`select-text ${containerClassName}`}
            >
                {children}
            </div>
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    className={menuClassName}
                >
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                item.onClick(contextMenu.text);
                                setContextMenu(null);
                            }}
                            className={`cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-center ${menuItemClassName}`}
                        >
                            {item.content}
                        </div>
                    ))}
                </ContextMenu>
            )}
        </>
    );
};

export default TextSelectionContextMenu;