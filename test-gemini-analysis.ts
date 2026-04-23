import { analyzeHolisticChart } from './src/services/gemini';
import { mockPalaces, mockCentralInfo } from './src/data/mockData';

async function test() {
  const chartData: Record<string, string[]> = {};
  mockPalaces.forEach(p => {
    const allStars = [
      ...p.mainStars.map(s => s.name),
      ...p.goodStars.map(s => s.name),
      ...p.badStars.map(s => s.name)
    ];
    if (p.isTuan) allStars.push("Tuần");
    if (p.isTriet) allStars.push("Triệt");
    
    const palaceName = p.isThan ? `${p.name} (Thân)` : p.name;
    chartData[`${palaceName} (tại ${p.canChi})`] = allStars;
  });

  try {
    const result = await analyzeHolisticChart(chartData, mockCentralInfo);
    console.log("Success:", result.substring(0, 100));
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
