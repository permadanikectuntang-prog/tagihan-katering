import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { Katering, Pemesanan, Pembayaran, PengaturanOrganisasi } from '../../types';
import { generateMonthlyReport } from '../../utils/calculations';
import { exportMonthlyReportToExcel } from '../../utils/excelExport';
import { BULAN_INDONESIA, formatRupiah } from '../../utils/formatters';
import { PrintableReport } from './PrintableReport';

interface LaporanViewProps {
  kateringList: Katering[];
  pemesananList: Pemesanan[];
  pembayaranList: Pembayaran[];
  pengaturan: PengaturanOrganisasi;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  kateringList,
  pemesananList,
  pembayaranList,
  pengaturan,
}) => {
  const today = new Date();
  const [selectedBulan, setSelectedBulan] = useState(today.getMonth() + 1); // 1-12
  const [selectedTahun, setSelectedTahun] = useState(today.getFullYear());
  const [selectedKatering, setSelectedKatering] = useState('all');

  // Generate Report Object
  const report = useMemo(() => {
    return generateMonthlyReport(
      kateringList,
      pemesananList,
      pembayaranList,
      selectedBulan,
      selectedTahun,
      selectedKatering
    );
  }, [kateringList, pemesananList, pembayaranList, selectedBulan, selectedTahun, selectedKatering]);

  // Handle Excel Export
  const handleDownloadExcel = () => {
    exportMonthlyReportToExcel(report, pengaturan);
  };

  // Handle PDF / Print
  const handlePrint = () => {
    window.print();
  };

  const namaBulan = BULAN_INDONESIA[selectedBulan - 1];

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Laporan Keuangan Bulanan Katering
            </h2>
            <p className="text-xs text-slate-500">
              Laporan resmi arus utang, pemesanan, realisasi pembayaran, dan saldo akhir bulan
            </p>
          </div>

          {/* Action Buttons: Excel & PDF */}
          <div className="grid grid-cols-1 sm:flex sm:items-center gap-2.5">
            <button
              onClick={handleDownloadExcel}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Download Excel (.xlsx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / Simpan PDF (A4)</span>
            </button>
          </div>
        </div>

        {/* Filter Configuration Card */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          {/* Bulan */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Bulan</label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
            >
              {BULAN_INDONESIA.map((b, idx) => (
                <option key={b} value={idx + 1}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Tahun</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
            >
              {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Katering Filter */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Pilih Rekanan Katering
            </label>
            <select
              value={selectedKatering}
              onChange={(e) => setSelectedKatering(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
            >
              <option value="all">Seluruh Rekanan Katering (Konsolidasi)</option>
              {kateringList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama} ({k.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Financial Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Saldo Awal Bulan
            </span>
            <span className="text-base font-bold font-mono text-slate-800">
              {formatRupiah(report.saldoAwal)}
            </span>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 shadow-2xs">
            <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block">
              + Pemesanan Bulan Ini
            </span>
            <span className="text-base font-bold font-mono text-blue-900">
              {formatRupiah(report.totalPemesanan)}
            </span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-2xs">
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
              - Pembayaran Bulan Ini
            </span>
            <span className="text-base font-bold font-mono text-emerald-900">
              {formatRupiah(report.totalPembayaran)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-300 bg-slate-900 p-3.5 text-white shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              = Saldo Akhir Bulan
            </span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {formatRupiah(report.saldoAkhir)}
            </span>
          </div>
        </div>
      </div>

      {/* Official Printable Report Container */}
      <div className="pt-2">
        <PrintableReport report={report} pengaturan={pengaturan} />
      </div>
    </div>
  );
};
