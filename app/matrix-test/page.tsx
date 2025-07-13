import MatrixRain from '@/components/MatrixRain'

export default function MatrixTestPage() {
  return (
    <div className="min-h-screen bg-black relative">
      <MatrixRain />
      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="text-terminal-green text-2xl font-mono p-8 border border-terminal-green bg-black/80">
          MATRIX RAIN TEST
          <br />
          <span className="text-sm">You should see falling characters behind this box</span>
        </div>
      </div>
    </div>
  )
}