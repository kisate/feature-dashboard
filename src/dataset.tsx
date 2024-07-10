import axios from 'axios';

const base_urls = new Map<number, string>([
    [6, "https://datasets-server.huggingface.co/rows?dataset=kisate-team/generated-explanations&config=default&split=train&",],
    [12, "https://datasets-server.huggingface.co/rows?dataset=kisate-team/generated-explanations-12&config=default&split=train&",],
]);

const base_urls_filter = new Map<number, string>([
    [6, 'https://datasets-server.huggingface.co/filter?dataset=kisate-team/generated-explanations&config=default&split=train&where="feature"='],
    [12, 'https://datasets-server.huggingface.co/filter?dataset=kisate-team/generated-explanations-12&config=default&split=train&where="feature"='],
]);

export interface Feature {
    layer: number;
    feature: number;
    autoint_explanation: string;
    neuronpedia_link: string;
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
    selection_metric: number[];
}

function process_max_acts(max_acts: any): [string[][], number[][]] {
    const rawTokens: string[][] = max_acts.map((ma: any) => ma.tokens.map((t: any) => t.replace("▁", " ")));
    const rawValues: number[][] = max_acts.map((ma: any) => ma.values);

    const rawTokensJoin = rawTokens.map((t) => t.join(""));
    // Leave only unique token sequences
    
    var tokens = rawTokens.filter((t, i) => rawTokensJoin.indexOf(t.join("")) === i);
    var values = tokens.map((t) => rawValues[rawTokens.findIndex((rt) => rt.join("") === t.join(""))]);

    const firstNonZero = values.map((v) => v.findIndex((v) => v > 0));
    const lastNonZero = values.map((v) => v.length - 1 - v.slice().reverse().findIndex((v) => v > 0));

    tokens = tokens.map(
        (t, i) => t.slice(Math.max(firstNonZero[i] - 10, 0), Math.min(lastNonZero[i] + 10, t.length))
    );
    values = values.map(
        (v, i) => v.slice(Math.max(firstNonZero[i] - 10, 0), Math.min(lastNonZero[i] + 10, v.length))
    );

    const max_activation = Math.max(...values.map((v) => Math.max(...v)));

    const values_normalized = values.map((v) => v.map((v) => v / max_activation));

    // Sort examples and tokens by max activation
    const examples_sorted = tokens.map((tokens, i) => ({ tokens, values: values_normalized[i] }))
        .sort((a, b) => Math.max(...b.values) - Math.max(...a.values));

    const tokens_sorted = examples_sorted.map((e) => e.tokens);
    const values_sorted = examples_sorted.map((e) => e.values);

    return [tokens_sorted, values_sorted];
}

function sort_by_metric(texts: any[], scales: number[], metric: number[]): any[] {
    const scale_to_ind = scales.map((s) => Math.floor(s * metric.length));
    const sorted_texts = texts.map((t, i) => ({ text: t, ind: scale_to_ind[i] }))
        .sort((a, b) => metric[b.ind] - metric[a.ind])
        .map((t) => t.text);

    return sorted_texts;
}

function process_selfe_explanations(row: any, probe_layer: number, selection_metric: number[]): [string[], number[], number[]] {
    // Match the self-explanations with the scales and sort row.generations.texts using row.generations.scales

    const max_scale = row.settings.max_scale;
    const min_scale = row.settings.min_scale;
    
    const scales = row.generations.scales.map ((s: number) => (s - min_scale) / (max_scale - min_scale));
    const texts = row.generations.texts;

    const self_similarity = row.scale_tuning.selfsims[probe_layer]

    const sorted_texts = sort_by_metric(texts, scales, selection_metric);
    const sorted_scales = sort_by_metric(scales, scales, selection_metric).map((s) => s * (max_scale - min_scale) + min_scale);
    const original_idx = sort_by_metric(Array.from({length: scales.length}, (_, i) => i), scales, selection_metric);

    return [sorted_texts, sorted_scales, original_idx];
}

function normalize(values: number[]): number[] {
    const max_val = Math.max(...values);
    const min_val = Math.min(...values);
    return values.map((v) => (v - min_val) / (max_val - min_val));
}

function calculate_selection_metric(row: any, probe_layer: number, alpha: number, required_scale: number): number[] {
    const cross_entropy = row.scale_tuning.crossents[0];
    const normalized_ce = normalize(cross_entropy);

    const scales = row.scale_tuning.scales;
    const self_similarity = row.scale_tuning.selfsims[probe_layer];
    const self_similarity_normalized = normalize(self_similarity);

    const metric = normalized_ce.map((ce: any, i: any) => self_similarity_normalized[i] * alpha - ce * (1 - alpha));
    for (let i = 0; i < metric.length; i++) {
        if (scales[i] < required_scale) {
            metric[i] = Math.min(... metric);
        }
    }
    return metric;
}

function row_to_feature(row: any, layer: number, probe_layer: number, alpha: number, required_scale: number): Feature {

    const [max_act_examples, max_act_values] = process_max_acts(row.max_acts);
    const sm = calculate_selection_metric(row, probe_layer, alpha, required_scale);
    const [selfe_explanations, selfe_scales, original_idx] = process_selfe_explanations(row, probe_layer, sm);

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
        selection_metric: sm,
        original_idx: original_idx,
        neuronpedia_link: `https://www.neuronpedia.org/gemma-2b${layer === 12 ? '-it' : ''}/${layer}-res-jb/${row.feature}`,
    };
}

export async function get_feature_sample(layer: number, offset: number, length: number, probe_layer: number, alpha: number, required_scale: number): Promise<Feature[]> {
    const base_url = base_urls.get(layer)!;
    const url = base_url + `offset=${offset}&length=${length}`;

    const response = axios.get(url);

    return response.then((res) => {
        console.log(res.data);

        const features: Feature[] = res.data.rows.map((row: any) => row_to_feature(row.row, layer, probe_layer, alpha, required_scale));
        return features;
    });
}

export async function get_feature(layer: number, probe_layer: number, alpha: number, required_scale: number, feature_number: number): Promise<Feature[]> {
    const base_url = base_urls_filter.get(layer)!;
    const url = base_url + feature_number;

    const response = axios.get(url);

    return response.then((res) => {
        console.log(res.data);

        const features: Feature[] = res.data.rows.map((row: any) => row_to_feature(row.row, layer, probe_layer, alpha, required_scale));
        return features;
    });
}