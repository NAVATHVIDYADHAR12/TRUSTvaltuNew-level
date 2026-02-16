
import React, { useState } from 'react';
import { Upload, File, Check, AlertCircle } from 'lucide-react';
import { unifiedStorage } from '../../lib/unified-storage';

const QuickUploadSection = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [price, setPrice] = useState(50);
    const [dragActive, setDragActive] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'saving' | 'success'>('idle');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);

        let file: File | null = null;
        if ('dataTransfer' in e) {
            file = e.dataTransfer.files[0];
        } else {
            file = (e.target as HTMLInputElement).files?.[0] || null;
        }

        if (file) {
            setSelectedFile(file);
            setUploadStatus('idle');
        }
    };

    const handleSaveToDB = async () => {
        if (!selectedFile) return;
        setUploadStatus('saving');

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const result = event.target?.result as string;

                let type: 'image' | 'video' | 'document' = 'document';
                if (selectedFile.type.startsWith('image')) type = 'image';
                else if (selectedFile.type.startsWith('video')) type = 'video';

                const newFile = {
                    id: crypto.randomUUID(),
                    name: selectedFile.name,
                    type: type,
                    src: result,
                    originalSrc: result, // In this quick mode, source is the original
                    date: new Date().toISOString(),
                    price: price,
                    category: 'market' as const,
                    watermarkSettings: {
                        text: 'Confidential',
                        opacity: 0.3,
                        rotation: -30,
                        isRepeated: true
                    }
                };

                await unifiedStorage.saveFile(newFile);
                setUploadStatus('success');
                setTimeout(() => {
                    setSelectedFile(null); // Reset after success
                    setUploadStatus('idle');
                    alert(`"${newFile.name}" Saved & Secured in Database! Client can now purchase it.`);
                }, 2000);
            };
            reader.readAsDataURL(selectedFile);
        } catch (error) {
            console.error(error);
            setUploadStatus('idle');
            alert('Upload failed.');
        }
    };

    return (
        <div className="mt-8 bg-[#111] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white">Quick Secure Upload</h3>
            </div>

            <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center text-center ${dragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 hover:border-white/20'}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileSelect}
            >
                <input
                    type="file"
                    id="quick-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,video/*,application/pdf,.doc,.docx,.ppt,.pptx"
                />

                {!selectedFile ? (
                    <>
                        <File className="w-10 h-10 text-gray-500 mb-4" />
                        <label htmlFor="quick-upload" className="cursor-pointer">
                            <span className="font-bold text-white hover:text-cyan-400 transition-colors">Click to Select File</span>
                            <span className="text-gray-500"> or drag and drop</span>
                        </label>
                        <p className="text-xs text-gray-600 mt-2">Supports Video, Audio, Images, PPT, Docs</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <Check className="w-10 h-10 text-green-500 mb-2" />
                        <p className="font-bold text-white max-w-xs truncate">{selectedFile.name}</p>
                        <p className="text-xs text-green-400 mt-1">Ready to Secure</p>
                        <button onClick={() => setSelectedFile(null)} className="text-xs text-red-400 mt-2 hover:underline">Change File</button>
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-400">Set Price ($):</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(parseInt(e.target.value))}
                        className="bg-black/40 border border-white/10 rounded px-3 py-1 text-white w-24 focus:outline-none focus:border-cyan-500"
                    />
                </div>

                {selectedFile && (
                    <button
                        onClick={handleSaveToDB}
                        disabled={uploadStatus === 'saving'}
                        className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${uploadStatus === 'success' ? 'bg-green-600 text-white' :
                            uploadStatus === 'saving' ? 'bg-gray-600 text-gray-300' :
                                'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                            }`}
                    >
                        {uploadStatus === 'saving' ? 'Encrypting...' : uploadStatus === 'success' ? 'Saved!' : 'Save & Secure'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuickUploadSection;
