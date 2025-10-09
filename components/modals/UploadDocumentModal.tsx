import React, { useState, useContext } from 'react';
import type { Research, Document, DocumentType } from '../../types';
import { AppContext } from '../../context/AppContext';
import { LanguageContext } from '../../context/LanguageContext';
import Modal from '../common/Modal';

interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    research: Research;
    onUploadComplete: (research: Research) => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose, research, onUploadComplete }) => {
    const { currentUser, showNotification } = useContext(AppContext);
    const { t } = useContext(LanguageContext);
    const [name, setName] = useState('');
    const [type, setType] = useState<DocumentType>('other');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            showNotification(t('notifications.docUploadSelectFile'), 'error');
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showNotification(t('notifications.docUploadSizeError'), 'error');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        // Mock Firebase Storage Upload
        const storagePath = `research/${research.id}/documents/${Date.now()}_${file.name}`;
        const uploadTask = new Promise<string>((resolve, reject) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setUploadProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    // This would be the downloadURL from Firebase Storage
                    resolve(`https://firebasestorage.googleapis.com/v0/b/mock-project.appspot.com/o/${encodeURIComponent(storagePath)}`);
                }
            }, 200);
        });

        try {
            const fileURL = await uploadTask;
            const newDocument: Document = {
                id: Date.now().toString(),
                name,
                type,
                description,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                fileURL,
                storagePath,
                uploadedBy: currentUser!.id,
                uploadedAt: new Date().toISOString()
            };

            const updatedResearch = {
                ...research,
                documents: [...(research.documents || []), newDocument]
            };
            
            onUploadComplete(updatedResearch);
            showNotification(t('notifications.docUploadSuccess'), 'success');
        } catch (error) {
            showNotification(t('notifications.docUploadError'), 'error');
        } finally {
            setIsUploading(false);
            onClose();
        }
    };

    const docTypes: DocumentType[] = ['proposal', 'report', 'publication', 'presentation', 'data', 'other'];
    const docTypeTranslations: Record<DocumentType, string> = {
        proposal: 'docTypeProposal',
        report: 'docTypeReport',
        publication: 'docTypePublication',
        presentation: 'docTypePresentation',
        data: 'docTypeData',
        other: 'docTypeOther'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('research.uploadTitle', { title: research.title.substring(0, 20) })} size="lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div><label className="label">{t('research.docName')}</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="input" required /></div>
                <div>
                    <label className="label">{t('research.docType')}</label>
                    <select value={type} onChange={e => setType(e.target.value as DocumentType)} className="input" required>
                        {docTypes.map(docType => <option key={docType} value={docType}>{t(`research.${docTypeTranslations[docType]}`)}</option>)}
                    </select>
                </div>
                <div><label className="label">{t('research.file')}</label><input type="file" onChange={handleFileChange} className="input" required/></div>
                <div><label className="label">{t('common.description')}</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input"></textarea></div>
                
                {isUploading && (
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-base font-medium text-blue-700">{t('notifications.uploading')}</span>
                      <span className="text-sm font-medium text-blue-700">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary" disabled={isUploading}>{t('common.cancel')}</button>
                    <button type="submit" className="btn-primary" disabled={isUploading}>
                      {isUploading ? `${t('notifications.uploading')}...` : t('common.upload')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default UploadDocumentModal;