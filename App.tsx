
import React, { useState, useMemo, useCallback } from 'react';
import { Layout, FileText, Search, ListCheck, Download, Trash2, Github } from 'lucide-react';
import { DataUploader } from './components/DataUploader';
import { RecordSearch } from './components/RecordSearch';
import { ReviewSection } from './components/ReviewSection';
import { ConfirmModal } from './components/ConfirmModal';
import { ContactRecord } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<ContactRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Handle data submission from the uploader
  const handleDataLoad = useCallback((newData: ContactRecord[]) => {
    setData(newData);
    setSelectedIds(new Set()); // Reset selections on new file load
  }, []);

  // Handle selection toggling
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Trigger custom confirmation modal
  const openClearConfirmation = () => {
    if (selectedIds.size === 0) return;
    setIsConfirmModalOpen(true);
  };

  const confirmClearSelections = () => {
    setSelectedIds(new Set());
  };

  const selectedRecords = useMemo(() => {
    return data.filter((record) => selectedIds.has(record.id));
  }, [data, selectedIds]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">DataHub <span className="text-indigo-600">Pro</span></h1>
          </div>
          <div className="flex items-center gap-4">
             {data.length > 0 && (
               <button 
                onClick={openClearConfirmation}
                disabled={selectedIds.size === 0}
                className={`text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  selectedIds.size > 0 
                    ? 'text-red-600 hover:bg-red-50 cursor-pointer active:scale-95' 
                    : 'text-gray-300 cursor-not-allowed opacity-50'
                }`}
               >
                 <Trash2 className="w-4 h-4" />
                 Clear All Selections
               </button>
             )}
             <div className="h-6 w-[1px] bg-gray-200 hidden sm:block"></div>
             <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors hidden sm:block">
               <Github className="w-5 h-5" />
             </a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-12">
        {/* Step 1: File Upload */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Step 1: Upload Records</h2>
              <p className="text-sm text-gray-500">Apni .xlsx ya .csv file upload karein</p>
            </div>
          </div>
          <DataUploader onDataLoad={handleDataLoad} />
        </section>

        {/* Step 2: Search & Selection Logic */}
        {data.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Search className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Step 2: Search & Select</h2>
                <p className="text-sm text-gray-500">Contacts ko search karein aur select karein</p>
              </div>
            </div>
            <RecordSearch 
              records={data} 
              selectedIds={selectedIds} 
              onToggle={toggleSelection} 
            />
          </section>
        )}

        {/* Floating Selected Counter */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-8 right-8 z-40 pointer-events-none">
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <ListCheck className="w-5 h-5" />
              <span className="font-bold">{selectedIds.size} Selected</span>
            </div>
          </div>
        )}

        {/* Step 3: Review & Download */}
        {selectedRecords.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Download className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Step 3: Review & Export</h2>
                <p className="text-sm text-gray-500">Selected list ko check karein aur Excel download karein</p>
              </div>
            </div>
            <ReviewSection 
              selectedRecords={selectedRecords} 
              onRemove={toggleSelection}
            />
          </section>
        )}

        {/* Empty State */}
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-50 p-8 rounded-full mb-6 border border-gray-100">
              <FileText className="w-16 h-16 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No records loaded</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Shuru karne ke liye upar di gayi section se CSV ya Excel file upload karein.</p>
          </div>
        )}
      </main>

      {/* Custom Confirmation Modal */}
      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmClearSelections}
        title="Clear Selection?"
        message="Kya aap sabhi selected contacts ko unchecked karna chahte hain? Isse Step 3 ki list clear ho jayegi."
      />

      <footer className="bg-white border-t py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400 font-medium">Professional Data Management Suite &bull; Built with React & Tailwind</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
