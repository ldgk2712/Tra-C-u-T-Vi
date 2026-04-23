import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { HoroscopeView } from './components/HoroscopeView';
import { generateChart, updateChartYear } from './utils/chartGenerator';
import { Palace, CentralInfo } from './data/mockData';
import { useAuth } from './contexts/AuthContext';
import { db } from './lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'chart'>('home');
  const [chartData, setChartData] = useState<{ palaces: Palace[], centralInfo: CentralInfo } | null>(null);
  const { user } = useAuth();

  const handleGenerate = async (formData: any) => {
    const newChartData = generateChart(formData);
    if (formData.isMock) {
      newChartData.centralInfo.isMock = true;
    }
    
    // If loading a saved horoscope, it might already have a docId and analyses
    if (formData.id) {
      newChartData.centralInfo.docId = formData.id;
      newChartData.centralInfo.analyses = formData.analyses || {};
    }

    setChartData(newChartData);
    setCurrentView('chart');

    // Save to Firestore if user is logged in and it's not a mock chart and not already saved (no id)
    if (user && !formData.isMock && !formData.id) {
      try {
        const docRef = await addDoc(collection(db, 'horoscopes'), {
          uid: user.uid,
          name: formData.name,
          dob: formData.dob,
          hour: formData.hour,
          gender: formData.gender,
          viewYear: formData.viewYear,
          createdAt: new Date().toISOString(),
          analyses: {} // Initialize empty analyses
        });
        
        // Update local chart data with the new docId
        setChartData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            centralInfo: {
              ...prev.centralInfo,
              docId: docRef.id,
              analyses: {}
            }
          };
        });
      } catch (error) {
        console.error("Error saving horoscope to Firestore", error);
      }
    }
  };

  const handleYearChange = (newYear: number) => {
    if (chartData) {
      setChartData(updateChartYear(chartData, newYear));
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3e9] font-sans">
      <Header onNavigate={setCurrentView} />
      
      <main>
        {currentView === 'home' ? (
          <HomeView onNavigate={setCurrentView} onGenerate={handleGenerate} />
        ) : (
          <HoroscopeView onNavigate={setCurrentView} chartData={chartData} onYearChange={handleYearChange} />
        )}
      </main>
    </div>
  );
}

export default App;
