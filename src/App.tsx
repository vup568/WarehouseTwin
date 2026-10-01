import React from 'react'
import { Scene3D } from './components/scene/Scene3D'
import { TopBar } from './components/shell/TopBar'
import { useStore } from './state/store'
import { RACK_LAYOUT } from './data/rack_layout'
import { WAREHOUSE_ZONES } from './data/zone_layout'

export const App: React.FC = () => {
  const layers = useStore((s) => s.layers)
  const zoneStatuses = useStore((s) => s.zoneStatuses)

  const congestedCount = Object.values(zoneStatuses).filter((st) => st === 'CONGESTED').length
  const blockedCount = Object.values(zoneStatuses).filter((st) => st === 'BLOCKED').length

  return (
    <div className="app-container">
      {/* Top Controls Bar */}
      <TopBar />

      {/* 3D Viewport with R3F Canvas */}
      <main className="viewport-3d">
        <Scene3D />
      </main>

      {/* Bottom Information Card */}
      <aside className="bottom-info-card">
        <div className="card-title">
          <span>🏭</span>
          <span>Digital Twin Logistics Monitor</span>
        </div>
        <p className="card-desc">
          Phase 1 + 2 active: Decoupled cargo InstancedMeshes + Interactive Floor Zones. Click any 
          <strong> Zone floor or tag</strong> to focus the camera, or click the badge to toggle status.
        </p>

        <div className="card-stat-row">
          <div className="stat-item">
            <span className="stat-num">{RACK_LAYOUT.length}</span>
            <span className="stat-label">Racks</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{WAREHOUSE_ZONES.length}</span>
            <span className="stat-label">Zones</span>
          </div>
          <div className="stat-item">
            <span className="stat-num" style={{ color: layers.cargo ? '#34d399' : '#f87171' }}>
              {layers.cargo ? 'LOADED' : 'EMPTY'}
            </span>
            <span className="stat-label">Cargo State</span>
          </div>
          <div className="stat-item">
            <span
              className="stat-num"
              style={{
                color: blockedCount > 0 ? '#ef4444' : congestedCount > 0 ? '#f59e0b' : '#34d399'
              }}
            >
              {blockedCount > 0 ? `${blockedCount} BLOCKED` : congestedCount > 0 ? `${congestedCount} SLOW` : 'NORMAL'}
            </span>
            <span className="stat-label">Traffic Status</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default App
