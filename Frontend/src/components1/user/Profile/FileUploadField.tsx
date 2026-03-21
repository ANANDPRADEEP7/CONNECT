import { useRef, useState } from "react";
import { Upload, X, CheckCircle } from "lucide-react";

interface FileUploadFieldProps {
  label: string;
  accept?: string;
  onFileChange: (file: File | null) => void;
  error?: string;
}

const FileUploadField = ({ label, accept = "image/*,.pdf", onFileChange, error }: FileUploadFieldProps) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || null);
    onFileChange(file);
  };

  const handleRemove = () => {
    setFileName(null);
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-1">
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full bg-input border border-dashed border-border rounded-md px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-ring transition-colors"
      >
        {fileName ? (
          <div className="flex items-center gap-3 w-full">
            <CheckCircle size={16} className="text-green-400 shrink-0" />
            <span className="text-xs text-muted-foreground tracking-wide flex-1 truncate">{fileName}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Upload size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground tracking-widest uppercase">{label}</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      </div>
      {error && <p className="text-destructive text-xs pl-1">{error}</p>}
    </div>
  );
};

export default FileUploadField;
