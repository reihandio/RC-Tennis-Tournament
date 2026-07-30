import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

export default function LogoUploader({ logo, onLogoUpload, onLogoRemove }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onLogoUpload(file);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Club / Tournament Logo
      </label>

      {logo.objectURL ? (
        <div className="relative inline-block group">
          <img
            src={logo.objectURL}
            alt="Club logo"
            className="h-20 max-w-[200px] object-contain border-2 border-[#E8ECE9] rounded-xl p-2 bg-white"
          />
          <button
            type="button"
            onClick={onLogoRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
            aria-label="Remove logo"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-[#DDE2DD] rounded-xl text-sm text-slate-500 hover:border-[#8A9A86] hover:text-[#8A9A86] transition-colors bg-[#FAF9F6] hover:bg-[#E8ECE9]/30"
        >
          <Upload size={16} />
          {logo.file ? logo.file.name : 'Upload Logo (optional)'}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload logo"
      />

      <p className="text-xs text-slate-400 mt-1">
        Appears on exported standings PNG
      </p>
    </div>
  );
}
