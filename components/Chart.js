// components/Chart.js - Dark Theme Version with Multi-Axis Support
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function Chart({ 
  data, 
  labels, 
  title, 
  color = '#00D9FF', 
  datasets = null,
  multiAxis = false,
  chartType = 'line' // 'line' or 'mixed'
}) {
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
        backgroundColor: `${color}30`,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: '#000',
        pointBorderWidth: 2,
      },
    ],
  }

  // 2軸グラフの設定
  const scalesConfig = multiAxis ? {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#8E8E93',
        font: {
          size: 12,
        },
      },
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      grid: {
        color: '#2C2C2E',
        borderDash: [5, 5],
      },
      ticks: {
        color: '#8E8E93',
        font: {
          size: 12,
        },
      },
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        color: '#8E8E93',
        font: {
          size: 12,
        },
      },
    },
  } : {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#8E8E93',
        font: {
          size: 12,
        },
      },
    },
    y: {
      grid: {
        color: '#2C2C2E',
        borderDash: [5, 5],
      },
      ticks: {
        color: '#8E8E93',
        font: {
          size: 12,
        },
      },
    },
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: datasets ? true : false,
        labels: {
          color: '#FFFFFF',
          font: {
            size: 12,
          },
          padding: 15,
          usePointStyle: true,
          filter: function(item, chart) {
            // 移動平均線は凡例に表示しない（オプション）
            return !item.text.includes('移動平均');
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(28, 28, 30, 0.95)',
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
    scales: scalesConfig,
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }

  // Mixed chart (line + bar)の場合
  if (chartType === 'mixed' && datasets) {
    return (
      <div className="w-full h-full">
        <Line data={chartData} options={options} />
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <Line data={chartData} options={options} />
    </div>
  )
}
