import React, { useEffect, useRef } from "react";
import { Chart as G2Chart } from "@antv/g2";
import "./index.css";

export type SimpleChartType = "pie" | "bar" | "line" | "area";

export interface SimpleChartProps {
  type: SimpleChartType;
  data: any[];
  loading?: boolean;

  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;

  xField?: string;
  yField?: string;
  colorField?: string;

  autoFit?: boolean;
  showLegend?: boolean;
  showLabel?: boolean;
  showTooltip?: boolean;

  showPercent?: boolean;
  innerRadius?: number;

  horizontal?: boolean;

  onChartReady?: (chart: G2Chart) => void;
  customConfig?: (chart: G2Chart) => void;

  containerId?: string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({
  type = "pie",
  data = [],
  loading = false,
  width = "100%",
  height = "400px",
  style,
  xField = "x",
  yField = "y",
  colorField,
  autoFit = true,
  showLegend = true,
  showLabel = true,
  showTooltip = true,
  showPercent = false,
  innerRadius = 0,
  horizontal = false,
  onChartReady,
  customConfig,
  containerId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<G2Chart | null>(null);
  const generatedId = useRef(
    `chart-${Math.random().toString(36).substr(2, 9)}`
  );

  // 获取实际的容器ID
  const actualContainerId = containerId || generatedId.current;

  useEffect(() => {
    if (loading || !data || data.length === 0) {
      return;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    try {
      const chart = new G2Chart({
        container: containerRef.current,
        autoFit,
        width: typeof width === "number" ? width : undefined,
        height:
          typeof height === "number"
            ? height
            : parseInt(height.toString()) || 400,
      });

      configureChart(chart);

      chart.render();

      chartInstanceRef.current = chart;

      onChartReady?.(chart);
    } catch (error) {
      console.error("图表创建失败:", error);
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [
    data,
    type,
    loading,
    xField,
    yField,
    colorField,
    showPercent,
    innerRadius,
    horizontal,
  ]);

  // 图表配置函数
  const configureChart = (chart: G2Chart) => {
    let mark;

    switch (type) {
      case "pie":
        chart.coordinate({
          type: "theta",
          outerRadius: 0.8,
          innerRadius: innerRadius,
        });

        mark = chart
          .interval()
          .data(data)
          .transform({ type: "stackY" })
          .encode("y", yField)
          .encode("color", colorField || xField);

        if (showLabel) {
          mark.label({
            position: "outside",
            text: showPercent
              ? (d: any) =>
                  `${d[colorField || xField]}: ${(d[yField] * 100).toFixed(1)}%`
              : (d: any) => `${d[colorField || xField]}: ${d[yField]}`,
          });
        }

        if (showTooltip) {
          mark.tooltip((d: any) => ({
            name: d[colorField || xField],
            value: showPercent
              ? `${(d[yField] * 100).toFixed(1)}%`
              : `${d[yField]}`,
          }));
        }
        break;

      case "bar":
        if (horizontal) {
          mark = chart
            .interval()
            .data(data)
            .encode("x", yField)
            .encode("y", xField);
        } else {
          mark = chart
            .interval()
            .data(data)
            .encode("x", xField)
            .encode("y", yField);
        }

        if (colorField) {
          mark.encode("color", colorField);
        }

        if (showTooltip) {
          mark.tooltip((d: any) => ({
            name: d[xField],
            value: `${d[yField]}`,
          }));
        }
        break;

      case "line":
        mark = chart.line().data(data).encode("x", xField).encode("y", yField);

        if (colorField) {
          mark.encode("color", colorField);
        }
        break;

      case "area":
        mark = chart.area().data(data).encode("x", xField).encode("y", yField);

        if (colorField) {
          mark.encode("color", colorField);
        }
        break;

      default:
        mark = chart.interval().data(data);
    }

    if (showLegend && (colorField || type === "pie")) {
      mark.legend("color", {
        position: type === "pie" ? "bottom" : "top",
        layout: { justifyContent: "center" },
      });
    }

    if (customConfig) {
      customConfig(chart);
    }
  };

  const containerStyle: React.CSSProperties = {
    width: typeof width === "string" ? width : `${width}px`,
    height: typeof height === "string" ? height : `${height}px`,
    display: loading ? "none" : "block",
    position: "relative",
    ...style,
  };

  if (loading) {
    return (
      <div className="simple-chart-loading" style={containerStyle}>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <div className="loading-text">图表加载中...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="simple-chart-empty" style={containerStyle}>
        <div className="empty-content">
          <div className="empty-icon">📊</div>
          <div className="empty-text">暂无数据</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="simple-chart-container"
      style={containerStyle}
      id={actualContainerId}
    />
  );
};

export default SimpleChart;
