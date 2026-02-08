import { UploadCloud, CheckCircle2, FileText } from "lucide-react";

const FileInputCustom = ({ label, onChange, fileName }) => (
  <div className="flex flex-col space-y-2">
    <label className="text-xs text-secondary font-medium mr-1">{label}</label>
    <label className="relative flex items-center justify-center border-2 border-dashed border-gray-600 rounded-2xl p-4 cursor-pointer hover:border-primary hover:bg-[#1e293b] transition-all group">
      <input 
        type="file" 
        className="hidden" 
        onChange={onChange} 
        accept="image/*"
        required 
      />
      
      <div className="text-center">
        {fileName ? (
          <div className="flex flex-col items-center text-primary font-bold animate-in zoom-in duration-300">
            <CheckCircle2 size={24} className="mb-1" />
            <span className="text-[10px]">تم الاختيار ✨</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-secondary group-hover:text-primary transition-colors">
            <UploadCloud size={24} className="mb-1" />
            <span className="text-[10px]">اضغط للرفع</span>
          </div>
        )}
      </div>
    </label>

    {/* 🛡️ حماية: نتأكد إن fileName موجود وإن عنده خاصية name */}
    {fileName && fileName.name ? (
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <FileText size={12} className="text-gray-500" />
        <p className="text-[10px] text-gray-400 truncate max-w-[120px]">
          {fileName.name}
        </p>
      </div>
    ) : null}
  </div>
);

export default FileInputCustom;