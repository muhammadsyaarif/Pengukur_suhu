'use client';
import supabase from "@/lib/supabase"; // Adjust the path as necessary
import { useEffect, useState, useCallback } from "react";
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import autoTable from jspdf-autotable
import Link from 'next/link'; 
import Image from 'next/image'; // Import the Image component from Next.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MonitoringPage() {
  const [data, setData] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    let query = supabase.from("suhu").select("*").order("id", { ascending: false }).limit(10);

    if (startDate && endDate) {
      query = query.gte("created_at", startDate).lte("created_at", endDate);
    }

    const { data: fetchedData } = await query;
    setData(fetchedData ?? []);
  }, [startDate, endDate]);

  // Download data as PDF
  function downloadPDF() {
    const doc = new jsPDF();
    doc.text("Data Suhu dan Kelembapan", 10, 10);

    const tableColumn = ["Waktu", "Suhu (°C)", "Kelembapan (%)"];
    const tableRows: any[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const filteredData = data.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate >= start && itemDate <= end;
    });

    if (filteredData.length === 0) {
      doc.text("No data available within the selected date range.", 10, 20);
    } else {
      filteredData.forEach(item => {
        const dataRow = [
          new Date(item.created_at).toLocaleString(),
          item.suhu,
          item.kelembapan,
        ];
        tableRows.push(dataRow);
      });

      // Generate the table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
      });
    }

    // Save the PDF
    doc.save("data-suhu-kelembapan.pdf");
  }

  // Fetch data and set interval
  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
      setCurrentTime(new Date().toLocaleTimeString());
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Prepare chart data
  const suhuChartData = {
    labels: data.map((item) => new Date(item.created_at).toLocaleTimeString()).concat(currentTime),
    datasets: [
      {
        label: 'Suhu (°C)',
        data: data.map((item) => item.suhu),
        backgroundColor: 'rgba(66, 165, 245, 0.7)',
        borderColor: '#42A5F5',
        borderWidth: 1,
      },
    ],
  };

  const kelembapanChartData = {
    labels: data.map((item) => new Date(item.created_at).toLocaleTimeString()).concat(currentTime),
    datasets: [
      {
        label: 'Kelembapan (%)',
        data: data.map((item) => item.kelembapan),
        backgroundColor: 'rgba(102, 187, 106, 0.7)',
        borderColor: '#66BB6A',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff',
        },
      },
      title: {
        display: true,
        text: '',
        color: '#ffffff',
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#ffffff',
        titleColor: '#000000',
        bodyColor: '#000000',
        borderColor: '#cccccc',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
      y: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 text-white font-sans">
      {/* Scrolling Marquee */}
      <div className="marquee-container overflow-hidden whitespace-nowrap bg-gray-800 py-2">
        <p className="marquee-text animate-marquee text-2xl font-bold text-yellow-300">
          Alat Monitoring Suhu & Kelembapan &nbsp;&nbsp;&nbsp;
        </p>
      </div>

      <div className="flex flex-col mx-10 my-10">
        <div className="flex flex-col md:flex-row justify-around items-center bg-gray-800 border border-gray-700 rounded-lg shadow-lg mb-4 p-4">
          <div className="flex flex-col p-2">
            <label className="text-gray-400 font-semibold mb-2">Start Date</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col p-2">
            <label className="text-gray-400 font-semibold mb-2">End Date</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button
              onClick={fetchData}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-300"
            >
              Filter Data
            </button>
            <button
              onClick={downloadPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-300"
            >
              Download PDF
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-around space-y-4 md:space-y-0 md:space-x-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 flex-1">
            <h2 className="text-xl font-semibold text-center mb-4">Monitoring Suhu (°C)</h2>
            <Bar data={suhuChartData} options={{ ...options, plugins: { ...options.plugins, title: { text: 'Suhu' } } }} />
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 flex-1">
            <h2 className="text-xl font-semibold text-center mb-4">Monitoring Kelembapan (%)</h2>
            <Bar data={kelembapanChartData} options={{ ...options, plugins: { ...options.plugins, title: { text: 'Kelembapan' } } }} />
          </div>
        </div>
      </div>

      {/* Button to go back to homepage */}
      <div className="fixed bottom-5 right-5">
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-300">
          Kembali ke Homepage
        </Link>
      </div>

      {/* Logo WhatsApp placed at the bottom left corner */}
      <div className="fixed bottom-5 left-5 flex items-center space-x-2">
        <a
          href="https://wa.me/6287844232534"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <Image src="https://res.cloudinary.com/dvavtg6tx/image/upload/v1724237750/whatsapp_jqrdqr.png" alt="WhatsApp" width={50} height={50} />
        </a>
      </div>
    </div>
  );
}
