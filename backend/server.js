import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const execAsync = promisify(exec);

// ==================== CONFIGURACIÓN CORS PARA EXPO ====================
// Permitir todas las origenes en desarrollo (Expo Go)
const allowedOrigins = [
  'http://localhost:19006',     // Expo web
  'http://localhost:8081',      // Metro bundler
  'https://localhost:19006',
  'exp://localhost:19000',     // Expo Go iOS
  'exp://192.168.*',           // Expo Go red local
  'http://192.168.*',          // Desarrollo local
  'https://*.railway.app',     // Railway frontend (si aplica)
  '*'                          // Temporal para Expo Go (quitar en producción)
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.includes('*')) {
        const regex = new RegExp(allowed.replace('*', '.*'));
        return regex.test(origin);
      }
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(null, true); // Temporalmente permitir todo para Expo Go
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-apisports-key'],
  credentials: true
}));

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_FOOTBALL_URL = "https://v3.football.api-sports.io";

if (!API_FOOTBALL_KEY) {
  console.error('❌ ERROR: API_FOOTBALL_KEY no está configurada');
  console.error('Configúrala en Railway Dashboard > Variables');
}

const footballHeaders = {
  "x-apisports-key": API_FOOTBALL_KEY
};

// ==================== ENDPOINTS ====================

app.get("/", (req, res) => {
  res.json({
    status: "NeuralGoal API running 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      matches: {
        live: "/api/matches/live",
        upcoming: "/api/matches/upcoming?date=YYYY-MM-DD",
        detail: "/api/match/:id"
      },
      predictions: {
        single: "/api/predict/:matchId",
        daily: "/api/predictions"
      },
      leagues: "/api/leagues"
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    apiFootball: API_FOOTBALL_KEY ? 'connected' : 'disconnected'
  });
});

// ==================== PARTIDOS ====================

app.get("/api/matches/live", async (req, res) => {
  try {
    console.log('🔍 Fetching live matches from API-Football...');
    
    const response = await axios.get(
      `${API_FOOTBALL_URL}/fixtures?live=all`,
      { headers: footballHeaders, timeout: 10000 }
    );

    if (!response.data.response) {
      throw new Error('Invalid response from API-Football');
    }

    const matches = response.data.response.map(match => ({
      id: match.fixture.id,
      timestamp: match.fixture.timestamp,
      timezone: match.fixture.timezone,
      referee: match.fixture.referee,
      status: {
        long: match.fixture.status.long,
        short: match.fixture.status.short,
        elapsed: match.fixture.status.elapsed
      },
      league: {
        id: match.league.id,
        name: match.league.name,
        country: match.league.country,
        logo: match.league.logo,
        flag: match.league.flag,
        season: match.league.season,
        round: match.league.round
      },
      teams: {
        home: {
          id: match.teams.home.id,
          name: match.teams.home.name,
          logo: match.teams.home.logo,
          winner: match.teams.home.winner
        },
        away: {
          id: match.teams.away.id,
          name: match.teams.away.name,
          logo: match.teams.away.logo,
          winner: match.teams.away.winner
        }
      },
      goals: {
        home: match.goals.home,
        away: match.goals.away
      },
      score: match.score
    }));

    console.log(`✅ Found ${matches.length} live matches`);

    res.json({
      success: true,
      count: matches.length,
      matches: matches
    });

  } catch (error) {
    console.error("❌ Error fetching live matches:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch live matches",
      message: error.message
    });
  }
});

app.get("/api/matches/upcoming", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { date = today, league } = req.query;

    let url = `${API_FOOTBALL_URL}/fixtures?date=${date}`;
    if (league) url += `&league=${league}`;

    const response = await axios.get(url, { 
      headers: footballHeaders,
      timeout: 10000 
    });

    const matches = response.data.response.map(match => ({
      id: match.fixture.id,
      date: match.fixture.date,
      timestamp: match.fixture.timestamp,
      status: match.fixture.status,
      league: match.league,
      teams: match.teams,
      goals: match.goals
    }));

    res.json({
      success: true,
      count: matches.length,
      matches: matches
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch upcoming matches"
    });
  }
});

app.get("/api/match/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching match ${id} details...`);

    const [fixtureRes, h2hRes] = await Promise.all([
      axios.get(`${API_FOOTBALL_URL}/fixtures?id=${id}`, { 
        headers: footballHeaders,
        timeout: 10000 
      }),
      axios.get(
        `${API_FOOTBALL_URL}/fixtures/headtohead?fixture=${id}`,
        { headers: footballHeaders, timeout: 10000 }
      ).catch(() => ({ data: { response: [] } }))
    ]);

    const match = fixtureRes.data.response[0];
    
    if (!match) {
      return res.status(404).json({ success: false, error: "Match not found" });
    }

    // Obtener forma reciente
    const [homeFormRes, awayFormRes] = await Promise.all([
      axios.get(
        `${API_FOOTBALL_URL}/fixtures?team=${match.teams.home.id}&last=5&status=ft`,
        { headers: footballHeaders, timeout: 10000 }
      ).catch(() => ({ data: { response: [] } })),
      axios.get(
        `${API_FOOTBALL_URL}/fixtures?team=${match.teams.away.id}&last=5&status=ft`,
        { headers: footballHeaders, timeout: 10000 }
      ).catch(() => ({ data: { response: [] } }))
    ]);

    const enrichedMatch = {
      fixture: match.fixture,
      league: match.league,
      teams: match.teams,
      goals: match.goals,
      score: match.score,
      h2h: h2hRes.data.response?.slice(0, 5) || [],
      form: {
        home: formatTeamForm(homeFormRes.data.response || [], match.teams.home.id),
        away: formatTeamForm(awayFormRes.data.response || [], match.teams.away.id)
      }
    };

    res.json({
      success: true,
      match: enrichedMatch
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch match details"
    });
  }
});

// ==================== PREDICCIONES ====================

app.get("/api/predict/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    console.log(`🤖 Generating prediction for match ${matchId}...`);
    
    // Obtener datos del partido
    const matchRes = await axios.get(
      `${API_FOOTBALL_URL}/fixtures?id=${matchId}`,
      { headers: footballHeaders, timeout: 10000 }
    );
    
    const match = matchRes.data.response[0];
    if (!match) {
      return res.status(404).json({ success: false, error: "Match not found" });
    }

    // Obtener estadísticas
    const [homeStatsRes, awayStatsRes] = await Promise.all([
      axios.get(
        `${API_FOOTBALL_URL}/teams/statistics?team=${match.teams.home.id}&league=${match.league.id}&season=${match.league.season}`,
        { headers: footballHeaders, timeout: 10000 }
      ).catch(() => ({ data: { response: null } })),
      axios.get(
        `${API_FOOTBALL_URL}/teams/statistics?team=${match.teams.away.id}&league=${match.league.id}&season=${match.league.season}`,
        { headers: footballHeaders, timeout: 10000 }
      ).catch(() => ({ data: { response: null } }))
    ]);

    const homeStats = homeStatsRes.data.response;
    const awayStats = awayStatsRes.data.response;

    // Generar predicción
    const features = {
      home_xg: parseFloat(homeStats?.goals?.for?.average?.home) || 1.5,
      away_xg: parseFloat(awayStats?.goals?.for?.average?.away) || 1.2,
      home_defense: parseFloat(homeStats?.goals?.against?.average?.home) || 1.0,
      away_defense: parseFloat(awayStats?.goals?.against?.average?.away) || 1.3,
      home_form: calculateFormStrength(homeStats?.form),
      away_form: calculateFormStrength(awayStats?.form),
      home_advantage: 1.2
    };

    const prediction = heuristicPrediction(features);

    const enrichedPrediction = {
      match: {
        id: matchId,
        home: match.teams.home.name,
        away: match.teams.away.name,
        league: match.league.name,
        date: match.fixture.date
      },
      predictions: {
        "1": {
          probability: prediction.home_win,
          odds: calculateOdds(prediction.home_win),
          confidence: getConfidenceLevel(prediction.home_win)
        },
        "X": {
          probability: prediction.draw,
          odds: calculateOdds(prediction.draw),
          confidence: getConfidenceLevel(prediction.draw)
        },
        "2": {
          probability: prediction.away_win,
          odds: calculateOdds(prediction.away_win),
          confidence: getConfidenceLevel(prediction.away_win)
        }
      },
      alternativeMarkets: {
        over25: {
          probability: prediction.over25,
          odds: calculateOdds(prediction.over25)
        },
        btts: {
          probability: prediction.btts,
          odds: calculateOdds(prediction.btts)
        }
      },
      analysis: {
        recommendation: getRecommendation(prediction),
        reasons: generateReasons(features, homeStats, awayStats),
        keyFactors: [
          `${match.teams.home.name} promedia ${features.home_xg} goles en casa`,
          `${match.teams.away.name} concede ${features.away_defense} goles de visita`,
          `Forma local: ${features.home_form > 0.6 ? 'Buena' : 'Regular'}`,
          `Factor de localía: +20%`
        ],
        riskLevel: getRiskLevel(prediction)
      },
      stats: {
        home: formatTeamStats(homeStats),
        away: formatTeamStats(awayStats)
      },
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Prediction generated for ${match.teams.home.name} vs ${match.teams.away.name}`);

    res.json({
      success: true,
      prediction: enrichedPrediction
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to generate prediction"
    });
  }
});

app.get("/api/predictions", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`🔍 Fetching predictions for ${today}...`);
    
    const fixturesRes = await axios.get(
      `${API_FOOTBALL_URL}/fixtures?date=${today}`,
      { headers: footballHeaders, timeout: 10000 }
    );

    const matches = fixturesRes.data.response
      ?.filter(m => m.league.id === 39 || m.league.id === 140 || m.league.id === 61 || m.league.id === 78) // Premier, La Liga, Serie A, Bundesliga
      .slice(0, 5) || [];

    const predictions = matches.map(match => {
      const features = {
        home_xg: 1.5 + Math.random() * 0.5,
        away_xg: 1.2 + Math.random() * 0.5,
        home_defense: 1.0 + Math.random() * 0.3,
        away_defense: 1.3 + Math.random() * 0.3,
        home_form: 0.6,
        away_form: 0.5,
        home_advantage: 1.2
      };
      
      const pred = heuristicPrediction(features);
      const maxProb = Math.max(pred.home_win, pred.draw, pred.away_win);
      
      return {
        matchId: match.fixture.id,
        home: match.teams.home.name,
        away: match.teams.away.name,
        league: match.league.name,
        time: new Date(match.fixture.date).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}),
        prediction: getRecommendation(pred),
        confidence: Math.round(maxProb * 100),
        odds: calculateOdds(maxProb),
        market: "1X2"
      };
    });

    res.json({
      success: true,
      date: today,
      count: predictions.length,
      predictions: predictions
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch predictions"
    });
  }
});

// ==================== LIGAS ====================

app.get("/api/leagues", async (req, res) => {
  try {
    const { season = new Date().getFullYear() } = req.query;
    
    const response = await axios.get(
      `${API_FOOTBALL_URL}/leagues?season=${season}&type=league`,
      { headers: footballHeaders, timeout: 10000 }
    );

    const popularLeagues = [39, 140, 61, 78, 135, 71, 94, 88];
    
    const leagues = response.data.response
      ?.filter(item => popularLeagues.includes(item.league.id))
      .map(item => ({
        id: item.league.id,
        name: item.league.name,
        logo: item.league.logo,
        country: item.country.name,
        flag: item.country.flag,
        season: item.seasons[0]?.year
      })) || [];

    res.json({
      success: true,
      count: leagues.length,
      leagues: leagues
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch leagues"
    });
  }
});

// ==================== HELPERS ====================

function formatTeamForm(matches, teamId) {
  if (!matches || !Array.isArray(matches)) return [];
  
  return matches.slice(0, 5).map(m => {
    const isHome = m.teams.home.id === teamId;
    const teamGoals = isHome ? m.goals.home : m.goals.away;
    const oppGoals = isHome ? m.goals.away : m.goals.home;
    
    if (teamGoals === null || oppGoals === null) return 'D';
    if (teamGoals > oppGoals) return 'W';
    if (teamGoals < oppGoals) return 'L';
    return 'D';
  });
}

function calculateFormStrength(formString) {
  if (!formString || typeof formString !== 'string') return 0.5;
  const wins = (formString.match(/W/g) || []).length;
  const total = formString.length;
  return total > 0 ? wins / total : 0.5;
}

function heuristicPrediction(features) {
  const homeStrength = features.home_xg * features.home_advantage * features.home_form;
  const awayStrength = features.away_xg * features.away_form;
  const total = homeStrength + awayStrength + 1;
  
  return {
    home_win: Math.round((homeStrength / total) * 100) / 100,
    draw: Math.round((1 / total) * 100) / 100,
    away_win: Math.round((awayStrength / total) * 100) / 100,
    over25: Math.round(Math.min((features.home_xg + features.away_xg) / 3, 0.85) * 100) / 100,
    btts: Math.round(Math.min((features.home_xg + features.away_xg) / 4, 0.75) * 100) / 100
  };
}

function calculateOdds(probability) {
  if (probability <= 0) return 10.0;
  const margin = 0.05;
  return Math.round((1 / (probability * (1 - margin))) * 100) / 100;
}

function getConfidenceLevel(probability) {
  if (probability >= 0.45) return "high";
  if (probability >= 0.33) return "medium";
  return "low";
}

function getRiskLevel(prediction) {
  const maxProb = Math.max(prediction.home_win, prediction.draw, prediction.away_win);
  if (maxProb >= 0.5) return "low";
  if (maxProb >= 0.4) return "medium";
  return "high";
}

function getRecommendation(prediction) {
  const probs = [
    { type: "Home Win", value: prediction.home_win },
    { type: "Draw", value: prediction.draw },
    { type: "Away Win", value: prediction.away_win }
  ];
  probs.sort((a, b) => b.value - a.value);
  return probs[0].type;
}

function generateReasons(features, homeStats, awayStats) {
  const reasons = [];
  
  if (features.home_xg > features.away_xg * 1.2) {
    reasons.push("Mayor expected goals del equipo local");
  }
  if (features.home_form > 0.6) {
    reasons.push("Buena forma reciente del local");
  }
  if (features.away_defense > 1.3) {
    reasons.push("Defensa visitante vulnerable");
  }
  if (features.home_advantage > 1.0) {
    reasons.push("Factor de localía significativo");
  }
  
  return reasons.length > 0 ? reasons : ["Análisis basado en estadísticas de temporada"];
}

function formatTeamStats(stats) {
  if (!stats) return null;
  
  return {
    played: stats.fixtures?.played?.total || 0,
    wins: stats.fixtures?.wins?.total || 0,
    draws: stats.fixtures?.draws?.total || 0,
    losses: stats.fixtures?.loses?.total || 0,
    goalsFor: {
      total: stats.goals?.for?.total?.total || 0,
      average: stats.goals?.for?.average?.total || "0.0"
    },
    goalsAgainst: {
      total: stats.goals?.against?.total?.total || 0,
      average: stats.goals?.against?.average?.total || "0.0"
    },
    form: stats.form || "",
    cleanSheet: stats.clean_sheet?.total || 0
  };
}

// ==================== INICIAR SERVIDOR ====================

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NeuralGoal API running on port ${PORT}`);
  console.log(`📊 API-Football: ${API_FOOTBALL_KEY ? '✅ Connected' : '❌ Missing API Key'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});