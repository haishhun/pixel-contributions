export type ContributionDay = {
    date: string;
    contributionCount: number;
    contributionLevel: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
};
export type ContributionWeek = {
    contributionDays: ContributionDay[];
};
export type ContributionData = {
    totalContributions: number;
    weeks: ContributionWeek[];
    username: string;
};
export declare const getLevelIndex: (level: ContributionDay["contributionLevel"]) => 0 | 1 | 2 | 3 | 4;
export declare function fetchContributions(username: string, token: string): Promise<ContributionData>;
