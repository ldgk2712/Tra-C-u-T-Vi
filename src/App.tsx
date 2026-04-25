import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { HoroscopeView } from './components/HoroscopeView';
import { OverviewDashboard } from './components/OverviewDashboard';
import { generateChart, updateChartYear } from './utils/chartGenerator';
import { Palace, CentralInfo } from './data/mockData';
import { useAuth } from './contexts/AuthContext';
import { db } from './lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

type View = 'home' | 'chart' | 'overview';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [chartData, setChartData] = useState<{ palaces: Palace[], centralInfo: CentralInfo } | null>(null);
  const { user } = useAuth();

  const handleGenerate = async (formData: any) => {
    const newChartData = generateChart(formData);
    if (formData.isMock) {
      newChartData.centralInfo.isMock = true;
    }

    if (formData.id) {
      newChartData.centralInfo.docId = formData.id;
      newChartData.centralInfo.analyses = formData.analyses || {};
    }

    setChartData(newChartData);
    setCurrentView('overview');

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
          analyses: {},
        });

        setChartData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            centralInfo: {
              ...prev.centralInfo,
              docId: docRef.id,
              analyses: {},
            },
          };
        });
      } catch (error) {
        console.error('Error saving horoscope to Firestore', error);
      }
    }
  };

  const handleYearChange = (newYear: number) => {
    if (chartData) {
      setChartData(updateChartYear(chartData, newYear));
    }
  };

  if (currentView === 'overview') {
    return (
      <OverviewDashboard
        onNavigate={setCurrentView}
        chartData={chartData}
      />
    );
  }

  if (currentView === 'chart') {
    return (
      <HoroscopeView
        onNavigate={setCurrentView}
        chartData={chartData}
        onYearChange={handleYearChange}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3e9] font-sans">
      <Header onNavigate={setCurrentView} />
      <main>
        <HomeView onNavigate={setCurrentView} onGenerate={handleGenerate} />
      </main>
    </div>
  );
}

export default App;
