
import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ContactRecord } from '../types';

interface DataUploaderProps {
  onDataLoad: (data: ContactRecord[]) => void;
}

export const DataUploader: React.FC<DataUploaderProps> = ({ onDataLoad }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const fileName = file.name.toLowerCase();
      let records: ContactRecord[] = [];

      if (fileName.endsWith('.csv')) {
        records = await parseCSV(file);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        records = await parseExcel(file);
      } else {
        throw new Error('Unsupported file format. Please use .csv or .xlsx');
      }

      if (records.length === 0) {
        throw new Error('No records could be extracted. Please check if the file has data in the first few columns.');
      }

      onDataLoad(records);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.message || 'Error processing file');
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (file: File): Promise<ContactRecord[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const mapped = mapToRecords(results.data as any[]);
          resolve(mapped);
        },
        error: (err) => reject(err),
      });
    });
  };

  const parseExcel = async (file: File): Promise<ContactRecord[]> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // We get the data as an array of arrays first to be more flexible with headers
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (rawRows.length < 1) return [];

    // Check if the first row looks like headers or data
    const headers = rawRows[0].map(h => String(h || '').trim());
    const dataRows = rawRows.slice(1);

    // If headers exist, try to map them. Otherwise, treat row 0 as data if it has no text-like headers.
    return mapToRecordsFromArrays(headers, dataRows);
  };

  // Improved mapping that handles both object-based (CSV) and array-based (Excel) data
  const mapToRecordsFromArrays = (headers: string[], rows: any[][]): ContactRecord[] => {
    // Column indices
    let nameIdx = headers.findIndex(h => /name|full/i.test(h));
    let phoneIdx = headers.findIndex(h => /phone|mobile|contact|number/i.test(h));
    let addrIdx = headers.findIndex(h => /address|location|addr/i.test(h));

    // Fallback: if we can't find by name, just use columns 0, 1, 2
    if (nameIdx === -1) nameIdx = 0;
    if (phoneIdx === -1) phoneIdx = 1;
    if (addrIdx === -1) addrIdx = 2;

    return rows
      .filter(row => row.length > 0 && (row[nameIdx] || row[phoneIdx])) // Filter empty rows
      .map((row, index) => ({
        id: `rec-${index}-${Date.now()}`,
        name: String(row[nameIdx] || 'N/A').trim(),
        phone: String(row[phoneIdx] || 'N/A').trim(),
        address: String(row[addrIdx] || 'N/A').trim(),
      }));
  };

  const mapToRecords = (rawData: any[]): ContactRecord[] => {
    if (rawData.length === 0) return [];
    
    // Convert objects to arrays for the robust mapper
    const headers = Object.keys(rawData[0]);
    const rows = rawData.map(obj => headers.map(h => obj[h]));
    return mapToRecordsFromArrays(headers, rows);
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-xl p-10 transition-all text-center flex flex-col items-center justify-center cursor-pointer
          ${file ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300 bg-gray-50/50 hover:bg-gray-100/50'}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls"
          className="hidden"
        />
        <Upload className={`w-12 h-12 mb-4 ${file ? 'text-indigo-600' : 'text-gray-400'}`} />
        <h3 className="text-lg font-medium text-gray-900">
          {file ? file.name : 'Excel or CSV file select karein'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {file ? `${(file.size / 1024).toFixed(1)} KB` : '.xlsx aur .csv files support ki jati hain'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={processFile}
          disabled={!file || loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>Submit Data</>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Error: {error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Data successfully load ho gaya hai!</span>
        </div>
      )}
    </div>
  );
};
