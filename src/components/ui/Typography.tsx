/**
 * EditorialLabel - Global style for bold metadata headers
 */
export const EditorialLabel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <span 
      className={`block text-[10px] uppercase tracking-[0.2em] text-[#717171] mb-1 ${className}`}
      style={{ 
        fontWeight: 900, 
        WebkitTextStroke: '0.5px #717171', 
        WebkitFontSmoothing: 'auto' 
      }}
    >
      {children}
    </span>
  );