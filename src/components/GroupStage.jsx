import React, { useMemo } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useTournament } from '../context/TournamentContext';
import { Trophy, Play, FastForward, GripVertical, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * GROUP STAGE - World Cup 2026
 * 
 * Clean, defensive implementation. No blurry artifacts.
 */

// --- SUB-COMPONENTS ---

const TeamRow = ({ team, rank, isQualified }) => {
  if (!team) return null;
  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg border mb-1 transition-all
      ${isQualified 
        ? 'bg-zinc-800/50 border-emerald-500/20' 
        : 'bg-zinc-900 border-transparent hover:bg-zinc-800'
      }
    `}>
      <span className={`
        w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full
        ${isQualified ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 bg-zinc-800'}
      `}>
        {rank}
      </span>
      <div className="w-6 h-6 flex items-center justify-center">
        <img 
          src={team.logo || `https://flagcdn.com/w40/${team.code || 'xx'}.png`} 
          alt={team.name} 
          className="w-5 h-5 object-contain" 
          onError={(e) => e.target.style.display = 'none'} 
        />
      </div>
      <div className="flex-1 font-medium text-sm text-zinc-200 truncate">
        {team.name}
      </div>
      <div className="flex items-center gap-4 text-xs tabular-nums text-zinc-400 font-medium">
        <span title="Played">{team.played || 0}</span>
        <span title="Goal Difference" className={(team.gd || 0) > 0 ? 'text-emerald-500' : (team.gd || 0) < 0 ? 'text-rose-500' : ''}>
          {(team.gd || 0) > 0 ? `+${team.gd}` : team.gd || 0}
        </span>
        <span title="Points" className="text-white font-bold w-4 text-right">
          {team.points || 0}
        </span>
      </div>
    </div>
  );
};

const GroupCard = ({ groupName, teams, matches, onSimulateGroup }) => {
  if (!teams) return null;
  const allPlayed = matches && matches.length > 0 && matches.every(m => m.played);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-zinc-100">{groupName} Grubu</h3>
        {!allPlayed && (
          <button 
            onClick={onSimulateGroup}
            className="text-[10px] uppercase font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 bg-emerald-500/5 hover:bg-emerald-500/10 px-2 py-1 rounded transition-all"
          >
            <FastForward size={10} /> Simüle Et
          </button>
        )}
      </div>

      {/* Standings */}
      <div className="flex-1 space-y-1 mb-4">
        {teams.map((team, i) => (
          <TeamRow key={team.id} team={team} rank={i + 1} isQualified={i < 2} />
        ))}
      </div>

      {/* Recent Match / Next Match Status */}
      <div className="mt-auto pt-3 border-t border-zinc-800/50">
        <div className="flex justify-between items-center text-xs text-zinc-500">
          <span>{matches ? matches.filter(m => m.played).length : 0} / {matches ? matches.length : 0} Maç</span>
          <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: matches && matches.length > 0 ? `${(matches.filter(m => m.played).length / matches.length) * 100}%` : '0%' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const GroupStage = () => {
  const { 
    groups, standings, groupMatches, simulateGroup, simulateAllGroups, 
    initializeKnockout, customThirdPlaceOrder, setCustomThirdPlaceOrder
  } = useTournament();

  const allMatchesPlayed = useMemo(() => {
    if (!groupMatches || Object.keys(groupMatches).length === 0) return false;
    return Object.values(groupMatches).every(matches => matches && matches.every(m => m.played));
  }, [groupMatches]);

  // Compute 3rd Place Table
  const thirdPlaceTeams = useMemo(() => {
    if (!standings || Object.keys(standings).length === 0) return [];
    return Object.keys(standings).map(groupKey => {
      const groupStandings = standings[groupKey];
      return (groupStandings && groupStandings.length >= 3) ? { ...groupStandings[2], group: groupKey } : null;
    }).filter(Boolean).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  }, [standings]);

  // Reorder logic for Drag & Drop
  const handleReorder = (newOrder) => {
    if (setCustomThirdPlaceOrder) {
      setCustomThirdPlaceOrder(newOrder.map(t => t.id));
    }
  };

  const displayThirdPlaces = useMemo(() => {
    if (!customThirdPlaceOrder || customThirdPlaceOrder.length === 0) return thirdPlaceTeams;
    return customThirdPlaceOrder.map(id => thirdPlaceTeams.find(t => t.id === id)).filter(Boolean)
        .concat(thirdPlaceTeams.filter(t => !customThirdPlaceOrder.includes(t.id)));
  }, [customThirdPlaceOrder, thirdPlaceTeams]);

  if (!groups || Object.keys(groups).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Zap className="text-zinc-700 w-12 h-12 mb-4" />
        <p className="text-zinc-500">Grup verileri yüklenemedi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* ACTION BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-xl shadow-black/20">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="text-emerald-400" size={20} />
            Grup Aşaması
          </h2>
          <p className="text-sm text-zinc-500">İlk 2 takım ve en iyi 8 üçüncü tur atlar.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {!allMatchesPlayed ? (
            <button 
              onClick={simulateAllGroups}
              className="flex-1 md:flex-none px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <FastForward size={18} /> Tümünü Simüle Et
            </button>
          ) : (
            <button 
              onClick={initializeKnockout}
              className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              Eleme Turuna Geç <Play size={18} />
            </button>
          )}
        </div>
      </div>

      {/* GROUPS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {Object.entries(groups).map(([groupName, teams]) => (
          <GroupCard 
            key={groupName}
            groupName={groupName}
            teams={standings && standings[groupName] ? standings[groupName] : teams}
            matches={groupMatches ? groupMatches[groupName] : []}
            onSimulateGroup={() => simulateGroup && simulateGroup(groupName)}
          />
        ))}
      </div>

      {/* THIRD PLACE TABLE (DRAGGABLE) */}
      {thirdPlaceTeams.length > 0 && (
        <div className="max-w-3xl mx-auto mt-12 bg-zinc-900/30 p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-2 mb-6 px-2">
            <AlertCircle className="text-amber-500" size={18} />
            <h3 className="font-bold text-zinc-200">En İyi Üçüncüler</h3>
            <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-wider">İlk 8 Tur Atlar</span>
          </div>
          
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <Reorder.Group axis="y" values={displayThirdPlaces} onReorder={handleReorder} className="divide-y divide-white/5">
              {displayThirdPlaces.map((team, index) => (
                <Reorder.Item key={team.id} value={team}>
                  <div className={`
                    flex items-center gap-4 p-4 cursor-grab active:cursor-grabbing hover:bg-white/[0.02] transition-colors
                    ${index < 8 ? 'bg-emerald-500/[0.03]' : 'opacity-40'}
                  `}>
                    <GripVertical className="text-zinc-700" size={16} />
                    <span className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${index < 8 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-3 flex-1">
                      <img 
                        src={team.logo || `https://flagcdn.com/w40/${team.code || 'xx'}.png`} 
                        className="w-5 h-5 object-contain" 
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <span className="text-sm font-semibold text-zinc-200">{team.name}</span>
                      <span className="text-[10px] text-zinc-600 font-bold bg-zinc-800 px-1.5 py-0.5 rounded uppercase">{team.group} Grubu</span>
                    </div>
                    <div className="flex gap-4 text-xs font-mono text-zinc-400">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-zinc-600">PUAN</span>
                        <span className="text-zinc-200 font-bold">{team.points}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-zinc-600">AV</span>
                        <span className={(team.gd || 0) > 0 ? 'text-emerald-500' : (team.gd || 0) < 0 ? 'text-rose-500' : 'text-zinc-400'}>
                          {(team.gd || 0) > 0 ? `+${team.gd}` : team.gd}
                        </span>
                      </div>
                    </div>
                    {index < 8 && <CheckCircle2 className="text-emerald-500" size={16} />}
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        </div>
      )}

    </div>
  );
};

export default GroupStage;
