import React from 'react'
import { useStore } from '../../state/store'
import { WAREHOUSE_ZONES } from '../../data/zone_layout'

export const TopBar: React.FC = () => {
  const layers = useStore((s) => s.layers)
  const toggleLayer = useStore((s) => s.toggleLayer)
  const lightingMode = useStore((s) => s.lightingMode)
  const setLightingMode = useStore((s) => s.setLightingMode)
  const randomizeCargo = useStore((s) => s.randomizeCargo)
  const simulateCongestion = useStore((s) => s.simulateCongestion)
  const resetZones = useStore((s) => s.resetZones)
  const selectedZoneId = useStore((s) => s.selectedZoneId)
  const setSelectedZoneId = useStore((s) => s.setSelectedZoneId)

  return (
    <header className="top-nav">
      {/* Brand & Badge */}
      <div className="brand-group">
        <div className="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
        <div>
          <div className="brand-title">
            AWS RoboMaker Warehouse <span className="pill">DIGITAL TWIN</span>
          </div>
          <div className="brand-sub">R3F Architecture • Procedural Cargo, Racks & Logistics Zones</div>
        </div>
      </div>

      {/* Control Actions & Layer Toggles */}
      <div className="controls-group">
        {/* ⭐ Cargo Separation Toggle */}
        <button
          className={`control-btn primary-toggle ${layers.cargo ? 'active' : ''}`}
          onClick={() => toggleLayer('cargo')}
          title="Toggle Cargo visibility separately from Rack frames"
        >
          <span className="btn-icon">📦</span>
          <span>Cargo: <strong>{layers.cargo ? 'ON' : 'OFF'}</strong></span>
        </button>

        {/* Rack Structure Toggle */}
        <button
          className={`control-btn ${layers.racks ? 'active' : ''}`}
          onClick={() => toggleLayer('racks')}
          title="Toggle steel rack frames"
        >
          <span className="btn-icon">🏗️</span>
          <span>Racks</span>
        </button>

        {/* 🧱 Walls Toggle (Restored) */}
        <button
          className={`control-btn ${layers.walls ? 'active' : ''}`}
          onClick={() => toggleLayer('walls')}
          title="Toggle warehouse exterior walls"
        >
          <span className="btn-icon">🧱</span>
          <span>Walls: <strong>{layers.walls ? 'ON' : 'OFF'}</strong></span>
        </button>

        {/* 🏠 Roof Toggle */}
        <button
          className={`control-btn ${layers.roof ? 'active' : ''}`}
          onClick={() => toggleLayer('roof')}
          title="Toggle warehouse ceiling and roof"
        >
          <span className="btn-icon">🏠</span>
          <span>Roof: <strong>{layers.roof ? 'ON' : 'OFF'}</strong></span>
        </button>

        {/* Phase 2: Zone Overlay Toggle */}
        <button
          className={`control-btn ${layers.zones ? 'active' : ''}`}
          onClick={() => toggleLayer('zones')}
          title="Toggle Logistics Zone Overlay on warehouse floor"
        >
          <span className="btn-icon">🗺️</span>
          <span>Zones: <strong>{layers.zones ? 'ON' : 'OFF'}</strong></span>
        </button>

        {/* Zone Fast Nav Jump */}
        {layers.zones && (
          <div className="zone-jump-group">
            {WAREHOUSE_ZONES.map((z) => (
              <button
                key={z.id}
                className={`zone-pill-btn ${selectedZoneId === z.id ? 'active' : ''}`}
                onClick={() => setSelectedZoneId(selectedZoneId === z.id ? null : z.id)}
                title={`Jump camera focus to ${z.name}`}
              >
                {z.code.replace('ZONE ', '')}
              </button>
            ))}
          </div>
        )}

        {/* Simulate Congestion Button */}
        {layers.zones && (
          <button
            className="control-btn warning-toggle"
            onClick={simulateCongestion}
            title="Inject traffic congestion and blocked zone scenario"
          >
            <span className="btn-icon">⚠️</span>
            <span>Sim Congestion</span>
          </button>
        )}

        {/* Reset Zones Button */}
        {layers.zones && (
          <button
            className="control-btn"
            onClick={resetZones}
            title="Reset all zones to NORMAL state"
          >
            <span className="btn-icon">🔄</span>
            <span>Reset</span>
          </button>
        )}

        {/* Randomize Cargo Seed */}
        <button
          className="control-btn"
          onClick={randomizeCargo}
          title="Randomize warehouse inventory distribution"
        >
          <span className="btn-icon">🎲</span>
          <span>Randomize</span>
        </button>

        {/* Lighting Toggle */}
        <button
          className="control-btn"
          onClick={() => setLightingMode(lightingMode === 'industrial' ? 'day' : 'industrial')}
          title="Toggle lighting mood"
        >
          <span className="btn-icon">{lightingMode === 'industrial' ? '🌙' : '☀️'}</span>
          <span>{lightingMode === 'industrial' ? 'Industrial' : 'Day'}</span>
        </button>
      </div>
    </header>
  )
}
