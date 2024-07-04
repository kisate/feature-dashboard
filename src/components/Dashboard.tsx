import React from "react";
import { Feature } from "../dataset";
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Plot from 'react-plotly.js';
import "./Dashboard.css";

interface DashboardProps {
    features: Feature[];
}

function MaxActivatingExample({ tokens, values }: { tokens: string[], values: number[] }) {
    return (
        <div className="example">
            {tokens.map((token, i) => (
                <span key={i} style={{ backgroundColor: `rgba(255, 0, 0, ${values[i]})` }}>
                    {token}{" "}
                </span>
            ))}
        </div>
    );
}

function SelfEExample({ example, scale, isHighlighted }: { example: string, scale: number, isHighlighted: boolean }) {
    return (
        <div className="example" style={isHighlighted ? { backgroundColor: 'rgba(0, 0, 255, 0.5)' } : {}}>
            Scale: {scale.toFixed(2)} | "{example}
        </div>
    );
}

function DashboardItem({ feature }: { feature: Feature }) {
    const [expanded, setExpanded] = React.useState(false);
    const [explanation_idx, setExplanationIdx] = React.useState<number | null>(null);
    const handleChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? true : false);
        if (!isExpanded) {
            setExplanationIdx(null);
        }
    };

    const handlePlotClick = (event: any) => {
        const number = event.points[0].pointIndex;
        const fraction = number / feature.scales.length;

        const explanation_idx = Math.floor(fraction * feature.selfe_explanations.length);
        setExpanded(true);
        setExplanationIdx(explanation_idx);
    };

    const maxSelfSimilarity = Math.max(...feature.self_similarity);
    const backgroundColor = maxSelfSimilarity < 0.01 ? `rgba(255, 0, 0, ${1 - maxSelfSimilarity * 100})` : 'transparent';

    return (
        <Grid container spacing={2}>
            <Grid item xs={3}>
                <Box
                    sx={{
                        padding: 2,
                        borderRadius: 1,
                        boxShadow: 3,
                        textAlign: 'left'
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">Feature {feature.feature}</Typography>
                    <Typography variant="subtitle1" fontWeight="bold">Layer {feature.layer}</Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Max self similarity: <span style={{ backgroundColor: backgroundColor, padding: '2px 4px', borderRadius: '4px' }}>{maxSelfSimilarity.toFixed(4)}</span>
                    </Typography>
                </Box>
                <Plot
                    data={[
                        {
                            x: feature.scales,
                            y: feature.self_similarity,
                            type: 'scatter',
                            mode: 'lines+markers',
                            name: 'Self-similarity',
                            marker: { color: 'blue' },
                        },
                        {
                            x: feature.scales,
                            y: feature.entropy,
                            name: 'Entropy',
                            type: 'scatter',
                            mode: 'lines+markers',
                            yaxis: 'y2',
                            marker: { color: 'green' },
                        },
                        {
                            x: feature.scales,
                            y: feature.cross_entropy,
                            name: 'Cross-entropy',
                            type: 'scatter',
                            mode: 'lines+markers',
                            yaxis: 'y3',
                            marker: { color: 'orange' },
                        }
                    ]}
                    layout={{
                        width: 300,
                        height: 300,
                        title: 'Scale tuning',
                        margin: {
                            l: 10,
                            r: 50,
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
                    }}
                    style={{ borderRadius: '0px' }}
                    onClick={handlePlotClick}
                />
            </Grid>
            <Grid item xs={9}>
                <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>{feature.autoint_explanation}</Typography>
                <Accordion expanded={expanded} onChange={handleChange}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <SelfEExample example={feature.selfe_explanations[0]} scale={feature.selfe_scales[0]} isHighlighted={false} />
                    </AccordionSummary>
                    <AccordionDetails>
                        {feature.selfe_explanations.map((explanation, i) => (
                            <SelfEExample key={i} example={explanation} scale={feature.selfe_scales[i]}
                                isHighlighted={explanation_idx === feature.original_idx[i]}
                            />
                        ))}
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <MaxActivatingExample tokens={feature.max_act_examples[0]} values={feature.max_act_values[0]} />
                    </AccordionSummary>
                    <AccordionDetails>
                        {feature.max_act_examples.map((example, i) => (
                            <MaxActivatingExample tokens={example} key={i} values={feature.max_act_values[i]} />
                        ))}
                    </AccordionDetails>
                </Accordion>
            </Grid>
        </Grid>
    );
}

export function Dashboard({ features }: DashboardProps) {
    return (
        <div id="dashboard">
            <ul>
                {features.map((feature, i) => (
                    <DashboardItem key={i} feature={feature} />
                ))}
            </ul>
        </div>
    );
}
