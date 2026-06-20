// components/Chart.js - Dark Theme Version
// 既存のレイアウトを維持しながら、色味だけをダークテーマに変更
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function Chart({ data, labels, title, color = '#00D9FF', datasets = null }) { // datasetsオプションを追加
  // datasetsが指定されている場合はそれを使用、なければ従来通りの単一データセット
  const chartData = datasets ? {
    labels,
    datasets
  } : {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: color,
        backgroundColor: `${color}30`, // 半透明の背景
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: '#000', // ダークテーマ: ポイントボーダーを黒に
        pointBorderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: datasets ? true : false, // 複数データセットの場合は凡例を表示
        labels: {
          color: '#FFFFFF',
          font: {
            size: 12,
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(28, 28, 30, 0.95)', // ダークテーマ: ツールチップ背景
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 16,
          weight: 'bold',
        },
        cornerRadius: 8,
        borderColor: '#38383A',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#8E8E93', // ダークテーマ: グレーのテキスト
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: '#2C2C2E', // ダークテーマ: ダークグレーのグリッド
          borderDash: [5, 5],
        },
        ticks: {
          color: '#8E8E93', // ダークテーマ: グレーのテキスト
          font: {
            size: 12,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }

  return (
    <div className="w-full h-64">
      <Line data={chartData} options={options} />
    </div>
  )
}
