import axios from 'axios';
import { version } from 'react';

const base_urls = new Map<number, string>([
    [6, "https://datasets-server.huggingface.co/rows?dataset=kisate-team/generated-explanations&config=default&split=train&",],
    [12, "https://datasets-server.huggingface.co/rows?dataset=kisate-team/generated-explanations-12&config=default&split=train&",],
]);

const base_url_ours = "https://datasets-server.huggingface.co/filter?dataset=kisate-team/gemma-2b-suite-explanations&"

const base_urls_filter = new Map<number, string>([
    [6, 'https://datasets-server.huggingface.co/filter?dataset=kisate-team/generated-explanations&config=default&split=train&where="feature"='],
    [12, 'https://datasets-server.huggingface.co/filter?dataset=kisate-team/generated-explanations-12&config=default&split=train&where="feature"='],
]);



export interface SelfExplanations {
    selfe_explanations: string[];
    selfe_scales: number[];

    scales: number[];
    self_similarity: number[];
    entropy: number[];
    cross_entropy: number[];
    optimal_scale: number;
    original_idx: number[];
    selection_metric: number[];
}

export interface Feature {
    layer: number;
    feature: number;
    autoint_explanation: string;
    neuronpedia_link: string;
    max_act_examples: string[][];
    max_act_values: number[][];

    selfe_meaning: SelfExplanations;
    selfe_repeat: SelfExplanations;
}

function process_max_acts(max_acts: any): [string[][], number[][]] {
    if (max_acts === undefined) {
        return [[], []];
    }
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

function process_explanation(raw_text: string): string {
    const text = raw_text.replace(/(?:\r\n|\r|\n)/g, ' ');

    if (text.includes("<eos>")) {
        return text.split("<eos>")[0];
    }

    if (text[-1] === '"') {
        return text
    }

    return text + "...";
}

function process_selfe_explanations(max_scale: number, min_scale: number, generations: any, probe_layer: number, selection_metric: number[]): [string[], number[], number[]] {
    // Match the self-explanations with the scales and sort row.generations.texts using row.generations.scales    
    const scales = generations.scales.map ((s: number) => (s - min_scale) / (max_scale - min_scale));
    const texts = generations.texts.map ((t: string) => process_explanation(t));

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

function calculate_selection_metric(scale_tuning: any, probe_layer: number, alpha: number, required_scale: number): number[] {
    const normalized_ce = normalize(scale_tuning.crossents);

    const scales = scale_tuning.scales;
    const self_similarity = scale_tuning.selfsims[probe_layer];
    const self_similarity_normalized = normalize(self_similarity);

    const metric = normalized_ce.map((ce: any, i: any) => self_similarity_normalized[i] * alpha - ce * (1 - alpha));
    for (let i = 0; i < metric.length; i++) {
        if (scales[i] < required_scale) {
            metric[i] = Math.min(... metric);
        }
    }
    return metric;
}

function row_to_explanations(row: any, probe_layer: number, alpha: number, required_scale: number): SelfExplanations {
    const max_scale = row.settings.max_scale;
    const min_scale = row.settings.min_scale;
    const generations = row.generations;

    const selection_metric = calculate_selection_metric(row.scale_tuning, probe_layer, alpha, required_scale);
    const [selfe_explanations, selfe_scales, original_idx] = process_selfe_explanations(max_scale, min_scale, generations, probe_layer, selection_metric);

    return {
        selfe_explanations: selfe_explanations,
        selfe_scales: selfe_scales,
        scales: row.scale_tuning.scales,
        self_similarity: row.scale_tuning.selfsims[probe_layer],
        entropy: row.scale_tuning.entropy,
        cross_entropy: row.scale_tuning.crossents,
        optimal_scale: 0.0,
        original_idx: original_idx,
        selection_metric: selection_metric,
    };
}

function row_to_rep_explanations(row: any, probe_layer: number, alpha: number, required_scale: number): SelfExplanations {
    const max_scale = row.settings.max_scale;
    const min_scale = row.settings.min_scale;
    const generations = row.rep_generations;

    const selection_metric = calculate_selection_metric(row.rep_scale_tuning, probe_layer, alpha, required_scale);
    const [selfe_explanations, selfe_scales, original_idx] = process_selfe_explanations(max_scale, min_scale, generations, probe_layer, selection_metric);

    return {
        selfe_explanations: selfe_explanations,
        selfe_scales: selfe_scales,
        scales: row.rep_scale_tuning.scales,
        self_similarity: row.rep_scale_tuning.selfsims[probe_layer],
        entropy: row.rep_scale_tuning.entropy,
        cross_entropy: row.rep_scale_tuning.crossents,
        optimal_scale: 0.0,
        original_idx: original_idx,
        selection_metric: selection_metric,
    };
}

function build_url(version: string, layer: number, offset: number, length: number, feature: number | null): string {

    if (feature !== null) {
        if (version === "our-r") {
            return base_url_ours + 'config=l' + layer + '&split=train&where="feature"=' + feature;
        }
        else if (version === "jb-r") {
            return base_urls_filter.get(layer)! + feature;
        }
    }

    let base_url = "";
    if (version === "our-r") {
        base_url = base_url_ours + 'config=l' + layer + '&split=train&';
    } else if (version === "jb-r") {
        base_url = base_urls.get(layer)!;
    }

    return base_url + `offset=${offset}&length=${length}`;
}

function row_to_feature(row: any, layer: number, probe_layer: number, alpha: number, required_scale: number): Feature {
    
    if (version === "jb-r") {
        row.crossents = row.crossents[0];
    }
    
    
    const [max_act_examples, max_act_values] = process_max_acts(row.max_acts);
    const selfe_meaning = row_to_explanations(row, probe_layer, alpha, required_scale);
    const selfe_repeat = row_to_rep_explanations(row, probe_layer, alpha, required_scale);


    return {
        layer: layer,
        feature: row.feature,
        autoint_explanation: row.explanation,
        neuronpedia_link: `https://www.neuronpedia.org/gemma-2b${layer === 12 ? '-it' : ''}/${layer}-res-jb/${row.feature}`,
        max_act_examples: max_act_examples,
        max_act_values: max_act_values,
        selfe_meaning: selfe_meaning,
        selfe_repeat: selfe_repeat,
    };
}

export async function get_feature_sample(layer: number, offset: number, length: number, probe_layer: number, alpha: number, required_scale: number, version: string): Promise<Feature[]> {
    const url = build_url(version, layer, offset, length, null);
    console.log(url);

    const response = axios.get(url);

    return response.then((res) => {
        console.log(res.data);

        const features: Feature[] = res.data.rows.map((row: any) => row_to_feature(row.row, layer, probe_layer, alpha, required_scale));
        return features;
    });
}

export async function get_feature(layer: number, probe_layer: number, alpha: number, required_scale: number, feature_number: number, version: string): Promise<Feature[]> {
    const url = build_url(version, layer, 0, 1, feature_number);
    const response = axios.get(url);

    return response.then((res) => {
        console.log(res.data);

        const features: Feature[] = res.data.rows.map((row: any) => row_to_feature(row.row, layer, probe_layer, alpha, required_scale));
        return features;
    });
}