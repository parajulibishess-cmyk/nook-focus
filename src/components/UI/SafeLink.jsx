import React from 'react';

const SafeLink = ({ href, children, className, onClick, isActive, isDeepFocus, allowedDomains = [] }) => {
    const handleClick = (e) => {
        if (isActive && isDeepFocus) {
            let targetDomain = "";
            try {
                if (href) targetDomain = new URL(href).hostname;
            } catch(e) { targetDomain = ""; }

            const isAllowed = allowedDomains.some(d => targetDomain.includes(d));
            
            if (!isAllowed) {
                e.preventDefault();
                alert("Link blocked by Deep Focus mode!");
                return;
            }
        }
        if (onClick) onClick(e);
    };

    return href ? (
        <a href={href} onClick={handleClick} className={className} target="_blank" rel="noreferrer">
            {children}
        </a>
    ) : (
        <div onClick={handleClick} className={className}>
            {children}
        </div>
    );
};
export default SafeLink;