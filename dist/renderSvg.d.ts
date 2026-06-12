import { ContributionData } from "./fetchContributions.js";
export type RenderOptions = {
    colorScheme?: "github-dark" | "dracula" | "nord" | "synthwave";
    cellSize?: number;
    cellGap?: number;
    cellRadius?: number;
    showTotal?: boolean;
    showMonths?: boolean;
    showDays?: boolean;
    title?: string;
    quote?: string;
};
export declare function renderSvg(data: ContributionData, opts?: RenderOptions): string;
