// src/services/espnApi.js
// ESPN Hidden API - No key required, free, unofficial
// Fallback when football-data.org key is missing or fails

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

class EspnApi {
  async _fetch(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }
    return response.json();
  }

  // Get FIFA World Cup scoreboard (matches with scores/status)
  async getWorldCupScoreboard(dates) {
    // dates format: YYYYMMDD-YYYYMMDD or just single date YYYYMMDD
    const url = dates 
      ? `/fifa.world/scoreboard?dates=${dates}` 
      : '/fifa.world/scoreboard';
    return this._fetch(url);
  }

  // Get upcoming/fixtures
  async getWorldCupSchedule() {
    return this._fetch('/fifa.world/scoreboard?limit=100');
  }
}

export const createEspnApi = () => new EspnApi();
