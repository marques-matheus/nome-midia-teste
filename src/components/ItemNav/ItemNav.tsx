'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

type ItemNavProps = {
    active: boolean;
    text: string;
    href: string;
    icon?: React.ReactNode;
};

const ItemNav = ({ active, text, href, icon }: ItemNavProps) => {
    const [isActive, setIsActive] = useState(active || false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsActive(active || false);
        }
    }, [active]);

    const classes = isActive
        ? 'flex flex-row items-center p-2 text-black hover:text-slate-900 border-l-8 border-0 border-blue-400'
        : 'flex flex-row items-center p-2 text-black hover:border-l-8 hover:border-blue-400';

    return (
        <Link href={href} className={classes}>
            {icon}
            <span className="mx-1">{text}</span>
        </Link>
    );
};

export default ItemNav;
