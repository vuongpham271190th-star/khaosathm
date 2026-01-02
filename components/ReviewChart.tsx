import React, { useEffect, useRef } from 'react';
import type { Review } from '../types';
import { LOCALES } from '../constants';
import Chart from 'chart.js/auto';

interface ReviewChartProps {
  reviews: Review[];
  filterClass: string;
  detailed?: boolean;
}

// Helper to generate a palette of visually distinct colors for chart segments
const generateColors = (numColors: number) => {
    const colors = [];
    const baseColors = [
        '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
        '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#84cc16',
    ];
    for (let i = 0; i < numColors; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
};


const ReviewChart: React.FC<ReviewChartProps> = ({ reviews, filterClass, detailed = false }) => {
  const summaryChartContainer = useRef<HTMLCanvasElement>(null);
  const summaryChartInstance = useRef<any>(null);
  const detailedChartRefs = useRef<Map<string, HTMLCanvasElement | null>>(new Map());
  const detailedChartInstances = useRef<Map<string, any>>(new Map());

  const t = LOCALES.vi;
  const isDarkMode = typeof window !== 'undefined' && document.body.classList.contains('dark');

  const aggregation: Record<string, { total: number; satisfied: number; unsatisfied: number }> = {};
  reviews.forEach(review => {
    Object.entries(review.ratings).forEach(([item, rating]) => {
      if (!aggregation[item]) {
        aggregation[item] = { total: 0, satisfied: 0, unsatisfied: 0 };
      }
      aggregation[item].total++;
      if (rating === 'satisfied') {
        aggregation[item].satisfied++;
      } else {
        aggregation[item].unsatisfied++;
      }
    });
  });
  const labels = Object.keys(aggregation);

  useEffect(() => {
    const textColor = isDarkMode ? '#e5e7eb' : '#374151';

    const customCanvasBackgroundColor = {
      id: 'customCanvasBackgroundColor',
      beforeDraw: (chart: any, args: any, options: any) => {
        const {ctx} = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = options.color || '#ffffff';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      }
    };
    
    if (detailed) {
        // DETAILED VIEW: Grid of small doughnut charts
        detailedChartInstances.current.forEach(chart => chart.destroy());
        detailedChartInstances.current.clear();
        
        labels.forEach(label => {
            const canvas = detailedChartRefs.current.get(label);
            const itemData = aggregation[label];
            if (canvas && itemData) {
                const ctx = canvas.getContext('2d');
                
                const centerTextPlugin = {
                    id: `centerText-${label.replace(/\s/g, '')}`,
                    afterDraw: (chart: any) => {
                        if (itemData.total === 0) return;
                        const { ctx } = chart;
                        ctx.save();
                        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                        ctx.fillStyle = textColor;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.font = `bold 24px 'Be Vietnam Pro', sans-serif`;
                        ctx.fillText(itemData.total, centerX, centerY);
                        ctx.restore();
                    }
                };

                const instance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: [t.satisfied, t.unsatisfied],
                        datasets: [{
                            data: [itemData.satisfied, itemData.unsatisfied],
                            backgroundColor: ['#10b981', '#ef4444'], // Green, Red
                            borderColor: '#ffffff',
                            borderWidth: 2,
                            hoverOffset: 4,
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                            customCanvasBackgroundColor: { color: 'white' },
                            title: { display: true, text: label, font: { size: 14, weight: 'bold', family: "'Be Vietnam Pro', sans-serif" }, color: textColor, padding: { bottom: 10 } },
                            legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: {size: 12, family: "'Be Vietnam Pro', sans-serif"}, color: textColor } },
                            tooltip: {
                                callbacks: {
                                    label: function(context: any) {
                                        const value = context.raw as number;
                                        const total = itemData.satisfied + itemData.unsatisfied;
                                        const percentage = total > 0 ? (value / total * 100).toFixed(0) : 0;
                                        return `${context.label}: ${value} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    },
                    plugins: [centerTextPlugin, customCanvasBackgroundColor]
                });
                detailedChartInstances.current.set(label, instance);
            }
        });
    } else {
        // SUMMARY VIEW: Single large doughnut chart (original behavior)
        if (summaryChartInstance.current) summaryChartInstance.current.destroy();
        
        if (summaryChartContainer.current && reviews.length > 0) {
            const data = labels.map(label => aggregation[label].total);
            const centerTextPlugin = {
                id: 'centerTextSummary',
                afterDraw: (chart: any) => {
                    const totalReviews = data.reduce((a, b) => a + b, 0);
                    if (totalReviews === 0) return;
                    const { ctx } = chart;
                    ctx.save();
                    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                    ctx.fillStyle = textColor;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = `bold 30px 'Be Vietnam Pro', sans-serif`;
                    ctx.fillText(totalReviews, centerX, centerY - 8);
                    ctx.font = `500 12px 'Be Vietnam Pro', sans-serif`;
                    ctx.fillStyle = isDarkMode ? '#9ca3af' : '#6b7280';
                    ctx.fillText('Đánh giá', centerX, centerY + 12);
                    ctx.restore();
                }
            };

            summaryChartInstance.current = new Chart(summaryChartContainer.current.getContext('2d'), {
              type: 'doughnut',
              data: {
                labels: labels,
                datasets: [{ label: 'Tổng đánh giá', data: data, backgroundColor: generateColors(labels.length), borderColor: '#ffffff', borderWidth: 3, hoverOffset: 8 }],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                  customCanvasBackgroundColor: { color: 'white' },
                  title: { display: true, text: `Lớp ${filterClass}`, font: { size: 16, weight: 'bold', family: "'Be Vietnam Pro', sans-serif" }, color: textColor, padding: { bottom: 15 } },
                  legend: { position: 'bottom', labels: { color: textColor, font: { family: "'Be Vietnam Pro', sans-serif" }, boxWidth: 12, padding: 20 } },
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        const label = context.label || '';
                        const itemData = aggregation[label];
                        if (itemData) {
                           const satisfiedPercent = itemData.total > 0 ? ((itemData.satisfied / itemData.total) * 100).toFixed(0) : 0;
                           return [`${label}: ${itemData.total} đánh giá`, `  ${t.satisfied}: ${itemData.satisfied} (${satisfiedPercent}%)`, `  ${t.unsatisfied}: ${itemData.unsatisfied}`];
                        }
                        return label;
                      }
                    }
                  }
                },
              },
              plugins: [centerTextPlugin, customCanvasBackgroundColor]
            });
        }
    }
    
    return () => {
      if (summaryChartInstance.current) { summaryChartInstance.current.destroy(); summaryChartInstance.current = null; }
      detailedChartInstances.current.forEach(chart => chart.destroy());
      detailedChartInstances.current.clear();
    };

  }, [reviews, filterClass, t, isDarkMode, detailed, aggregation, labels]);

  if (reviews.length === 0) {
      return null;
  }
  
  if (detailed) {
      return (
        <div>
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">{`Chi tiết đánh giá - Lớp ${filterClass}`}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {labels.map(label => (
                <div key={label} className="bg-white rounded-lg p-3 shadow" style={{height: '300px'}}>
                    <div style={{ position: 'relative', height: '100%' }}>
                        <canvas ref={el => { detailedChartRefs.current.set(label, el); }}></canvas>
                    </div>
                </div>
                ))}
            </div>
        </div>
      )
  }

  return (
    <div className="bg-white rounded-lg" style={{ position: 'relative', height: '400px', width: '100%' }}>
      <canvas ref={summaryChartContainer}></canvas>
    </div>
  );
};

export default ReviewChart;