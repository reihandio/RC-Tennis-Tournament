import { useRef, useState } from 'react';
import {
  FileDown,
  FolderOpen,
  RotateCcw,
  Check,
} from 'lucide-react';

export default function Toolbar({ onExportJSON, onImportJSON, onReset }) {
  const fileInputRef = useRef(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onImportJSON(file);
    e.target.value = '';
  };

  const handleResetClick = () => {
    if (showResetConfirm) {
      onReset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 4000);
    }
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Save / Export JSON */}
      <button
        type="button"
        onClick={onExportJSON}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-[#8A9A86] hover:bg-[#E8ECE9]/50 active:bg-[#E8ECE9] transition-all"
        title="Save progress as JSON file"
      >
        <FileDown size={16} />
        <span className="hidden sm:inline">Save</span>
      </button>

      {/* Load / Import JSON */}
      <button
        type="button"
        onClick={handleImportClick}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-[#8A9A86] hover:bg-[#E8ECE9]/50 active:bg-[#E8ECE9] transition-all"
        title="Load progress from JSON file"
      >
        <FolderOpen size={16} />
        <span className="hidden sm:inline">Load</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Import tournament JSON file"
      />

      {/* Reset / New Tournament */}
      <button
        type="button"
        onClick={handleResetClick}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
          showResetConfirm
            ? 'bg-red-500 text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)]'
            : 'text-slate-500 hover:text-red-500 hover:bg-red-50 active:bg-red-100'
        }`}
        title={showResetConfirm ? 'Click again to confirm reset' : 'Start a new tournament'}
      >
        {showResetConfirm ? (
          <>
            <Check size={16} />
            <span className="hidden sm:inline">Confirm Reset</span>
          </>
        ) : (
          <>
            <RotateCcw size={16} />
            <span className="hidden sm:inline">New</span>
          </>
        )}
      </button>
    </div>
  );
}
