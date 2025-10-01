// Konten dari App.tsx dan index.tsx digabung menjadi satu file.
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GoogleGenAI, Type } from "@google/genai";

// Mendaftarkan komponen Chart.js
Chart.register(...registerables);
Chart.register(ChartDataLabels);

// --- DEFINISI DATA ---

const csvData_main = `pemda,lokasi_rdf,rdf_2024,rdf_2025,latitude,longitude,status,tahun_operasi
Pemkab. Cilacap,"Jeruk Legi RDF Plant",15063.82,13686.68,-7.682,109.023,Beroperasi,2020
"Pemprov. DKI Jakarta","RDF & LM Bantargebang",2781.14,436.33,-6.32,106.96,Beroperasi,2024
"Pemkab. Banyumas","BLE/BIJ & TPST Koperasi RSA",10047.0,382.52,-7.50,109.25,Beroperasi,2021
"Pemkab Sleman","TPST Tamanmartani, Sendangsari, Donokerto",4393.41,672.7,-7.7667,110.4667,Beroperasi,"2024-2025"
"Pemkab. Bantul","TPST Argodadi & Modalan",355.46,417.62,-7.8833,110.2667,Beroperasi,2024
"Pemkot Yogyakarta","TPST Nitikan & Kranon",153.108,138.52,-7.8167,110.3667,Beroperasi,"2024-2025"
"Pemkab. Jembrana","TPA Jembrana (Minning)",12.0,0.0,-8.3667,114.6167,Rencana,2025
"Pemkab. Sumenep","TPST Batuan Sumenep",0.0,0.0,-7.0667,113.8333,Rencana,2025
"Pemkot. Tangerang","TPST Rawakucing",150.0,0.0,-6.16,106.63,Beroperasi,2025
"Pemkab. Karawang","TPST Mekarjati & Jayakerta",0.0,0.0,-6.3,107.3,Rencana,2025
"Pemkab. Purwakarta","TPST Purwakarta",0.0,0.0,-6.55,107.45,Rencana,2025
"Pemkab. Banyuwangi","TPST Balak",0.0,0.0,-8.2167,114.3667,Rencana,2025
"Pura Group","Private Sector",0.0,0.0,-6.71,110.85,Rencana,2025
"Pemprov. Aceh","RDF Blang Bintang",0.0,0.0,5.5233,95.4244,Rencana,2026
"Pemkab. Temanggung","TPST Sanggrahan",0.0,0.0,-7.3167,110.1833,Rencana,2026
"Pemkab. Wonosobo","TPST Wonorejo",0.0,0.0,-7.3667,109.9,Rencana,2026
"Pemkab. Gunung Kidul","TPST Wukirsari",0.0,0.0,-7.9667,110.6,Rencana,2026
"Pemkab. Magelang","TPST Pasuruhan",0.0,0.0,-7.6167,110.2167,Rencana,2025
"Pemkot. Depok","Prospek RDF",0.0,0.0,-6.40,106.82,Prospek,TBD
"Pemkab. Subang","Prospek RDF",0.0,0.0,-6.57,107.76,Prospek,TBD
"Pemkab. Malang","Prospek RDF",0.0,0.0,-7.98,112.62,Prospek,TBD
"Mekabox International","Private Sector",0.0,0.0,-7.25,112.75,Prospek,TBD
"Pemkot. Lhokseumawe","Prospek RDF",0.0,0.0,5.18,97.15,Prospek,TBD`;

const csvData_partnerships = `pemda,contact_person,email,phone_number,agreement_date
Pemkab. Cilacap,"Budi Santoso","budi.s@cilacapkab.go.id","+62 812-3456-7890","2019-05-15"
Pemprov. DKI Jakarta,"Citra Lestari","citra.l@jakarta.go.id","+62 813-4567-8901","2022-11-20"
Pemkab. Banyumas,"Agus Wijoyo","agus.w@banyumaskab.go.id","+62 814-5678-9012","2020-02-10"
Pemkab Sleman,"Dewi Anggraini","dewi.a@slemankab.go.id","+62 815-6789-0123","2023-01-30"
Pemkab. Bantul,"Eko Prasetyo","eko.p@bantulkab.go.id","+62 816-7890-1234","2023-08-01"
Pemkot Yogyakarta,"Fitriani Hartono","fitriani.h@jogjakota.go.id","+62 817-8901-2345","2023-09-15"
Pemkab. Jembrana,"Gede Wirawan","gede.w@jembranakab.go.id","+62 818-9012-3456","2024-03-22"
Pemkab. Sumenep,"Hadi Mulyono","hadi.m@sumenepkab.go.id","+62 819-0123-4567","2024-06-11"
Pemkot. Tangerang,"Indah Permata","indah.p@tangerangkota.go.id","+62 821-1234-5678","2024-01-05"
Pemkab. Karawang,"Joko Susilo","joko.s@karawangkab.go.id","+62 822-2345-6789","2024-07-18"
Pemkab. Purwakarta,"Kartika Sari","kartika.s@purwakartakab.go.id","+62 823-3456-7890","2024-08-02"
Pemkab. Banyuwangi,"Lia Handayani","lia.h@banyuwangikab.go.id","+62 852-4567-8901","2024-05-19"
Pura Group,"Mega Wati","mega.w@puragroup.com","+62 853-5678-9012","2024-09-01"
Pemprov. Aceh,"Nadia Fauziah","nadia.f@acehprov.go.id","+62 855-6789-0123","2025-02-14"
Pemkab. Temanggung,"Omar Abdullah","omar.a@temanggungkab.go.id","+62 856-7890-1234","2025-03-10"
Pemkab. Wonosobo,"Putri Rahayu","putri.r@wonosobokab.go.id","+62 857-8901-2345","2025-04-05"
Pemkab. Gunung Kidul,"Rian Firmansyah","rian.f@gunungkidulkab.go.id","+62 858-9012-3456","2025-01-20"
Pemkab. Magelang,"Siti Aminah","siti.a@magelangkab.go.id","+62 859-0123-4567","2024-11-30"
Pemkot. Depok,"Taufik Hidayat","taufik.h@depok.go.id","+62 877-1234-5678","2025-06-15"
Pemkab. Subang,"Umar Said","umar.s@subangkab.go.id","+62 878-2345-6789","2025-07-21"
Pemkab. Malang,"Vina Lestari","vina.l@malangkab.go.id","+62 896-3456-7890","2025-08-01"
Mekabox International,"Wahyu Nugroho","wahyu.n@mekabox.com","+62 897-4567-8901","2025-09-12"
Pemkot. Lhokseumawe,"Yulia Puspita","yulia.p@lhokseumawekota.go.id","+62 898-5678-9012","2025-10-01"`;

// --- BARU --- Data Sintetis Risiko, Biaya, dan Kontrak
const riskCostContractData: { [key: string]: { opRisk: number; qualRisk: number; expiry: string; } } = {
    "Pemkab. Cilacap": { opRisk: 2, qualRisk: 2, expiry: "2025-05-15" },
    "Pemprov. DKI Jakarta": { opRisk: 3, qualRisk: 4, expiry: "2026-11-20" },
    "Pemkab. Banyumas": { opRisk: 1, qualRisk: 3, expiry: "2026-02-10" },
    "Pemkab Sleman": { opRisk: 4, qualRisk: 4, expiry: "2027-01-30" },
    "Pemkab. Bantul": { opRisk: 3, qualRisk: 5, expiry: "2025-02-01" },
    "Pemkot Yogyakarta": { opRisk: 2, qualRisk: 3, expiry: "2025-09-15" },
    "Pemkab. Jembrana": { opRisk: 5, qualRisk: 2, expiry: "2028-03-22" },
    "Pemkab. Sumenep": { opRisk: 4, qualRisk: 4, expiry: "2028-06-11" },
    "Pemkot. Tangerang": { opRisk: 3, qualRisk: 3, expiry: "2028-01-05" },
    "Pemkab. Karawang": { opRisk: 2, qualRisk: 2, expiry: "2027-07-18" },
    "Pemkab. Purwakarta": { opRisk: 3, qualRisk: 3, expiry: "2027-08-02" },
    "Pemkab. Banyuwangi": { opRisk: 4, qualRisk: 3, expiry: "2027-05-19" },
    "Pura Group": { opRisk: 1, qualRisk: 1, expiry: "2029-09-01" },
    "Pemprov. Aceh": { opRisk: 5, qualRisk: 5, expiry: "2029-02-14" },
    "Pemkab. Temanggung": { opRisk: 3, qualRisk: 4, expiry: "2029-03-10" },
    "Pemkab. Wonosobo": { opRisk: 2, qualRisk: 2, expiry: "2029-04-05" },
    "Pemkab. Gunung Kidul": { opRisk: 4, qualRisk: 3, expiry: "2029-01-20" },
    "Pemkab. Magelang": { opRisk: 3, qualRisk: 3, expiry: "2028-11-30" },
    "Pemkot. Depok": { opRisk: 5, qualRisk: 4, expiry: "2028-06-15" },
    "Pemkab. Subang": { opRisk: 4, qualRisk: 4, expiry: "2028-07-21" },
    "Pemkab. Malang": { opRisk: 3, qualRisk: 3, expiry: "2028-08-01" },
    "Mekabox International": { opRisk: 2, qualRisk: 1, expiry: "2030-09-12" },
    "Pemkot. Lhokseumawe": { opRisk: 5, qualRisk: 5, expiry: "2030-10-01" }
};

const sbiFactories = [
    { name: 'Pabrik Cilacap', lat: -7.69, lon: 109.05, plantCode: 'CIL' },
    { name: 'Pabrik Narogong', lat: -6.45, lon: 106.91, plantCode: 'NAR' },
    { name: 'Pabrik Tuban', lat: -6.89, lon: 111.95, plantCode: 'TQ' },
    { name: 'Pabrik Lhoknga', lat: 5.47, lon: 95.25, plantCode: 'LHO' }
];

const allMonthlyData = {
    Cilacap: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
        budget: [2079.37, 2450.96, 1480.16, 1596.00, 3369.84, 2983.58, 2591.87],
        actual: [1587.82, 1487.52, 2900.46, 1749.74, 1997.42, 1430.58, 2533.14],
    },
    Narogong: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
        budget: [1800, 2100, 1300, 1400, 3000, 2600, 2300],
        actual: [1400, 1300, 2500, 1600, 1800, 1200, 2200],
    },
    Tuban: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
        budget: [2200, 2500, 1600, 1700, 3500, 3100, 2700],
        actual: [1700, 1600, 3100, 1900, 2100, 1600, 2600],
    },
    Lho: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
        budget: [1500, 1800, 1100, 1200, 2500, 2200, 1900],
        actual: [1100, 1000, 2000, 1300, 1500, 900, 1800],
    },
};

const operationalRemarks = `<strong>Operational Notes (July):</strong> Intake realization reached <strong>${allMonthlyData.Cilacap.actual[6].toLocaleString('id-ID')} Tons</strong>, or <strong>${((allMonthlyData.Cilacap.actual[6] / allMonthlyData.Cilacap.budget[6]) * 100).toFixed(1)}%</strong> of target. Performance varied due to operational constraints such as loader repairs and hotspots on the kiln shell earlier in the year, but showed significant improvement in July.`;

const qualityData = {
    labels: ['Jeruk Legi', 'Banyumas-BIJ', 'Sleman-Plastik', 'Yogyakarta', 'Bantul-Plastik'],
    gcv: [4758.47, 5419.99, 4257.24, 5441.83, 4405.38], // Kcal/kg
    moisture: [11.68, 18.79, 32.16, 25.89, 30.41], // %
};

const costAssumptions = {
    logisticsCostPerKmTon: 1500, // IDR
    processingCostPerTon: 75000, // IDR
    fossilFuelSavingsPerTon: 250000, // IDR
};

// --- DEFINISI TIPE ---
interface DashboardItem {
    id: number;
    pemda: string;
    lokasi_rdf: string;
    rdf_2024: number;
    rdf_2025: number;
    latitude: number;
    longitude: number;
    status: string;
    tahun_operasi: string;
    closestFactory?: { name: string; lat: number; lon: number; plantCode: string; };
    distance?: number;
    operational_risk_score: number;
    quality_risk_score: number;
    contract_expiry_date: string;
}

interface PartnershipInfo {
    pemda: string;
    contact_person: string;
    email: string;
    phone_number: string;
    agreement_date: string;
}

// --- WARNA GRAFIK ---
const chartColors = {
    light: {
        ticks: '#6b7280', grid: 'rgba(0, 0, 0, 0.1)', labels: '#374151', title: '#1f2937', datalabel: '#374151', datalabel_light: '#fff'
    }
};

// --- FUNGSI BANTUAN ---
const parseCSV = (csv: string): Omit<DashboardItem, 'operational_risk_score' | 'quality_risk_score' | 'contract_expiry_date'>[] => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map((line, index) => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const entry: any = { id: index };
        headers.forEach((header, i) => {
            const rawValue = values[i] ? values[i].replace(/"/g, '').trim() : '';
            if (['rdf_2024', 'rdf_2025', 'latitude', 'longitude'].includes(header)) {
                entry[header] = parseFloat(rawValue) || 0;
            } else {
                entry[header] = rawValue;
            }
        });
        return entry;
    });
};

const parsePartnershipCSV = (csv: string): PartnershipInfo[] => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const entry: any = {};
        headers.forEach((header, i) => {
            entry[header] = values[i] ? values[i].replace(/"/g, '').trim() : '';
        });
        return entry;
    });
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Jarak dalam km
};

const rawDashboardData = parseCSV(csvData_main);
const dashboardData: DashboardItem[] = rawDashboardData.map(item => {
    const extraData = riskCostContractData[item.pemda] || { opRisk: 3, qualRisk: 3, expiry: 'N/A' };
    return {
        ...item,
        operational_risk_score: extraData.opRisk,
        quality_risk_score: extraData.qualRisk,
        contract_expiry_date: extraData.expiry,
    };
});

dashboardData.forEach(item => {
    if (!item.latitude || !item.longitude) return;
    let closestFactory = null;
    let minDistance = Infinity;
    sbiFactories.forEach(factory => {
        const distance = getDistance(item.latitude, item.longitude, factory.lat, factory.lon);
        if (distance < minDistance) {
            minDistance = distance;
            closestFactory = factory;
        }
    });
    item.closestFactory = closestFactory || undefined;
    item.distance = minDistance;
});

const partnershipData: PartnershipInfo[] = parsePartnershipCSV(csvData_partnerships);

const combinedFullData = dashboardData.map(d => {
    const partnerInfo = partnershipData.find(p => p.pemda === d.pemda);
    return { ...d, ...partnerInfo };
});

// Komponen Header Tabel yang Dapat Diurutkan
const SortableHeader: React.FC<{
    columnKey: string;
    title: string;
    sortConfig: { key: string; direction: string } | null;
    requestSort: (key: string) => void;
}> = ({ columnKey, title, sortConfig, requestSort }) => {
    const isSorted = sortConfig?.key === columnKey;
    const Icon = () => {
        if (!isSorted) return <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
        if (sortConfig?.direction === 'ascending') return <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>;
        return <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
    };
    return (
        <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100" onClick={() => requestSort(columnKey)}>
            <div className="flex items-center gap-2">{title}<Icon /></div>
        </th>
    );
};
const BackToDashboardButton: React.FC<{ setView: (view: string) => void }> = ({ setView }) => (
    <button onClick={() => setView('dashboard')} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 000-10H6" /></svg>
        <span>Back to Dashboard</span>
    </button>
);


// --- KOMPONEN HALAMAN ANALISIS KUALITAS ---
const QualityAnalysisPage: React.FC<{ setView: (view: string) => void }> = ({ setView }) => {
    const chartsRef = useRef<{ [key: string]: Chart | null }>({});
    const currentChartColors = chartColors.light;

    const createChart = useCallback(<T,>(canvasId: string, config: ChartConfiguration) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (canvas) {
            if (chartsRef.current[canvasId]) {
                chartsRef.current[canvasId]?.destroy();
            }
            chartsRef.current[canvasId] = new Chart(canvas, config);
        }
    }, []);

    useEffect(() => {
        createChart('quality-chart-combined', {
            type: 'bar',
            data: {
                labels: qualityData.labels,
                datasets: [
                    { label: 'GCV (Kcal/kg)', data: qualityData.gcv, backgroundColor: 'rgba(75, 192, 192, 0.6)', yAxisID: 'y_gcv' },
                    { label: 'Moisture (%)', data: qualityData.moisture, backgroundColor: 'rgba(255, 159, 64, 0.6)', yAxisID: 'y_moisture' }
                ]
            },
            options: {
                scales: {
                    x: { ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } },
                    y_gcv: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'GCV (Kcal/kg)', color: currentChartColors.title }, ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } },
                    y_moisture: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Moisture (%)', color: currentChartColors.title }, grid: { drawOnChartArea: false }, ticks: { color: currentChartColors.ticks } }
                },
                plugins: { legend: { position: 'top', labels: { color: currentChartColors.labels } }, datalabels: { anchor: 'end', align: 'end', formatter: (v: number) => v.toLocaleString('id-ID'), color: currentChartColors.datalabel, font: { weight: 'bold' } } }
            }
        });

        createChart('quality-chart-gcv', {
            type: 'bar',
            data: { labels: qualityData.labels, datasets: [{ label: 'GCV (Kcal/kg)', data: qualityData.gcv, backgroundColor: 'rgba(75, 192, 192, 0.8)' }] },
            options: {
                indexAxis: 'y',
                scales: { 
                    x: { beginAtZero: true, title: { display: true, text: 'GCV (Kcal/kg)', color: currentChartColors.title }, ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } },
                    y: { ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } }
                },
                plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', formatter: (v: number) => v.toLocaleString('id-ID'), color: currentChartColors.datalabel, font: { weight: 'bold' } } }
            }
        });

        createChart('quality-chart-moisture', {
            type: 'bar',
            data: { labels: qualityData.labels, datasets: [{ label: 'Moisture (%)', data: qualityData.moisture, backgroundColor: 'rgba(255, 159, 64, 0.8)' }] },
            options: {
                indexAxis: 'y',
                scales: { 
                    x: { beginAtZero: true, suggestedMax: 50, title: { display: true, text: 'Moisture Content (%)', color: currentChartColors.title }, ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } },
                    y: { ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } }
                },
                plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', formatter: (v: number) => `${v.toFixed(2)}%`, color: currentChartColors.datalabel, font: { weight: 'bold' } } }
            }
        });

        return () => {
            Object.values(chartsRef.current).forEach(chart => (chart as Chart | null)?.destroy());
        };
    }, [createChart]);

    return (
        <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Detailed RDF Quality Analysis (July 2025)</h2>
                <BackToDashboardButton setView={setView} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-xl font-bold text-gray-800 mb-4">Gross Caloric Value (GCV) by Source</h3><canvas id="quality-chart-gcv"></canvas></div>
                <div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-xl font-bold text-gray-800 mb-4">Moisture Content by Source</h3><canvas id="quality-chart-moisture"></canvas></div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">GCV vs. Moisture Comparison</h3>
                <canvas id="quality-chart-combined"></canvas>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">RDF Quality Data</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-6 py-3">RDF Source</th><th scope="col" className="px-6 py-3 text-right">GCV (Kcal/kg)</th><th scope="col" className="px-6 py-3 text-right">Moisture (%)</th></tr></thead>
                        <tbody>
                            {qualityData.labels.map((label, index) => (
                                <tr key={label} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{label}</th>
                                    <td className="px-6 py-4 text-right">{qualityData.gcv[index].toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-right">{qualityData.moisture[index].toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

// --- BARU --- HALAMAN AI ADVISOR ---
const AIAdvisorPage: React.FC<{ setView: (view: string) => void }> = ({ setView }) => {
    const [messages, setMessages] = useState<{ sender: 'user' | 'ai' | 'system', text: string }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    const systemInstruction = `You are a helpful and expert data analyst for PT Solusi Bangun Indonesia Tbk. Your task is to answer questions about the provided RDF (Refuse-Derived Fuel) partnership data. The data is a JSON object containing a list of all partners with their performance, location, risk scores, and contact details. Analyze the data to answer the user's questions. Be concise and clear in your answers. Format your answers in simple markdown (e.g., use lists, bold text). Always answer in Bahasa Indonesia. Today's date is July 31, 2025. Data context: ${JSON.stringify(combinedFullData)}`;

    useEffect(() => {
        setMessages([{
            sender: 'ai',
            text: "Halo! Saya adalah asisten AI strategis Anda. Anda bisa bertanya apa saja tentang data kemitraan RDF. Silakan coba salah satu pertanyaan di bawah, atau ajukan pertanyaan Anda sendiri."
        }]);
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (messageText?: string) => {
        const query = messageText || userInput;
        if (!query.trim() || isLoading) return;

        setMessages(prev => [...prev, { sender: 'user', text: query }]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: query,
                config: { systemInstruction: systemInstruction }
            });

            const aiResponse = response.text;
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage = "Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.";
            setMessages(prev => [...prev, { sender: 'ai', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const examplePrompts = [
        "Siapa 5 mitra dengan kontribusi RDF tertinggi di 2025?",
        "Tampilkan mitra dengan risiko operasional tinggi (skor 4 atau 5).",
        "Buat ringkasan untuk Pemkab. Cilacap.",
        "Kontrak siapa saja yang akan berakhir dalam setahun ke depan?"
    ];

    return (
        <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>
                    Tanya AI (Ask the AI Advisor)
                </h2>
                <BackToDashboardButton setView={setView} />
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md h-[70vh] flex flex-col">
                <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-2xl rounded-2xl px-4 py-3 shadow ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                         <div className="flex justify-start">
                             <div className="max-w-xs md:max-w-md lg:max-w-2xl rounded-2xl px-4 py-3 shadow bg-gray-100 text-gray-800">
                                 <div className="flex items-center justify-center">
                                    <span className="text-sm mr-2">Menganalisis...</span>
                                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s] ml-1"></div>
                                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce ml-1"></div>
                                 </div>
                             </div>
                         </div>
                     )}
                     {messages.length === 1 && !isLoading && (
                         <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-3">Contoh pertanyaan:</p>
                            <div className="flex flex-wrap gap-2">
                                {examplePrompts.map(prompt => (
                                    <button key={prompt} onClick={() => handleSendMessage(prompt)} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded-full transition-colors">
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                         </div>
                     )}
                </div>
                <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ketik pertanyaan Anda di sini..."
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            disabled={isLoading}
                        />
                        <button onClick={() => handleSendMessage()} disabled={isLoading || !userInput.trim()} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};


// --- BARU --- HALAMAN ANALISIS BIAYA-MANFAAT ---
const CostBenefitAnalysisPage: React.FC<{ setView: (view: string) => void; data: DashboardItem[] }> = ({ setView, data }) => {
    
    type CalculatedData = DashboardItem & {
        totalLogisticsCost: number;
        totalProcessingCost: number;
        totalSavings: number;
        netBenefit: number;
    };
    
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>({ key: 'netBenefit', direction: 'descending' });

    const calculatedData = useMemo((): CalculatedData[] => {
        return data
            .filter(item => item.rdf_2025 > 0)
            .map(item => {
                const rdfSupply = item.rdf_2025;
                const distance = item.distance || 0;
                const totalLogisticsCost = distance * rdfSupply * costAssumptions.logisticsCostPerKmTon;
                const totalProcessingCost = rdfSupply * costAssumptions.processingCostPerTon;
                const totalSavings = rdfSupply * costAssumptions.fossilFuelSavingsPerTon;
                const netBenefit = totalSavings - totalLogisticsCost - totalProcessingCost;
                return { ...item, totalLogisticsCost, totalProcessingCost, totalSavings, netBenefit };
            });
    }, [data]);
    
    const sortedData = useMemo(() => {
        let sortableItems = [...calculatedData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = (a as any)[sortConfig.key];
                const bVal = (b as any)[sortConfig.key];
                if (aVal < bVal) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [calculatedData, sortConfig]);

    const requestSort = (key: string) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    return (
        <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Cost-Benefit Analysis (YTD 2025)</h2>
                <BackToDashboardButton setView={setView} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <SortableHeader columnKey="pemda" title="Partner" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader columnKey="rdf_2025" title="RDF Supply (Tons)" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader columnKey="totalLogisticsCost" title="Total Logistics Cost" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader columnKey="totalProcessingCost" title="Total Processing Cost" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader columnKey="totalSavings" title="Total Savings" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader columnKey="netBenefit" title="Net Benefit" sortConfig={sortConfig} requestSort={requestSort} />
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map(item => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.pemda}</th>
                                    <td className="px-6 py-4 text-right">{item.rdf_2025.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(item.totalLogisticsCost)}</td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(item.totalProcessingCost)}</td>
                                    <td className="px-6 py-4 text-right text-green-600">{formatCurrency(item.totalSavings)}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${item.netBenefit > 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(item.netBenefit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

// --- BARU --- HALAMAN PERAMALAN ---
const ForecastPage: React.FC<{ setView: (view: string) => void }> = ({ setView }) => {
    const chartRef = useRef<Chart | null>(null);
    const currentChartColors = chartColors.light;

    useEffect(() => {
        const historicalData = allMonthlyData.Cilacap.actual;
        const n = historicalData.length;
        const x = Array.from({ length: n }, (_, i) => i + 1);
        const y = historicalData;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
        const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const forecastMonths = ['Aug', 'Sep', 'Oct'];
        const forecastData = forecastMonths.map((_, i) => slope * (n + i + 1) + intercept);
        const forecastLabels = [...allMonthlyData.Cilacap.labels, ...forecastMonths];
        const combinedData = [...historicalData, ...forecastData];
        
        const canvas = document.getElementById('forecast-chart') as HTMLCanvasElement;
        if (canvas) {
            if (chartRef.current) chartRef.current.destroy();
            chartRef.current = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: forecastLabels,
                    datasets: [{
                        label: 'RDF Intake (Tons)',
                        data: combinedData,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        tension: 0.1,
                        pointBackgroundColor: (ctx) => (ctx.dataIndex < n ? 'rgb(54, 162, 235)' : 'rgb(255, 99, 132)'),
                        pointRadius: 5,
                        segment: {
                            borderColor: ctx => ctx.p1DataIndex < n -1 ? 'rgb(54, 162, 235)' : 'rgb(255, 99, 132)',
                            borderDash: ctx => ctx.p1DataIndex < n - 1 ? [] : [6, 6],
                        }
                    }]
                },
                options: {
                    plugins: { 
                        legend: { display: false },
                        title: { display: true, text: 'The dashed red line indicates forecasted data', color: currentChartColors.title }
                    },
                    scales: { 
                        y: { beginAtZero: true, title: { display: true, text: 'Tons', color: currentChartColors.title }, ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } },
                        x: { ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } }
                    }
                }
            });
        }
        return () => chartRef.current?.destroy();
    }, []);

    return (
         <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">RDF Supply Forecast (Cilacap Plant)</h2>
                <BackToDashboardButton setView={setView} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-gray-600 mb-4">This chart shows historical RDF intake data through July, and a forecast for the next three months based on a simple linear regression trend.</p>
                <canvas id="forecast-chart"></canvas>
            </div>
        </>
    );
};

// --- BARU --- HALAMAN PENILAIAN RISIKO ---
const RiskAssessmentPage: React.FC<{ setView: (view: string) => void; data: DashboardItem[] }> = ({ setView, data }) => {
    const chartRef = useRef<Chart | null>(null);
    const currentChartColors = chartColors.light;

    useEffect(() => {
        const highRiskData = data
            .filter(item => item.operational_risk_score + item.quality_risk_score >= 8)
            .map(item => ({
                x: item.operational_risk_score,
                y: item.quality_risk_score,
                label: item.pemda,
                r: 10 // Radius lebih besar untuk risiko tinggi
            }));

        const normalRiskData = data
            .filter(item => item.operational_risk_score + item.quality_risk_score < 8)
            .map(item => ({
                x: item.operational_risk_score,
                y: item.quality_risk_score,
                label: item.pemda,
                r: 6 // Radius standar
            }));

        const canvas = document.getElementById('risk-matrix-chart') as HTMLCanvasElement;
        if (canvas) {
            if (chartRef.current) chartRef.current.destroy();
            chartRef.current = new Chart(canvas, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: 'High Risk (Score >= 8)',
                            data: highRiskData,
                            backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        },
                        {
                            label: 'Other Partners',
                            data: normalRiskData,
                            backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        }
                    ]
                },
                options: {
                    scales: {
                        x: { beginAtZero: true, max: 5.5, title: { display: true, text: 'Operational Risk Score', color: currentChartColors.title }, ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } },
                        y: { beginAtZero: true, max: 5.5, title: { display: true, text: 'Quality Risk Score', color: currentChartColors.title }, ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } }
                    },
                    plugins: {
                        tooltip: { callbacks: { label: (ctx) => (ctx.raw as any).label || '' } },
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: currentChartColors.labels,
                            },
                        },
                    },
                    aspectRatio: 1
                }
            });
        }
        return () => chartRef.current?.destroy();
    }, [data, currentChartColors.labels, currentChartColors.grid, currentChartColors.ticks, currentChartColors.title]);


    const expiringSoonContracts = data
        .filter(item => {
            if (item.contract_expiry_date === 'N/A') return false;
            const expiryDate = new Date(item.contract_expiry_date);
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
            return expiryDate < sixMonthsFromNow;
        })
        .sort((a, b) => new Date(a.contract_expiry_date).getTime() - new Date(b.contract_expiry_date).getTime());

    return (
        <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Risk Assessment Dashboard</h2>
                <BackToDashboardButton setView={setView} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Partnership Risk Matrix</h3>
                    <p className="text-sm text-gray-600 mb-2">The top-right quadrant indicates partners with the highest combined risk.</p>
                    <canvas id="risk-matrix-chart"></canvas>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Contracts Expiring in 6 Months</h3>
                    {expiringSoonContracts.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {expiringSoonContracts.map(item => (
                                <li key={item.id} className="py-3 flex justify-between items-center">
                                    <span className="font-medium text-gray-800">{item.pemda}</span>
                                    <span className="text-sm text-red-600 font-semibold bg-red-100 px-2 py-1 rounded-full">{item.contract_expiry_date}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 mt-4">No contracts are expiring soon.</p>
                    )}
                </div>
            </div>
        </>
    );
};

// --- BARU --- HALAMAN DAMPAK LINGKUNGAN ---
const EnvironmentalImpactPage: React.FC<{ setView: (view: string) => void; data: DashboardItem[] }> = ({ setView, data }) => {
    const chartsRef = useRef<{ [key: string]: Chart | null }>({});
    const currentChartColors = chartColors.light;

    // Asumsi Dampak Lingkungan
    const CO2_REDUCTION_PER_TON_RDF = 1.8; // Ton CO2 yang dihemat per Ton RDF yang digunakan
    const MSW_TO_RDF_RATIO = 1.5; // Ton MSW yang dibutuhkan untuk menghasilkan 1 Ton RDF

    const calculatedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            mswDiverted2025: item.rdf_2025 * MSW_TO_RDF_RATIO,
            co2Reduction2025: item.rdf_2025 * CO2_REDUCTION_PER_TON_RDF,
        }));
    }, [data]);
    
    const totals = useMemo(() => {
        return calculatedData.reduce((acc, item) => {
            acc.totalRdf += item.rdf_2025;
            acc.totalMswDiverted += item.mswDiverted2025;
            acc.totalCo2Reduction += item.co2Reduction2025;
            return acc;
        }, { totalRdf: 0, totalMswDiverted: 0, totalCo2Reduction: 0 });
    }, [calculatedData]);

    const createChart = useCallback(<T,>(canvasId: string, config: ChartConfiguration) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (canvas) {
            if (chartsRef.current[canvasId]) {
                chartsRef.current[canvasId]?.destroy();
            }
            chartsRef.current[canvasId] = new Chart(canvas, config);
        }
    }, []);

    useEffect(() => {
        const top10Co2 = [...calculatedData].sort((a, b) => b.co2Reduction2025 - a.co2Reduction2025).slice(0, 10);
        const top10Msw = [...calculatedData].sort((a, b) => b.mswDiverted2025 - a.mswDiverted2025).slice(0, 10);

        createChart('co2-reduction-chart', {
            type: 'bar',
            data: {
                labels: top10Co2.map(d => d.pemda),
                datasets: [{
                    label: 'Penurunan CO₂ (Ton)',
                    data: top10Co2.map(d => d.co2Reduction2025),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', formatter: (v: number) => v.toLocaleString('id-ID', {maximumFractionDigits: 0}), color: currentChartColors.datalabel } },
                scales: { 
                    x: { beginAtZero: true, title: { display: true, text: 'Penurunan CO₂ (Ton)', color: currentChartColors.title }, ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } },
                    y: { ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } }
                }
            }
        });

        createChart('msw-diverted-chart', {
            type: 'bar',
            data: {
                labels: top10Msw.map(d => d.pemda),
                datasets: [{
                    label: 'Sampah TPA Terserap (Ton)',
                    data: top10Msw.map(d => d.mswDiverted2025),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', formatter: (v: number) => v.toLocaleString('id-ID', {maximumFractionDigits: 0}), color: currentChartColors.datalabel } },
                 scales: { 
                    x: { beginAtZero: true, title: { display: true, text: 'Sampah TPA Terserap (Ton)', color: currentChartColors.title }, ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } },
                    y: { ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } }
                }
            }
        });

        return () => {
            Object.values(chartsRef.current).forEach(chart => (chart as Chart | null)?.destroy());
        };
    }, [calculatedData, createChart, currentChartColors]);

    return (
        <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Analisis Dampak Lingkungan (YTD 2025)</h2>
                <BackToDashboardButton setView={setView} />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="kpi-card p-6 flex items-center"><div className="bg-green-100 text-green-600 p-4 rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0122 12c0 3-1 7-6.343 6.657z" /></svg></div><div><p className="text-gray-500 text-sm">Penurunan Emisi CO₂</p><p className="text-2xl font-bold text-gray-800">{totals.totalCo2Reduction.toLocaleString('id-ID', { maximumFractionDigits: 0 })} Ton</p></div></div>
                <div className="kpi-card p-6 flex items-center"><div className="bg-blue-100 text-blue-600 p-4 rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div><div><p className="text-gray-500 text-sm">Penyerapan Sampah dari TPA</p><p className="text-2xl font-bold text-gray-800">{totals.totalMswDiverted.toLocaleString('id-ID', { maximumFractionDigits: 0 })} Ton</p></div></div>
                <div className="kpi-card p-6 flex items-center"><div className="bg-yellow-100 text-yellow-600 p-4 rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div><div><p className="text-gray-500 text-sm">Total RDF Diproduksi</p><p className="text-2xl font-bold text-gray-800">{totals.totalRdf.toLocaleString('id-ID', { maximumFractionDigits: 0 })} Ton</p></div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-xl font-bold text-gray-800 mb-4">10 Kontributor Penurunan CO₂ Teratas</h3><canvas id="co2-reduction-chart"></canvas></div>
                <div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-xl font-bold text-gray-800 mb-4">10 Kontributor Penyerapan Sampah TPA Teratas</h3><canvas id="msw-diverted-chart"></canvas></div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Rincian Dampak per Mitra</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Mitra</th>
                                <th className="px-6 py-3 text-right">RDF 2025 (Ton)</th>
                                <th className="px-6 py-3 text-right">Estimasi Sampah TPA Terserap (Ton)</th>
                                <th className="px-6 py-3 text-right">Estimasi Penurunan CO₂ (Ton)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calculatedData.filter(item => item.rdf_2025 > 0).sort((a,b) => b.co2Reduction2025 - a.co2Reduction2025).map(item => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.pemda}</th>
                                    <td className="px-6 py-4 text-right">{item.rdf_2025.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-right">{item.mswDiverted2025.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</td>
                                    <td className="px-6 py-4 text-right">{item.co2Reduction2025.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

const AlertsComponent: React.FC<{ data: DashboardItem[]; setView: (view: string) => void }> = ({ data, setView }) => {
    const highRiskPartners = data.filter(p => p.operational_risk_score + p.quality_risk_score >= 8 && p.status === 'Beroperasi');
    const expiringSoon = data.filter(item => {
        if (item.contract_expiry_date === 'N/A') return false;
        const expiryDate = new Date(item.contract_expiry_date);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        return expiryDate < sixMonthsFromNow;
    });

    const alerts = [];
    if (expiringSoon.length > 0) {
        alerts.push({
            type: 'warning',
            message: `${expiringSoon.length} partnership contracts will expire within 6 months.`,
            details: expiringSoon.map(p => p.pemda).join(', '),
            action: () => setView('risk')
        });
    }
    if (highRiskPartners.length > 0) {
        alerts.push({
            type: 'danger',
            message: `${highRiskPartners.length} operating partners have a high combined risk score (>=8).`,
            details: highRiskPartners.map(p => p.pemda).join(', '),
            action: () => setView('risk')
        });
    }
    
    if (alerts.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Alert Center
            </h2>
            <div className="space-y-3">
                {alerts.map((alert, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-l-4 ${alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' : 'bg-red-50 border-red-400'}`}>
                        <p className={`font-semibold ${alert.type === 'warning' ? 'text-yellow-800' : 'text-red-800'}`}>{alert.message}</p>
                        <p className="text-sm text-gray-600">Affected partners: {alert.details}.</p>
                        <button onClick={alert.action} className="text-sm font-bold text-blue-600 hover:underline mt-1">View Details</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface DashboardContentProps {
    handleRefresh: () => void;
    isRefreshing: boolean;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    plantFilter: string;
    setPlantFilter: (value: string) => void;
    lokasiFilter: string;
    setLokasiFilter: (value: string) => void;
    tahunFilter: string;
    setTahunFilter: (value: string) => void;
    setCurrentPage: (updater: (page: number) => number) => void;
    uniqueStatus: string[];
    uniquePlants: string[];
    uniqueLokasi: string[];
    uniqueTahunOperasi: string[];
    dashboardData: DashboardItem[];
    totalRdf2024: number;
    totalRdf2025: number;
    setView: (view: string) => void;
    monthlyChartPlant: string;
    setMonthlyChartPlant: (value: string) => void;
    paginatedData: DashboardItem[];
    currentPage: number;
    totalPages: number;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
    handleRefresh, isRefreshing,
    statusFilter, setStatusFilter,
    plantFilter, setPlantFilter,
    lokasiFilter, setLokasiFilter,
    tahunFilter, setTahunFilter,
    setCurrentPage, uniqueStatus, uniquePlants,
    uniqueLokasi, uniqueTahunOperasi, dashboardData,
    totalRdf2024, totalRdf2025, setView,
    monthlyChartPlant, setMonthlyChartPlant,
    paginatedData, currentPage, totalPages
}) => (
    <>
        <header className="mb-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">RDF Partnership Dashboard</h1>
                    <p className="text-gray-500 mt-1">Data Visualization for PT Solusi Bangun Indonesia Tbk</p>
                </div>
            </div>
        </header>

        <AlertsComponent data={dashboardData} setView={setView} />

        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Dashboard Filters</h2>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isRefreshing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Refreshing...</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.695v-4.992m0 0h-4.992m4.992 0l-3.181-3.183a8.25 8.25 0 00-11.664 0L2.985 16.644" />
                            </svg>
                            <span>Refresh Data</span>
                        </>
                    )}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Status</label><select id="status-filter" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(() => 1); }} className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm">{uniqueStatus.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}</select></div>
                <div><label htmlFor="plant-filter" className="text-sm font-medium text-gray-700">SBI Plant</label><select id="plant-filter" value={plantFilter} onChange={(e) => { setPlantFilter(e.target.value); setCurrentPage(() => 1); }} className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm">{uniquePlants.map(p => <option key={p} value={p}>{p === 'All' ? 'All Plants' : p}</option>)}</select></div>
                <div><label htmlFor="lokasi-filter" className="text-sm font-medium text-gray-700">RDF Location</label><select id="lokasi-filter" value={lokasiFilter} onChange={(e) => { setLokasiFilter(e.target.value); setCurrentPage(() => 1); }} className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm">{uniqueLokasi.map(l => <option key={l} value={l}>{l === 'All' ? 'All Locations' : l}</option>)}</select></div>
                <div><label htmlFor="tahun-filter" className="text-sm font-medium text-gray-700">Year of Operation</label><select id="tahun-filter" value={tahunFilter} onChange={(e) => { setTahunFilter(e.target.value); setCurrentPage(() => 1); }} className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm">{uniqueTahunOperasi.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}</select></div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="kpi-card p-6 flex items-center"><div className="bg-blue-100 text-blue-600 p-4 rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div><div><p className="text-gray-500 text-sm">Total Partners</p><p className="text-2xl font-bold text-gray-800">{dashboardData.length}</p></div></div>
            <div className="kpi-card p-6 flex items-center"><div className="bg-green-100 text-green-600 p-4 rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0122 12c0 3-1 7-6.343 6.657z" /></svg></div><div><p className="text-gray-500 text-sm">Total RDF Received 2024 (Tons)</p><p className="text-2xl font-bold text-gray-800">{totalRdf2024.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</p></div></div>
            <div className="kpi-card p-6 flex items-center"><div className="bg-yellow-100 text-yellow-600 p-4 rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div><div><p className="text-gray-500 text-sm">Total RDF 2025 (YTD July)</p><p className="text-2xl font-bold text-gray-800">{totalRdf2025.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</p></div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md"><h2 className="text-xl font-bold text-gray-800 mb-4">Top 10 RDF Contributors 2024</h2><canvas id="chart2024"></canvas></div>
            <div className="bg-white p-6 rounded-xl shadow-md"><h2 className="text-xl font-bold text-gray-800 mb-4">Top 10 RDF Contributors 2025 (YTD)</h2><canvas id="chart2025"></canvas></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md mb-8"><h2 className="text-xl font-bold text-gray-800 mb-4">Map of RDF Plant Locations & SBI Plants</h2><div id="map"></div></div>
        
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Additional Insights & Operational Performance</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-xl font-bold text-gray-800 mb-4">Partnership Status</h3><canvas id="status-chart"></canvas></div>
                 <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-xl font-bold text-gray-800">Monthly RDF Intake vs. Budget (2025)</h3>
                         <select value={monthlyChartPlant} onChange={(e) => setMonthlyChartPlant(e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm">
                             <option value="All">All Plants</option>
                             <option value="Cilacap">Cilacap</option>
                             <option value="Narogong">Narogong</option>
                             <option value="Tuban">Tuban</option>
                             <option value="Lho">Lhoknga</option>
                         </select>
                    </div>
                    <canvas id="monthly-intake-chart"></canvas>
                    {monthlyChartPlant === 'Cilacap' && <div dangerouslySetInnerHTML={{ __html: operationalRemarks }} className="mt-4 text-sm text-gray-600 p-4 bg-gray-50 rounded-lg"></div>}
                </div>

                {/* --- KARTU BARU/DIPERBARUI --- */}
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between text-center"><h3 className="text-xl font-bold text-gray-800">Tanya AI (Ask AI)</h3><p className="text-gray-600 my-2">Ask natural language questions about your partnership data.</p><button onClick={() => setView('ai_advisor')} className="mt-auto bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-600">Ask the AI Advisor</button></div>
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between text-center"><h3 className="text-xl font-bold text-gray-800">RDF Quality Analysis</h3><p className="text-gray-600 my-2">Compare caloric values (GCV) and moisture content from various sources.</p><button onClick={() => setView('quality')} className="mt-auto bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600">View Quality Analysis</button></div>
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between text-center"><h3 className="text-xl font-bold text-gray-800">Risk Assessment</h3><p className="text-gray-600 my-2">Visualize operational, quality, and contract risks from partners.</p><button onClick={() => setView('risk')} className="mt-auto bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600">View Risk Dashboard</button></div>
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between text-center"><h3 className="text-xl font-bold text-gray-800">Cost-Benefit Analysis</h3><p className="text-gray-600 my-2">Calculate the profitability of each partner based on costs and savings.</p><button onClick={() => setView('cost')} className="mt-auto bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600">View Cost Analysis</button></div>
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between text-center"><h3 className="text-xl font-bold text-gray-800">Supply Forecast</h3><p className="text-gray-600 my-2">Predict RDF supply trends for proactive planning.</p><button onClick={() => setView('forecast')} className="mt-auto bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600">View Forecast</button></div>
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between text-center"><h3 className="text-xl font-bold text-gray-800">Dampak Lingkungan</h3><p className="text-gray-600 my-2">Analisis pengurangan CO₂ dan penyerapan sampah TPA dari program RDF.</p><button onClick={() => setView('environmental')} className="mt-auto bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600">Lihat Analisis Dampak</button></div>
             </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Partnership Data Details</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-6 py-3">Partner</th><th scope="col" className="px-6 py-3">RDF Plant Location</th><th scope="col" className="px-6 py-3">SBI Plant</th><th scope="col" className="px-6 py-3 text-center">Distance (KM)</th><th scope="col" className="px-6 py-3 text-center">Status</th><th scope="col" className="px-6 py-3 text-center">Year of Operation</th><th scope="col" className="px-6 py-3 text-right">RDF 2024 (Tons)</th><th scope="col" className="px-6 py-3 text-right">RDF 2025 (YTD)</th></tr></thead>
                    <tbody>
                        {paginatedData.map((item, index) => {
                            const statusColors: {[key: string]: string} = { 'Beroperasi': 'text-green-600 bg-green-100', 'Rencana': 'text-orange-600 bg-orange-100', 'Prospek': 'text-yellow-600 bg-yellow-100' };
                            const statusClass = statusColors[item.status] || 'text-gray-600 bg-gray-100';
                            return (
                                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.pemda}</th>
                                    <td className="px-6 py-4">{item.lokasi_rdf}</td>
                                    <td className="px-6 py-4">{item.closestFactory ? item.closestFactory.name : 'N/A'}</td>
                                    <td className="px-6 py-4 text-center">{item.distance ? `~${item.distance.toFixed(1)}` : 'N/A'}</td>
                                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 font-semibold text-xs rounded-full ${statusClass}`}>{item.status}</span></td>
                                    <td className="px-6 py-4 text-center">{item.tahun_operasi}</td>
                                    <td className="px-6 py-4 text-right">{item.rdf_2024.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-right">{item.rdf_2025.toLocaleString('id-ID')}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {paginatedData.length === 0 && (<div className="text-center py-8 text-gray-500"><p>No data matches the selected filters.</p></div>)}
            </div>
            <div className="flex justify-between items-center pt-4">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50">Previous</button>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50">Next</button>
            </div>
        </div>
    </>
);


// --- KOMPONEN APLIKASI UTAMA ---
const App: React.FC = () => {
    const [view, setView] = useState('dashboard');
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('All');
    const [tahunFilter, setTahunFilter] = useState('All');
    const [plantFilter, setPlantFilter] = useState('All');
    const [lokasiFilter, setLokasiFilter] = useState('All');
    const [monthlyChartPlant, setMonthlyChartPlant] = useState('Cilacap');
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const mapRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const markersRef = useRef<{ [id: number]: L.Marker }>({});
    const chartsRef = useRef<{[key: string]: Chart | null}>({});
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 750); // Simulate network delay
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark', 'ocean');
    }, []);
    
    const rowsPerPage = 10;
    
    const filteredData = useMemo(() => dashboardData.filter(item => {
        const statusMatch = statusFilter === 'All' || item.status === statusFilter;
        const tahunMatch = tahunFilter === 'All' || item.tahun_operasi === tahunFilter;
        const plantMatch = plantFilter === 'All' || item.closestFactory?.name === plantFilter;
        const lokasiMatch = lokasiFilter === 'All' || item.lokasi_rdf === lokasiFilter;
        return statusMatch && tahunMatch && plantMatch && lokasiMatch;
    }), [statusFilter, tahunFilter, plantFilter, lokasiFilter]);


    const createChart = useCallback(<T,>(canvasId: string, config: ChartConfiguration) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (canvas) {
            if (chartsRef.current[canvasId]) {
                chartsRef.current[canvasId]?.destroy();
            }
            chartsRef.current[canvasId] = new Chart(canvas, config);
        }
    }, []);

    useEffect(() => {
        if (view !== 'dashboard') return;
        
        const currentChartColors = chartColors.light;
        
        if (!mapRef.current) {
            const map = L.map('map').setView([-2.5, 118.0], 5);
            mapRef.current = map;
            
            const createCircleIcon = (color: string) => L.divIcon({
                html: `<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="${color}" stroke="white" stroke-width="2"/></svg>`,
                className: 'custom-div-icon', iconSize: [24, 24], iconAnchor: [12, 12]
            });
            const factoryIcon = L.divIcon({
                html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="#313c4e" stroke="white" stroke-width="1"><path d="M22 22H2v-12l7-5 3 3 3-3 7 5v12zM15 12h2v6h-2v-6zm-4 0h2v6h-2v-6zm-4 0h2v6H7v-6zM18 5h-2V3h2v2z"/></svg>`,
                className: 'custom-div-icon', iconSize: [30, 30], iconAnchor: [15, 15]
            });
            
            const statusColors: {[key: string]: string} = { 'Beroperasi': '#28a745', 'Rencana': '#fd7e14', 'Prospek': '#ffc107' };
            
            dashboardData.forEach(item => {
                if (item.latitude && item.longitude) {
                    const iconColor = statusColors[item.status] || '#6c757d';
                    const marker = L.marker([item.latitude, item.longitude], { icon: createCircleIcon(iconColor) });
                    markersRef.current[item.id] = marker;
                    
                    marker.bindPopup(`
                        <div class="font-sans">
                            <strong class="text-base">${item.pemda}</strong><br>
                            <span class="text-sm text-gray-600">${item.lokasi_rdf}</span><hr class="my-1">
                            <strong>Target Plant:</strong> ${item.closestFactory ? item.closestFactory.name : 'N/A'}<br>
                            <strong>Status:</strong> <span style="color:${iconColor}; font-weight:bold;">${item.status}</span><br>
                            <strong>Year:</strong> ${item.tahun_operasi}<br>
                            <strong>2024:</strong> ${item.rdf_2024.toLocaleString('id-ID')} Tons<br>
                            <strong>2025 (YTD):</strong> ${item.rdf_2025.toLocaleString('id-ID')} Tons
                        </div>
                    `);

                    marker.on('popupopen', () => {
                        if (routingControlRef.current) map.removeControl(routingControlRef.current);
                        if (item.closestFactory) {
                            // FIX: Mengubah opsi menjadi 'any' untuk mengatasi ketidakcocokan tipe untuk properti seperti 'createMarker'.
                            routingControlRef.current = L.Routing.control({
                                waypoints: [L.latLng(item.latitude, item.longitude), L.latLng(item.closestFactory.lat, item.closestFactory.lon)],
                                createMarker: () => null, routeWhileDragging: false, addWaypoints: false, draggableWaypoints: false, fitSelectedRoutes: false,
                                lineOptions: { styles: [{color: '#0369a1', opacity: 0.7, weight: 4}] }
                            } as any).addTo(map);
                        }
                    });

                    marker.on('popupclose', () => {
                        if (routingControlRef.current) {
                            map.removeControl(routingControlRef.current);
                            routingControlRef.current = null;
                        }
                    });
                }
            });

            sbiFactories.forEach(factory => {
                L.marker([factory.lat, factory.lon], { icon: factoryIcon }).addTo(map)
                 .bindPopup(`<strong class="text-base">SBI Plant</strong><br>${factory.name}`);
            });
            
            const legend = new (L.Control.extend({
                onAdd: function (map) {
                    const div = L.DomUtil.create('div', 'info legend');
                    div.innerHTML = `<b>Legend</b><br>` +
                    `<i class="circle" style="background:${statusColors['Beroperasi']}"></i> Operating<br>` +
                    `<i class="circle" style="background:${statusColors['Rencana']}"></i> Planned<br>` +
                    `<i class="circle" style="background:${statusColors['Prospek']}"></i> Prospect<br>` +
                    `<i style="background:#313c4e; width: 18px; height:18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> SBI Plant`;
                    return div;
                },
            }))({position: 'bottomright'});
            legend.addTo(map);
        } else {
            // Ini memastikan peta diubah ukurannya dengan benar saat beralih kembali ke tampilan dasbor
            setTimeout(() => {
                mapRef.current?.invalidateSize();
            }, 10);
        }

        if (mapRef.current) {
            if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);
            const tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
            tileLayerRef.current = L.tileLayer(tileUrl, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(mapRef.current);
        }

        const createTopContributorChart = (canvasId: string, year: number, colors: typeof chartColors['light']) => {
            const propName = `rdf_${year}`;
            const sortedData = [...dashboardData]
                .filter(d => (d as any)[propName] > 0)
                .sort((a, b) => (b as any)[propName] - (a as any)[propName])
                .slice(0, 10);
            
            createChart(canvasId, {
                type: 'bar',
                data: {
                    labels: sortedData.map(d => d.pemda),
                    datasets: [{
                        label: `RDF Amount (Tons)`,
                        data: sortedData.map(d => (d as any)[propName]),
                        backgroundColor: year === 2024 ? 'rgba(54, 162, 235, 0.6)' : 'rgba(255, 206, 86, 0.6)',
                        borderColor: year === 2024 ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 206, 86, 1)',
                        borderWidth: 1
                    }]
                },
                options: { 
                    indexAxis: 'y', 
                    scales: { 
                        x: { beginAtZero: true, ticks: { color: colors.ticks }, grid: { color: colors.grid } },
                        y: { ticks: { color: colors.ticks }, grid: { color: colors.grid } }
                    }, 
                    plugins: { 
                        legend: { display: false }, 
                        datalabels: { anchor: 'end', align: 'end', formatter: (v: number) => v.toLocaleString('id-ID'), color: colors.datalabel, font: { weight: 'bold', size: 10 } } 
                    } 
                }
            });
        };
        
        createTopContributorChart('chart2024', 2024, currentChartColors);
        createTopContributorChart('chart2025', 2025, currentChartColors);
        
        const statusCounts = dashboardData.reduce((acc, item) => { acc[item.status] = (acc[item.status] || 0) + 1; return acc; }, {} as {[key: string]: number});
        createChart('status-chart', {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{ data: Object.values(statusCounts), backgroundColor: ['rgba(40, 167, 69, 0.7)', 'rgba(253, 126, 20, 0.7)', 'rgba(255, 193, 7, 0.7)'], borderWidth: 1 }]
            },
            options: { plugins: { legend: { position: 'top', labels: { color: currentChartColors.labels } }, datalabels: { formatter: (v, ctx) => { let sum = ctx.chart.data.datasets[0].data.reduce((a: any, b: any) => a + b, 0); return `${((v * 100) / sum).toFixed(1)}%`; }, color: currentChartColors.datalabel_light, font: { weight: 'bold' } } } }
        });

        // Grafik Intake Bulanan Dinamis
        let monthlyData;
        if (monthlyChartPlant === 'All') {
            monthlyData = {
                labels: allMonthlyData.Cilacap.labels,
                budget: allMonthlyData.Cilacap.budget.map((_, i) => Object.values(allMonthlyData).reduce((sum, plant) => sum + plant.budget[i], 0)),
                actual: allMonthlyData.Cilacap.actual.map((_, i) => Object.values(allMonthlyData).reduce((sum, plant) => sum + plant.actual[i], 0)),
            };
        } else {
            monthlyData = allMonthlyData[monthlyChartPlant as keyof typeof allMonthlyData];
        }

        createChart('monthly-intake-chart', {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    { type: 'line', label: 'Budget (Tons)', data: monthlyData.budget, borderColor: 'rgba(255, 99, 132, 1)', borderDash: [5, 5], fill: false, tension: 0.1 },
                    { type: 'bar', label: 'Actual (Tons)', data: monthlyData.actual, backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)' }
                ]
            },
            options: { 
                scales: { 
                    y: { beginAtZero: true, ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } },
                    x: { ticks: { color: currentChartColors.ticks }, grid: { color: currentChartColors.grid } }
                }, 
                plugins: { 
                    legend: { position: 'top', labels: { color: currentChartColors.labels } }, 
                    datalabels: { display: false } 
                } 
            }
        });

        return () => {
            Object.values(chartsRef.current).forEach(chart => (chart as Chart | null)?.destroy());
        };
    }, [view, createChart, monthlyChartPlant]);

    useEffect(() => {
        if (view !== 'dashboard' || !mapRef.current) return;

        if (routingControlRef.current) {
            mapRef.current.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        const visibleIds = new Set(filteredData.map(item => item.id));

        // FIX: Replaced Object.entries with Object.keys to fix an issue where the 'marker'
        // type was being inferred as 'unknown', causing type errors on '.addTo' and '.removeFrom'.
        // This new approach ensures 'marker' is correctly typed as L.Marker by accessing it via a numeric key.
        Object.keys(markersRef.current).forEach(id => {
            const numericId = parseInt(id, 10);
            const marker = markersRef.current[numericId];
            
            if (visibleIds.has(numericId)) {
                if (!mapRef.current?.hasLayer(marker)) {
                    marker.addTo(mapRef.current!);
                }
            } else {
                if (mapRef.current?.hasLayer(marker)) {
                    marker.removeFrom(mapRef.current!);
                }
            }
        });
    }, [filteredData, view]);

    const uniqueTahunOperasi = ['All', ...Array.from(new Set(dashboardData.map(item => item.tahun_operasi)))];
    const uniqueStatus = ['All', ...Array.from(new Set(dashboardData.map(item => item.status)))];
    const uniquePlants = ['All', ...sbiFactories.map(f => f.name)];
    const uniqueLokasi = ['All', ...Array.from(new Set(dashboardData.map(item => item.lokasi_rdf)))];
    
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    
    const totalRdf2024 = dashboardData.reduce((sum, item) => sum + item.rdf_2024, 0);
    const totalRdf2025 = dashboardData.reduce((sum, item) => sum + item.rdf_2025, 0);

    const renderContent = () => {
        switch (view) {
            case 'dashboard': return <DashboardContent 
                handleRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                plantFilter={plantFilter}
                setPlantFilter={setPlantFilter}
                lokasiFilter={lokasiFilter}
                setLokasiFilter={setLokasiFilter}
                tahunFilter={tahunFilter}
                setTahunFilter={setTahunFilter}
                setCurrentPage={setCurrentPage}
                uniqueStatus={uniqueStatus}
                uniquePlants={uniquePlants}
                uniqueLokasi={uniqueLokasi}
                uniqueTahunOperasi={uniqueTahunOperasi}
                dashboardData={dashboardData}
                totalRdf2024={totalRdf2024}
                totalRdf2025={totalRdf2025}
                setView={setView}
                monthlyChartPlant={monthlyChartPlant}
                setMonthlyChartPlant={setMonthlyChartPlant}
                paginatedData={paginatedData}
                currentPage={currentPage}
                totalPages={totalPages}
            />;
            case 'quality': return <QualityAnalysisPage setView={setView} />;
            case 'ai_advisor': return <AIAdvisorPage setView={setView} />;
            case 'cost': return <CostBenefitAnalysisPage setView={setView} data={dashboardData} />;
            case 'forecast': return <ForecastPage setView={setView} />;
            case 'risk': return <RiskAssessmentPage setView={setView} data={dashboardData} />;
            case 'environmental': return <EnvironmentalImpactPage setView={setView} data={dashboardData} />;
            default: return <DashboardContent 
                handleRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                plantFilter={plantFilter}
                setPlantFilter={setPlantFilter}
                lokasiFilter={lokasiFilter}
                setLokasiFilter={setLokasiFilter}
                tahunFilter={tahunFilter}
                setTahunFilter={setTahunFilter}
                setCurrentPage={setCurrentPage}
                uniqueStatus={uniqueStatus}
                uniquePlants={uniquePlants}
                uniqueLokasi={uniqueLokasi}
                uniqueTahunOperasi={uniqueTahunOperasi}
                dashboardData={dashboardData}
                totalRdf2024={totalRdf2024}
                totalRdf2025={totalRdf2025}
                setView={setView}
                monthlyChartPlant={monthlyChartPlant}
                setMonthlyChartPlant={setMonthlyChartPlant}
                paginatedData={paginatedData}
                currentPage={currentPage}
                totalPages={totalPages}
            />;
        }
    };

    return (
        <div id="dashboard-container" className="max-w-7xl mx-auto">
            {renderContent()}
        </div>
    );
};

// Logika rendering dari index.tsx asli
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);