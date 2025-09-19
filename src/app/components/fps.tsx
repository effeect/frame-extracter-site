//Simple selector for the FPS for the Extract function
import React from "react"

// Values for the FPS
interface FPSSelectorProps {
    fps: number;
    onChange: (fps: number) => void;
}

export default function FramesPerSecSelector({fps,onChange} : FPSSelectorProps){
    return(<>
    <label>
      Select FPS:
      <select value={fps} onChange={(e) => onChange(Number(e.target.value))} style={{ marginLeft: '0.5rem' }}>
        {[1, 2, 5, 10, 15, 30].map((rate) => (
          <option key={rate} value={rate}>{rate} FPS</option>
        ))}
      </select>
    </label>
    </>)
}