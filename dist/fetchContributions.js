const LEVEL_MAP = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
};
export const getLevelIndex = (level) => LEVEL_MAP[level] ?? 0;
export async function fetchContributions(username, token) {
    const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;
    const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            Authorization: `bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables: { username } }),
    });
    if (!res.ok) {
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    if (json.errors) {
        throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
    }
    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
        throw new Error(`User "${username}" not found or has no contribution data.`);
    }
    return {
        username,
        totalContributions: calendar.totalContributions,
        weeks: calendar.weeks,
    };
}
