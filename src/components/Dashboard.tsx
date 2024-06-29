import React from "react";
import { Feature } from "../dataset";
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid } from "@mui/material";
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

function SelfEExample( {example, scale} : {example: string, scale: number} ) {
    return (
        <div className="example">
            Scale: {scale.toFixed(2)} | "{example}
        </div>
    );
}

function DashboardItem({ feature }: { feature: Feature }) {
    return (
        <Grid container spacing={2}>
            <Grid item xs={3}>
                <Box>
                    <h3>Feature {feature.feature}</h3>
                    <p>Layer {feature.layer}</p>
                </Box>
                <Plot
                    data={[
                    {
                        x: feature.scales,
                        y: feature.self_similarity,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Self-similarity',
                        marker: {color: 'blue'},
                    },
                    {
                        x: feature.scales,
                        y: feature.entropy,
                        name: 'Entropy',
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: {color: 'green'},
                    },
                    {
                        x: feature.scales,
                        y: feature.cross_entropy,
                        name: 'Cross-entropy',
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: {color: 'orange'},
                    }
                    ]}
                    layout={ {
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
                        legend: {x: 0.4, y: 0.5},
                        xaxis: {title: 'Scale'},
                        yaxis: {showticklabels: false}
                    } }
                    style={{borderRadius: '0px'}}
                />
            </Grid>
            <Grid item xs={9}>
                <p>{feature.autoint_explanation}</p>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}>
                        <SelfEExample example={feature.selfe_explanations[0]} scale={feature.selfe_scales[0]} />
                    </AccordionSummary>
                    <AccordionDetails>
                        {feature.selfe_explanations.map((explanation, i) => (
                            <SelfEExample key={i}  example={explanation} scale={feature.selfe_scales[i]}/>
                        ))}
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}>
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