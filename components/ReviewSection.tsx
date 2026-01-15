
import React from 'react';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, XCircle } from 'lucide-react';
import { ContactRecord } from '../types';

interface ReviewSectionProps {
  selectedRecords: ContactRecord[];
  onRemove: (id: string) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ selectedRecords, onRemove }) => {
  const handleDownload = () => {
    // Prepare data for export: only name and phone as per requirements
    const exportData = selectedRecords.map(({ name, phone, address }) => ({
      'Name': name,
      'Phone Number': phone,
      'Address': address
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected List");

    // Generate and trigger download
    XLSX.writeFile(workbook, `Selected_Contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden border border-gray-100 rounded-xl shadow-sm">
        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">Phone</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {selectedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.phone}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onRemove(record.id)}
                      className="text-red-400 hover:text-red-600 transition-colors flex items-center justify-center w-full"
                      title="Uncheck this record"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-900 block">{selectedRecords.length} Items ready</span>
            <span className="text-xs text-gray-500">Format: Microsoft Excel (.xlsx)</span>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download Selected List
        </button>
      </div>
    </div>
  );
};
