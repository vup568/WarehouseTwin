# Roof elevation 25 m — narrow review

Date: 2026-10-03. Scope: raise the existing AWS roof from 10 m to 25 m; preserve everything else.

Verdict: PASS for scope and static dependency review. No blocking finding.

- Exact-byte check: replacing only `heightM: 25` with the previous `heightM: 10` restores the captured V1 layout SHA-256 `36b3257e61a4d4454f79689a0e87c8ccbab7fc88d346b5c2cb3e53650db1519e`. All other layout data is unchanged.
- AWS roof placement already reads `warehouse.heightM`; its model, materials, footprint, scale and visibility logic are unchanged. Floor remains at Y = 0.
- Before/after SHA-256 checks confirm ten scene/data/store files are byte-identical, including lighting, camera configuration, industrial rack geometry, cargo and floor markings.
- Rack height still derives from six levels × 0.78 m. Scene camera derives from the unchanged footprint; lighting position is unchanged. Sensor camera stays at 4.5 m.
- Validator and roof assertion now expect 25 m; obsolete 10 m is rejected. UI height labels read the same layout value. Visual evidence uses a separate `roof-25m-visuals` output directory, preserving prior captures.
- `git diff --check`: exit 0. Index remains empty; no staging, commit, push or cleanup performed. Existing unrelated working-tree changes were preserved.

Fresh test/build and browser verification are handled separately by the implementation/testing agents; this review does not claim visual verification.
