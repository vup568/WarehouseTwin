import React from 'react'
import { Scene3D } from './components/scene/Scene3D'
import { TopBar } from './components/shell/TopBar'
import { useStore } from './state/store'
import { DENSO_LAYOUT_V1 } from './data/denso-layout-v1'
import { INDUSTRIAL_RACK_SLOTS } from './data/denso-industrial-racks'

export const App: React.FC = () => {
  const layers = useStore((s) => s.layers)
  const totalPalletPositions = INDUSTRIAL_RACK_SLOTS.length

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
          Sàn/mái AWS; mái {DENSO_LAYOUT_V1.warehouse.heightM} m, không đèn treo, tường tạm ẩn.
          Rack đôi 6 × 10 × 2; tắt Cargo để kiểm tra deck, dầm đỡ và giằng.
        </p>
        <div className="marking-legend" aria-label="Chú giải vạch sàn">
          <span style={{ color: '#eab308' }}>● Inbound</span><span style={{ color: '#a855f7' }}>● Outbound</span>
          <span style={{ color: '#ea580c' }}>● Forklift</span><span style={{ color: '#2563eb' }}>● AGV</span>
          <span style={{ color: '#16a34a' }}>● AMR</span>
        </div>

        <div className="card-stat-row">
          <div className="stat-item">
            <span className="stat-num">{DENSO_LAYOUT_V1.rackBlocks.length}</span>
            <span className="stat-label">Double Racks</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{totalPalletPositions.toLocaleString()}</span>
            <span className="stat-label">Pallet Positions</span>
          </div>
          <div className="stat-item">
            <span className="stat-num" style={{ color: layers.cargo ? '#34d399' : '#f87171' }}>
              {layers.cargo ? 'VISIBLE' : 'HIDDEN'}
            </span>
            <span className="stat-label">Cargo Layer</span>
          </div>
          <div className="stat-item">
            <span
              className="stat-num"
              style={{ color: '#38bdf8' }}
            >
              {DENSO_LAYOUT_V1.operationalCells?.length ?? 0} CELLS
            </span>
            <span className="stat-label">Operational Cells</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default App
