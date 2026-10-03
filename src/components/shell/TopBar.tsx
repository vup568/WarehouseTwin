import React from 'react'
import { useStore } from '../../state/store'
import { DENSO_LAYOUT_V1 } from '../../data/denso-layout-v1'

export const TopBar: React.FC = () => {
  const layers = useStore((s) => s.layers)
  const toggleLayer = useStore((s) => s.toggleLayer)
  const lightingMode = useStore((s) => s.lightingMode)
  const setLightingMode = useStore((s) => s.setLightingMode)
  const randomizeCargo = useStore((s) => s.randomizeCargo)
  const cameraPresetId = useStore((s) => s.cameraPresetId)
  const setCameraPreset = useStore((s) => s.setCameraPreset)

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
            Denso TLIP Warehouse <span className="pill">DIGITAL TWIN</span>
          </div>
          <div className="brand-sub">AWS floor & roof • Mái {DENSO_LAYOUT_V1.warehouse.heightM} m • Industrial rack chờ duyệt</div>
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

        <button className={`control-btn ${layers.agv ? 'active' : ''}`} onClick={() => toggleLayer('agv')} title="Toggle dedicated AGV lane">
          <span className="btn-icon">🤖</span><span>AGV Lane</span>
        </button>

        <button className={`control-btn ${layers.amr ? 'active' : ''}`} onClick={() => toggleLayer('amr')} title="Toggle dedicated AMR lane">
          <span className="btn-icon">🧭</span><span>AMR Lane</span>
        </button>

        <button className={`control-btn ${layers.barriers ? 'active' : ''}`} onClick={() => toggleLayer('barriers')} title="Toggle safety and customs barriers">
          <span className="btn-icon">🚧</span><span>Barriers</span>
        </button>

        {/* Randomize Cargo Seed */}
        <button
          className="control-btn"
          onClick={randomizeCargo}
          title="Đổi dữ liệu hàng demo; không thay đổi kết cấu rack"
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
          <span>{lightingMode === 'industrial' ? 'Night / Industrial' : 'Day'}</span>
        </button>
        <select className="control-btn camera-select" aria-label="Góc nhìn kho" value={cameraPresetId ?? ''}
          onChange={event => setCameraPreset(event.target.value || null)}>
          <option value="">Góc nhìn…</option>
          {DENSO_LAYOUT_V1.cameraPresets.map(preset => <option key={preset.id} value={preset.id}>{preset.name}</option>)}
        </select>
      </div>
    </header>
  )
}
