import React from 'react'
import { Scene3D } from './components/scene/Scene3D'
import { TopBar } from './components/shell/TopBar'
import { useStore } from './state/store'
import { RACK_LAYOUT } from './data/rack_layout'

export const App: React.FC = () => {
  const layers = useStore((s) => s.layers)

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
          <span>📦</span>
          <span>WareTwin Procedural Rack Engine</span>
        </div>
        <p className="card-desc">
          Racks and Cargo are separated into independent GPU InstancedMeshes. Click the 
          <strong> "Cargo Layer"</strong> button above to toggle cargo without altering the rack steel structures.
        </p>

        <div className="card-stat-row">
          <div className="stat-item">
            <span className="stat-num">{RACK_LAYOUT.length}</span>
            <span className="stat-label">Total Racks</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{RACK_LAYOUT.length * 4 * 2}</span>
            <span className="stat-label">Pallet Slots</span>
          </div>
          <div className="stat-item">
            <span className="stat-num" style={{ color: layers.cargo ? '#34d399' : '#f87171' }}>
              {layers.cargo ? 'Active' : 'Empty'}
            </span>
            <span className="stat-label">Cargo State</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default App
