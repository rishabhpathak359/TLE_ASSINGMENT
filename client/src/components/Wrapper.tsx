import React, { ReactNode } from "react";

interface WrapperProps {
  children: ReactNode;
  className?: string;
}

const Wrapper: React.FC<WrapperProps> = ({ children, className }) => {
  return (
    <div className={`w-full max-w-[1280px] mx-auto px-4 min-h-screen ${className || ""}`}>
      {children}
    </div>
  );
};

export default Wrapper;
