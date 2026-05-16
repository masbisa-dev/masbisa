import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import axios from "axios"

interface HealthStatus {
  status: string
  workspace: string
}

function App() {
  const [data, setData] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const checkHealth = () => {
    setLoading(true)
    axios.get("http://localhost:8000/api/health")
      .then((res) => {
        setData(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Connection failed:", err)
        setData(null)
        setLoading(false)
      })
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-slate-50 gap-4">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-emerald-400 lg:text-5xl">
          MASBISA 2.0
        </h1>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono mt-4 min-w-[280px]">
          {loading ? (
            <span className="text-slate-500 animate-pulse">Connecting to core engine...</span>
          ) : data ? (
            <div className="text-left space-y-1">
              <p><span className="text-slate-500">Backend:</span> <span className="text-emerald-400 font-bold">{data.status}</span></p>
              <p><span className="text-slate-500">Workspace:</span> <span className="text-sky-400">{data.workspace}</span></p>
            </div>
          ) : (
            <span className="text-rose-500 font-semibold">Connection Offline</span>
          )}
        </div>
      </div>
      
      {/* Attached the trigger handler here */}
      <Button 
        onClick={checkHealth}
        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold tracking-wide mt-2"
      >
        Refresh Status
      </Button>
    </div>
  )
}

export default App