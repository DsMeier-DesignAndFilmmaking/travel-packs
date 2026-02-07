interface InstallOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    cityName: string;
  }
  
  export function InstallOverlay({ isOpen, onClose, cityName }: InstallOverlayProps) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <div 
          className="bg-white w-full max-w-md rounded-[32px] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-1.5 bg-[#EBEBEB] rounded-full mx-auto mb-8" />
          
          <h3 className="text-2xl font-black tracking-tighter text-[#222222] mb-2 text-center">
            Add {cityName} to Mobile
          </h3>
          <p className="text-sm text-[#717171] text-center mb-8">
            Save this guide to your home screen for instant offline access.
          </p>
  
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F7F7F7] flex items-center justify-center font-bold">1</div>
              <p className="text-[14px] font-medium text-[#222222]">
                Tap the <span className="p-1 bg-[#F0F0F0] rounded">Share</span> button in your browser.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F7F7F7] flex items-center justify-center font-bold">2</div>
              <p className="text-[14px] font-medium text-[#222222]">
                Scroll down and select <span className="font-bold">"Add to Home Screen"</span>.
              </p>
            </div>
          </div>
  
          <button 
            onClick={onClose}
            className="w-full mt-10 py-4 bg-[#222222] text-white rounded-xl font-bold uppercase tracking-widest text-[11px]"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }