'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import supabase from "@/lib/supabase";
import Image from 'next/image'; // Import the Image component

export default function Homepage() {
  const [temperature, setTemperature] = useState(null);

  // Fungsi untuk mengambil data suhu terbaru dari database
  const fetchLatestTemperature = async () => {
    const { data, error } = await supabase
      .from("suhu")
      .select("suhu")
      .order("id", { ascending: false })
      .limit(1)
      .single(); // Ambil hanya satu data suhu terbaru

    if (error) {
      console.error("Error fetching temperature data:", error);
      return;
    }

    setTemperature(data ? data.suhu : null); // Set suhu jika ada
  };

  useEffect(() => {
    fetchLatestTemperature();
    const intervalId = setInterval(fetchLatestTemperature, 5000); // Update setiap 5 detik

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col justify-center items-center space-y-8 p-8 bg-cover bg-center"
      style={{
        backgroundImage: 'url(/suhu.png)', // Latar belakang gambar
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#d5e1f2', // Warna latar belakang tambahan
      }}
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg animate-pulse">
          Selamat Datang di Monitoring Suhu & Kelembapan
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Dengan alat monitoring canggih kami, Anda dapat memantau suhu dan kelembapan secara akurat dan real-time. Klik tombol di bawah untuk memulai pengalaman Anda!
        </p>
      </div>

      {/* Menampilkan data suhu */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Suhu Saat Ini:</h2>
        {temperature !== null ? (
          <p className="text-2xl font-semibold">{temperature} °C</p>
        ) : (
          <p className="text-lg">Mengambil data suhu...</p>
        )}
      </div>

      {/* Gambar Ilustrasi (optional) */}
      <div className="w-64 md:w-96">
        <Image
          src="/monitoring.png" // Ganti dengan path gambar yang sesuai jika ada
          alt="Monitoring Suhu dan Kelembapan"
          width={400} // Sesuaikan dengan lebar gambar
          height={300} // Sesuaikan dengan tinggi gambar
          className="mx-auto animate-fadeIn"
        />
      </div>

      {/* Button with Hover Effect */}
      <Link href="/monitoring" className="relative group">
        <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md blur-lg opacity-75 group-hover:opacity-100 transition duration-500"></span>
        <span className="relative bg-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-md hover:bg-blue-800 transition duration-300">
          Lihat Monitoring
        </span>
      </Link>

      {/* Additional Information */}
      <div className="text-center mt-12 space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold">Mengapa Memilih Kami?</h2>
        <ul className="list-disc list-inside space-y-2 max-w-md mx-auto text-left">
          <li>Data real-time yang akurat</li>
          <li>Antarmuka yang mudah digunakan</li>
          <li>Visualisasi data yang interaktif</li>
        </ul>
      </div>

      {/* Menempatkan WhatsApp lebih rendah */}
      <div className="flex justify-center mt-8">
        <a
          href="https://wa.me/6287844232534" // Ganti dengan nomor WhatsApp yang sesuai
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <Image
            src="/wa.png" // Ganti dengan path gambar WhatsApp yang sesuai
            alt="WhatsApp Logo"
            width={30} // Smaller width for the image
            height={30} // Smaller height for the image
            className="animate-fadeIn" // Optional fade-in animation
          />
          <span className="ml-2 text-sm font-semibold text-blue-600">Hubungi Kami</span> {/* Smaller font size */}
        </a>
      </div>
    </div>
  );
}
