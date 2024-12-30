import React from 'react';

export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {React.Children.map(children, child => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, { onClick: () => setIsOpen(!isOpen) });
        }
        if (child.type === DropdownMenuContent) {
          return isOpen ? child : null;
        }
        return child;
      })}
    </div>
  );
};

export const DropdownMenuTrigger = ({ children, onClick }) => {
  return React.cloneElement(children, { onClick });
};

export const DropdownMenuContent = ({ children, align = "end" }) => {
  const alignmentClasses = {
    start: "left-0",
    end: "right-0",
  };

  return (
    <div className={`absolute z-10 mt-1 ${alignmentClasses[align]} min-w-[140px] bg-white shadow-lg rounded-md border border-gray-200`}>
      {children}
    </div>
  );
};

export const DropdownMenuLabel = ({ children, className = "" }) => {
  return (
    <div className={`border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, className = "" }) => {
  return (
    <button
      className={`block w-full text-left ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
