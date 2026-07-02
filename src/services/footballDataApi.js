// src/services/footballDataApi.js
// football-data.org API client - Free tier: 12 competitions, 10 req/min
// WC is included in free tier. Get your free key at: https://www.football-data.org/

const BASE_URL = 'https://api.football-data.org/v4';

class FootballDataApi {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  _headers() {
    return {
      'X-Auth-Token': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async _fetch(endpoint) {
    if (!this.apiKey) throw new Error('API key is required. Get free key at football-data.org');
    const response = await fetch(`${BASE_URL}${endpoint}`, { headers: this._headers() });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`football-data.org API error: ${response.status} ${text}`);
    }
    return response.json();
  }

  // Get all WC 2026 matches (fixtures + results)
  async getWorldCupMatches() {
    return this._fetch('/competitions/WC/matches');
  }

  // Get all CL matches
  async getChampionsLeagueMatches() {
    return this._fetch('/competitions/CL/matches');
  }

  // Get WC 2026 teams
  async getWorldCupTeams() {
    return this._fetch('/competitions/WC/teams');
  }

  // Get WC 2026 standings (groups)
  async getWorldCupStandings() {
    return this._fetch('/competitions/WC/standings');
  }

  // Get a specific match
  async getMatch(id) {
    return this._fetch(`/matches/${id}`);
  }
}

// Export singleton factory
export const createFootballDataApi = (apiKey) => new FootballDataApi(apiKey);
