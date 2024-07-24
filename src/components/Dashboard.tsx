import React from "react";
import { Feature } from "../dataset";
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Typography, Link } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import "./Dashboard.css";
import { ScaleTuningPlot } from "./DashboardComponents";

interface DashboardProps {
    features: Feature[];
}

function MaxActivatingExample({ tokens, values }: { tokens: string[], values: number[] }) {
    return (
        <div className="example" style={{
            paddingBottom: '0.2rem',
            paddingTop: '0.2rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            fontSize: '0.8rem'
        }}>
            {tokens.map((token, i) => (
                <span
                    key={i}
                    style={{
                        backgroundColor: `rgba(10, 220, 100, ${values[i] * 0.6})`,
                        display: 'inline-block'
                    }}
                >
                    {token}
                </span>
            ))}
        </div>
    );
}

function SelfEExample({ example, scale, isHighlighted }: { example: string, scale: number, isHighlighted: boolean }) {
    return (
        <div className="example" style={isHighlighted ? { backgroundColor: 'rgba(0, 0, 255, 0.5)', fontSize: '0.8rem' } : { fontSize: '0.8rem' }}>
            Scale: {scale.toFixed(2)} | "{example}
        </div>
    );
}

function DashboardItem({ feature }: { feature: Feature }) {
    const [expanded, setExpanded] = React.useState(false);
    const [expandedRep, setExpandedRep] = React.useState(false);
    const [explanation_idx, setExplanationIdx] = React.useState<number | null>(null);
    const [explanation_idx_rep, setExplanationIdxRep] = React.useState<number | null>(null);
    const handleChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? true : false);
        if (!isExpanded) {
            setExplanationIdx(null);
        }
    };
    const handleChangeRep = (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedRep(isExpanded ? true : false);
        if (!isExpanded) {
            setExplanationIdxRep(null);
        }
    }

    const handlePlotClickMeaning = (number: number) => {
        const fraction = number / feature.selfe_meaning.scales.length;

        const explanation_idx = Math.floor(fraction * feature.selfe_meaning.selfe_explanations.length);
        setExpanded(true);
        setExplanationIdx(explanation_idx);
    };


    const handlePlotClickRepeat = (number: number) => {
        const fraction = number / feature.selfe_repeat.scales.length;
        const explanation_idx_rep = Math.floor(fraction * feature.selfe_repeat.selfe_explanations.length);
        setExpandedRep(true);
        setExplanationIdxRep(explanation_idx_rep);
    };

    const maxSelfSimilarityMeaning = Math.max(...feature.selfe_meaning.self_similarity);
    const maxSelfSimilarityRepeat = Math.max(...feature.selfe_repeat.self_similarity);
    const backgroundColorMeaning = maxSelfSimilarityMeaning < 0.01 ? `rgba(255, 0, 0, ${1 - maxSelfSimilarityRepeat * 100})` : 'transparent';
    const backgroundColorRepeat = maxSelfSimilarityRepeat < 0.01 ? `rgba(255, 0, 0, ${1 - maxSelfSimilarityRepeat * 100})` : 'transparent';

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
                        Max self similarity (meaning): <span style={{ backgroundColor: backgroundColorMeaning, padding: '2px 4px', borderRadius: '4px' }}>{maxSelfSimilarityMeaning.toFixed(4)}</span>
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Max self similarity (repeat): <span style={{ backgroundColor: backgroundColorRepeat, padding: '2px 4px', borderRadius: '4px' }}>{maxSelfSimilarityRepeat.toFixed(4)}</span>
                    </Typography>
                </Box>
                <ScaleTuningPlot title={'Scale tuning (Meaning)'} explanations={feature.selfe_meaning} handlePlotClick={handlePlotClickMeaning} />
                <ScaleTuningPlot title={'Scale tuning (Repeat)'} explanations={feature.selfe_repeat} handlePlotClick={handlePlotClickRepeat} />
            </Grid>
            <Grid item xs={9}>
                <Typography variant="body1" sx={{ fontSize: '1.2rem' }}><Link href={feature.neuronpedia_link} data-title={'Open on Neuronpedia'}>Neuronpedia explanation: {feature.autoint_explanation}</Link></Typography>
                <Accordion expanded={expanded} onChange={handleChange}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Meaning SE</Typography>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            {feature.selfe_meaning.selfe_explanations.slice(0, 3).map((explanation, i) => (
                                <SelfEExample key={i} example={explanation} scale={feature.selfe_meaning.selfe_scales[i]}
                                    isHighlighted={false}
                                />
                            ))}
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>
                        {feature.selfe_meaning.selfe_explanations.map((explanation, i) => (
                            <SelfEExample key={i} example={explanation} scale={feature.selfe_meaning.selfe_scales[i]}
                                isHighlighted={explanation_idx === feature.selfe_meaning.original_idx[i]}
                            />
                        ))}
                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={expandedRep} onChange={handleChangeRep}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Repeat SE</Typography>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            {feature.selfe_repeat.selfe_explanations.slice(0, 3).map((explanation, i) => (
                                <SelfEExample key={i} example={explanation} scale={feature.selfe_repeat.selfe_scales[i]}
                                    isHighlighted={false}
                                />
                            ))}
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>
                        {feature.selfe_repeat.selfe_explanations.map((explanation, i) => (
                            <SelfEExample key={i} example={explanation} scale={feature.selfe_repeat.selfe_scales[i]}
                                isHighlighted={explanation_idx_rep === feature.selfe_repeat.original_idx[i]}
                            />
                        ))}
                    </AccordionDetails>
                </Accordion>
                
                {feature.max_act_examples.length > 0 && <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <MaxActivatingExample tokens={feature.max_act_examples[0]} values={feature.max_act_values[0]} />
                    </AccordionSummary>
                    <AccordionDetails>
                        {feature.max_act_examples.map((example, i) => (
                            <MaxActivatingExample tokens={example} key={i} values={feature.max_act_values[i]} />
                        ))}
                    </AccordionDetails>
                </Accordion>}
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
