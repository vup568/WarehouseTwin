import React from 'react'
import { useStore } from '../../state/store'

export const TopBar: React.FC = () => {
  const layers = useStore((s) => s.layers)
  const toggleLayer = useStore((s) => s.toggleLayer)
  const lightingMode = useStore((s) => s.lightingMode)
  const setLightingMode = useStore((s) => s.setLightingMode)
  const randomizeCargo = useStore((s) => s.randomizeCargo)

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
          <div className="brand-sub">R3F Architecture • Procedural Separated Cargo & Racks</div>
        </div>
      </div>

      {/* Control Actions & Layer Toggles */}
      <div className="controls-group">
        {/* ⭐ Cargo Separation Toggle (Main User Request) */}
        <button
          className={`control-btn primary-toggle ${layers.cargo ? 'active' : ''}`}
          onClick={() => toggleLayer('cargo')}
          title="Toggle Cargo visibility separately from Rack frames"
        >
          <span className="btn-icon">📦</span>
          <span>Cargo Layer: <strong>{layers.cargo ? 'VISIBLE' : 'HIDDEN'}</strong></span>
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

        {/* Walls Toggle */}
        <button
          className={`control-btn ${layers.walls ? 'active' : ''}`}
          onClick={() => toggleLayer('walls')}
          title="Toggle warehouse exterior walls"
        >
          <span className="btn-icon">🧱</span>
          <span>Walls</span>
        </button>

        {/* Randomize Cargo Seed */}
        <button
          className="control-btn"
          onClick={randomizeCargo}
          title="Randomize warehouse inventory distribution"
        >
          <span className="btn-icon">🎲</span>
          <span>Randomize Cargo</span>
        </button>

        {/* Lighting Toggle */}
        <button
          className="control-btn"
          onClick={() => setLightingMode(lightingMode === 'industrial' ? 'day' : 'industrial')}
          title="Toggle lighting mood"
        >
          <span className="btn-icon">{lightingMode === 'industrial' ? '🌙' : '☀️'}</span>
          <span>{lightingMode === 'industrial' ? 'Industrial' : 'Daylight'}</span>
        </button>
      </div>
    </header>
  )
}
