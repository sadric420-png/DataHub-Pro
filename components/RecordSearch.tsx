
import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, Circle } from 'lucide-react';
import { ContactRecord } from '../types';

interface RecordSearchProps {
  records: ContactRecord[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export const RecordSearch: React.FC<RecordSearchProps> = ({ records, selectedIds, onToggle }) => {
  const [query, setQuery] = useState('');

  const filteredRecords = useMemo(() => {
    if (!query.trim()) return records.slice(0, 10); // Show first 10 by default
    const q = query.toLowerCase();
    return records.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.phone.toLowerCase().includes(q)
    );
  }, [records, query]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search by name or phone number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 shadow-sm"
        />
      </div>

      <div className="overflow-hidden border border-gray-100 rounded-xl shadow-sm">
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12 text-center border-b">Select</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">Phone</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.map((record) => {
                const isSelected = selectedIds.has(record.id);
                return (
                  <tr 
                    key={record.id} 
                    className={`hover:bg-indigo-50/30 transition-colors cursor-pointer group ${isSelected ? 'bg-indigo-50/50' : ''}`}
                    onClick={() => onToggle(record.id)}
                  >
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[200px]">{record.address}</td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {query.trim() === '' && records.length > 10 && (
        <p className="text-center text-xs text-gray-400 font-medium">
          Showing 10 of {records.length} records. Search to find specific entries.
        </p>
      )}
    </div>
  );
};
