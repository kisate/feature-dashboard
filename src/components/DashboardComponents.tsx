import Plot from "react-plotly.js";
import { SelfExplanations } from "../dataset";

export function ScaleTuningPlot({
    title,
    explanations,
    handlePlotClick
}: {
    title: string,
    explanations: SelfExplanations,
    handlePlotClick: (idx: number) => void
}) {
    return <Plot
        data={[
            {
                x: explanations.scales,
                y: explanations.self_similarity,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Self-similarity',
                marker: { color: 'blue' },
            },
            {
                x: explanations.scales,
                y: explanations.entropy,
                name: 'Entropy',
                type: 'scatter',
                mode: 'lines+markers',
                yaxis: 'y2',
                marker: { color: 'green' },
            },
            {
                x: explanations.scales,
                y: explanations.cross_entropy,
                name: 'Cross-entropy',
                type: 'scatter',
                mode: 'lines+markers',
                yaxis: 'y3',
                marker: { color: 'orange' },
            },
            {
                x: explanations.scales,
                y: explanations.selection_metric,
                name: 'Selection metric',
                type: 'scatter',
                mode: 'lines+markers',
                yaxis: 'y4',
                marker: { color: 'red' },
            }

        ]}
        layout={{
            // width: 300,
            height: 300,
            autosize: true,
            title: title,
            margin: {
                l: 10,
                r: 10,
                b: 40,
                t: 50,
                pad: 4
            },
            legend: { x: 0.4, y: 0 },
            xaxis: { title: 'Scale' },
            yaxis: { showticklabels: false },
            yaxis2: {
                showticklabels: false,
                anchor: 'x',
                overlaying: 'y',
                side: 'left'
            },
            yaxis3: {
                showticklabels: false,
                anchor: 'x',
                overlaying: 'y',
                side: 'left'
            },
            yaxis4: {
                showticklabels: false,
                anchor: 'x',
                overlaying: 'y',
                side: 'left'
            },
            showlegend: false,
            updatemenus: [{
                type: 'buttons',
                buttons: [{
                    label: '≡',
                    method: 'relayout',
                    args: ['showlegend', false],
                    args2: ['showlegend', true],
                }]
            }],
        }}
        style={{ borderRadius: '0px' }}
        onClick={(data) => {
            handlePlotClick(data.points[0].pointIndex);
        }}
    />
}