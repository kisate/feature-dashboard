import axios from 'axios';

const base_urls = new Map<number, string>([
    [6, "https://datasets-server.huggingface.co/rows?dataset=kisate-team/generated-explanations&config=default&split=train&",],
    [12, "https://datasets-server.huggingface.co/rows?dataset=kisate-team/generated-explanations-12&config=default&split=train&",],
]);

export interface Feature {
    layer: number;
    feature: number;
    autoint_explanation: string;
    selfe_explanations: string[];
    selfe_scales: number[];
    max_act_examples: string[][];
    max_act_values: number[][];

    scales: number[];
    self_similarity: number[];
    entropy: number[];
    cross_entropy: number[];
    optimal_scale: number;
    original_idx: number[];
}

function process_max_acts(max_acts: any): [string[][], number[][]] {
    const tokens: string[][] = max_acts.map((ma: any) => ma.tokens);
    const values: number[][] = max_acts.map((ma: any) => ma.values);

    const max_activation = Math.max(...values.map((v) => Math.max(...v)));

    const values_normalized = values.map((v) => v.map((v) => v / max_activation));

    // Sort examples and tokens by max activation
    const examples_sorted = tokens.map((tokens, i) => ({ tokens, values: values_normalized[i] }))
        .sort((a, b) => Math.max(...b.values) - Math.max(...a.values));

    const tokens_sorted = examples_sorted.map((e) => e.tokens);
    const values_sorted = examples_sorted.map((e) => e.values);

    return [tokens_sorted, values_sorted];
}

function sort_by_self_similarity(texts: any[], scales: number[], self_similarity: number[]): any[] {
    const scale_to_ind = scales.map((s) => Math.floor(s * self_similarity.length));
    const sorted_texts = texts.map((t, i) => ({ text: t, ind: scale_to_ind[i] }))
        .sort((a, b) => self_similarity[b.ind] - self_similarity[a.ind])
        .map((t) => t.text);

    return sorted_texts;
}

function process_selfe_explanations(row: any, probe_layer: number): [string[], number[], number[]] {
    // Match the self-explanations with the scales and sort row.generations.texts using row.generations.scales

    const max_scale = row.settings.max_scale;
    const min_scale = row.settings.min_scale;
    
    const scales = row.generations.scales.map ((s: number) => (s - min_scale) / (max_scale - min_scale));
    const texts = row.generations.texts;

    const self_similarity = row.scale_tuning.selfsims[probe_layer]

    const sorted_texts = sort_by_self_similarity(texts, scales, self_similarity);
    const sorted_scales = sort_by_self_similarity(scales, scales, self_similarity).map((s) => s * (max_scale - min_scale) + min_scale);
    const original_idx = sort_by_self_similarity(Array.from({length: scales.length}, (_, i) => i), scales, self_similarity);

    return [sorted_texts, sorted_scales, original_idx];
}

function row_to_feature(row: any, layer: number, probe_layer: number): Feature {

    const [max_act_examples, max_act_values] = process_max_acts(row.max_acts);
    const [selfe_explanations, selfe_scales, original_idx] = process_selfe_explanations(row, probe_layer);

    return {
        layer: layer,
        feature: row.feature,
        autoint_explanation: row.explanation,
        selfe_explanations: selfe_explanations,
        selfe_scales: selfe_scales,
        max_act_examples: max_act_examples,
        max_act_values: max_act_values,
        optimal_scale: 0.0,
        scales: row.scale_tuning.scales,
        self_similarity: row.scale_tuning.selfsims[probe_layer],
        entropy: row.scale_tuning.entropy,
        cross_entropy: row.scale_tuning.crossents[0],
        original_idx: original_idx
    };
}

export async function get_feature_sample(layer: number, offset: number, length: number, probe_layer: number): Promise<Feature[]> {
    const base_url = base_urls.get(layer)!;
    const url = base_url + `offset=${offset}&length=${length}`;

    const response = axios.get(url);

    return response.then((res) => {
        console.log(res.data);

        const features: Feature[] = res.data.rows.map((row: any) => row_to_feature(row.row, layer, probe_layer));
        return features;
    });
}