import React, { useState, useEffect, useRef } from 'react'
import {
  Map,
  Music,
  Phone,
  Sliders,
  Globe,
  Camera,
  Layers,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Compass,
  CornerUpRight,
  Zap,
  Battery,
  BatteryCharging,
  AlertTriangle,
  Search,
  Home,
  Briefcase,
  Star,
  Wifi,
  Bluetooth,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Snowflake,
  ShieldCheck,
  Disc,
  X,
  PhoneCall,
  Tv,
  Activity,
  Mic,
  User,
  RefreshCw,
  Navigation2
} from 'lucide-react'
import { SiSpotify, SiWhatsapp, SiYoutube } from 'react-icons/si'
import './App.css'

// Mock Track Playlist
const PLAYLIST = [
  {
    title: 'Celestial Drive',
    artist: 'AURORA',
    type: 'Ambient Pop',
    duration: 372, // 6:12
    art: '/album_art.png',
    color: 'from-purple-600 via-pink-500 to-blue-500',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    title: 'Midnight Cruise',
    artist: "L'AVENUE",
    type: 'Synthwave',
    duration: 544, // 9:04
    art: 'gradient-1',
    color: 'from-pink-600 via-rose-500 to-orange-500',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    title: 'Neon Horizon',
    artist: 'KAVINSKY',
    type: 'Electronic',
    duration: 502, // 8:22
    art: 'gradient-2',
    color: 'from-red-600 via-purple-500 to-indigo-600',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  }
]

// Mock Destinations
const DESTINATIONS = {
  Home: {
    label: 'Home',
    eta: '10:42 AM',
    duration: '12 min',
    distance: '5.2 km',
    battery: '85%',
    instruction: 'Prepare to exit in 1.2 km on Shoreline Blvd'
  },
  Office: {
    label: 'Office',
    eta: '10:54 AM',
    duration: '24 min',
    distance: '18.5 km',
    battery: '78%',
    instruction: 'In 500m, turn left onto Kestrel Ave'
  },
  Favourites: {
    label: 'Scenic Ridge',
    eta: '11:18 AM',
    duration: '48 min',
    distance: '42.1 km',
    battery: '52%',
    instruction: 'Scenic route active. Continue straight on HWY 1'
  }
}

export default function App() {
  // 1. Core Operating State: 'NOMINAL', 'DEGRADED', 'FAILOVER'
  const [systemState, setSystemState] = useState('NOMINAL')

  // 2. Driver Cluster Styling (MBUX Classic, Sport, Discreet)
  // 'CLASSIC' = Dual gauges (Speedometer + Power/Regen meter)
  // 'SPORT' = Large single center tachometer gauge, red theme
  // 'DISCREET' = Minimalist digital dashboard
  const [clusterStyle, setClusterStyle] = useState('CLASSIC')

  // 3. User Profile State (Toggles ambient colors & drive setups)
  // 'Michael' = Comfort Mode, Neon Cyan/Blue ambient lighting
  // 'Serena' = Sport Mode, Hot Pink/Magenta ambient lighting
  const [driverProfile, setDriverProfile] = useState('Michael')
  const [ambientColor, setAmbientColor] = useState('CYAN') // 'CYAN' or 'MAGENTA'

  // 4. "Hey Mercedes" Voice Assistant Dialog
  const [voiceState, setVoiceState] = useState('INACTIVE') // INACTIVE, LISTENING, RESPONSE, ACTIONS, DONE
  const [voiceText, setVoiceText] = useState('')
  const voiceTimeoutRef = useRef(null)

  // 5. Drive & Speed Engine Simulation
  const [gear, setGear] = useState('D') // P, R, N, D
  const [speed, setSpeed] = useState(72)
  const [battery, setBattery] = useState(85)
  const [range, setRange] = useState(520)
  const [isSpeedWarning, setIsSpeedWarning] = useState(false)
  const speedLimit = 50

  // 6. Power Dial Engine Load (CLASSIC Dial Only)
  // Positive power when accelerating, negative regen when braking
  const [powerLoad, setPowerLoad] = useState(15) // % power load

  // 7. Navigation & Map Configuration
  const [activeDestination, setActiveDestination] = useState('Office')
  const [zoomScale, setZoomScale] = useState(1.1)
  const [is3D, setIs3D] = useState(true)

  // 8. Floating App Overlays: null, 'Phone', 'CarInfo', 'Browser', 'Camera', 'YouTube', 'ARNav'
  const [activeOverlay, setActiveOverlay] = useState(null)

  // 9. Phone App Active call state
  const [callActive, setCallActive] = useState(false)
  const [callTimer, setCallTimer] = useState(0)

  // 10. Playlist & Media Player
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [musicProgress, setMusicProgress] = useState(138) // seconds
  const [equalizerHeights, setEqualizerHeights] = useState([40, 20, 65, 30, 80, 45, 70, 25])

  // 11. Seat Heating / Cooling
  const [seatHeatDriver, setSeatHeatDriver] = useState(2)
  const [seatCoolDriver, setSeatCoolDriver] = useState(0)
  const [seatHeatPassenger, setSeatHeatPassenger] = useState(0)
  const [seatCoolPassenger, setSeatCoolPassenger] = useState(1)
  const [acTempDriver, setAcTempDriver] = useState(22.0)
  const [acTempPassenger, setAcTempPassenger] = useState(22.0)

  // 12. Local Clock
  const [time, setTime] = useState('10:46 AM')

  // 13. WebSocket & Reboot States
  const [wsConnected, setWsConnected] = useState(false)
  const [isRebooting, setIsRebooting] = useState(false)
  const isRebootingRef = useRef(false)
  const [displayState, setDisplayState] = useState('NOMINAL')
  const [recoveryStage, setRecoveryStage] = useState(null)
  const lastState = useRef('')
  const prevSystemState = useRef('NOMINAL')
  const wsRef = useRef(null)
  const [ramUsage, setRamUsage] = useState(45.0)
  const [mapProgress, setMapProgress] = useState(0.2)
  const audioRef = useRef(null)
  const rebootTimerRef = useRef(null)

  // Refs for gas & brake continuous press timers
  const accelInterval = useRef(null)
  const brakeInterval = useRef(null)
  const isAccelerating = useRef(false)
  const isBraking = useRef(false)

  const currentTrack = PLAYLIST[currentTrackIdx]
  const destData = DESTINATIONS[activeDestination]

  // WebSocket Telemetry Connection Hook
  useEffect(() => {
    let ws
    let reconnectTimeout

    const connect = () => {
      ws = new WebSocket('ws://localhost:8080')
      wsRef.current = ws

      ws.onopen = () => {
        setWsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Map Python backend states
          let mappedState = 'NOMINAL'
          if (data.state === 'GRACEFUL DEGRADATION') mappedState = 'DEGRADED'
          if (data.state === 'CRITICAL FAILOVER') mappedState = 'FAILOVER'

          // Bind telemetry values directly with smoothing filter
          if (data.speed !== undefined) {
            setSpeed(prev => {
              const diff = data.speed - prev
              if (Math.abs(diff) > 20) return data.speed
              return Math.round(prev + diff * 0.15)
            })
          }
          if (data.battery !== undefined) setBattery(data.battery)
          if (data.range !== undefined) setRange(data.range)
          if (data.ram_usage !== undefined) setRamUsage(data.ram_usage)

          // State Machine Transitions - RTOS updates immediately, reboot timer intercepts displayState in effect hook
          setSystemState(mappedState)
          lastState.current = mappedState
        } catch (e) {
          console.error("Error parsing telemetry", e)
        }
      }

      ws.onclose = () => {
        setWsConnected(false)
        wsRef.current = null
        reconnectTimeout = setTimeout(connect, 2000)
      }

      ws.onerror = () => {
        setWsConnected(false)
        wsRef.current = null
        ws.close()
      }
    }

    connect()

    return () => {
      if (ws) ws.close()
      wsRef.current = null
      clearTimeout(reconnectTimeout)
    }
  }, [])

  // Derived state sync - no auto recovery timers (recovery is button-driven)
  useEffect(() => {
    if (systemState === 'FAILOVER') {
      if (rebootTimerRef.current) clearTimeout(rebootTimerRef.current)
      setRecoveryStage(null)
    }
    if (systemState !== 'NOMINAL' || (displayState !== 'REBOOTING' && displayState !== 'BLACKOUT')) {
      setDisplayState(systemState)
    }
    prevSystemState.current = systemState
  }, [systemState])

  // Time & Clock sync
  useEffect(() => {
    const updateTime = () => {
      const date = new Date()
      let hours = date.getHours()
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12
      hours = hours ? hours : 12
      setTime(`${hours}:${minutes} ${ampm}`)
    }
    updateTime()
    const timer = setInterval(updateTime, 60000)
    return () => clearInterval(timer)
  }, [])

  // Call timer logic
  useEffect(() => {
    let interval
    if (callActive) {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1)
      }, 1000)
    } else {
      setCallTimer(0)
    }
    return () => clearInterval(interval)
  }, [callActive])

  // Speed Logic engine simulator + Power meter load calculations
  useEffect(() => {
    if (systemState === 'FAILOVER') {
      setSpeed(72)
      return
    }

    const interval = setInterval(() => {
      // Calculate dynamic power load representation
      setPowerLoad(prev => {
        if (isAccelerating.current) {
          return Math.min(100, prev + (gear === 'R' ? 12 : 18))
        }
        if (isBraking.current) {
          return Math.max(-50, prev - 15) // Green regen zone limit
        }
        if (gear === 'P') return 0
        if (gear === 'N') return 0
        
        // Idle cruising engine load (12% to 18%)
        const targetLoad = 15
        return Math.round(prev + (targetLoad - prev) * 0.2)
      })

      // If user is actively pressing pedals, disable engine cruise calculations
      if (isAccelerating.current || isBraking.current) return

      setSpeed(prev => {
        if (gear === 'P') return 0
        if (gear === 'N') {
          if (prev > 0) return Math.max(0, prev - 2)
          if (prev < 0) return Math.min(0, prev + 2)
          return 0
        }
        if (gear === 'R') {
          const targetR = -12
          const delta = (Math.random() - 0.5) * 0.8
          const nextR = prev + (targetR - prev) * 0.1 + delta
          return Math.round(nextR)
        }
        
        const targetD = 72
        const delta = (Math.random() - 0.5) * 1.2
        const nextSpeed = prev + (targetD - prev) * 0.15 + delta
        return Math.round(nextSpeed)
      })
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(accelInterval.current)
      clearInterval(brakeInterval.current)
    }
  }, [gear, systemState])

  // Speed Limit warning
  useEffect(() => {
    if (systemState === 'FAILOVER') {
      setIsSpeedWarning(false)
      return
    }
    setIsSpeedWarning(speed > speedLimit)
  }, [speed, systemState])

  // Dynamic map progress router interval
  useEffect(() => {
    const timer = setInterval(() => {
      if (speed !== 0) {
        setMapProgress(prev => {
          let next = prev + (speed * 0.00007)
          if (next > 1.0) next = 0.0
          if (next < 0.0) next = 1.0
          return next
        })
      }
    }, 30)
    return () => clearInterval(timer)
  }, [speed])

  const requestAudioPlayback = () => {
    if (!audioRef.current) return

    audioRef.current.play().catch(err => {
      console.warn("Audio playback blocked until a user clicks play:", err)
      setIsPlaying(false)
    })
  }

  // HTML5 Audio sync controller
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      requestAudioPlayback()
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentTrackIdx])

  // Equalizer visualizer
  useEffect(() => {
    if (!isPlaying || systemState === 'DEGRADED' || systemState === 'FAILOVER') {
      setEqualizerHeights([10, 10, 10, 10, 10, 10, 10, 10])
      return
    }
    const interval = setInterval(() => {
      setEqualizerHeights(
        Array.from({ length: 8 }, () => Math.floor(Math.random() * 70) + 15)
      )
    }, 150)
    return () => clearInterval(interval)
  }, [isPlaying, systemState])

  // Profile Swap Logic
  const handleProfileChange = (profileName) => {
    setDriverProfile(profileName)
    if (profileName === 'Michael') {
      setAmbientColor('CYAN')
      // Restore Comfort configuration
      setGear('D')
      setClusterStyle('CLASSIC')
    } else {
      setAmbientColor('MAGENTA')
      // Switch Serena to Sport mode
      setGear('D')
      setClusterStyle('SPORT')
    }
  }

  // Automated "Hey Mercedes" Dialog System
  const triggerVoiceAssistant = () => {
    if (systemState === 'FAILOVER') return
    
    // Reset timer
    clearTimeout(voiceTimeoutRef.current)
    setVoiceState('LISTENING')
    setVoiceText('Listening...')
    
    // Step 1: Listening
    voiceTimeoutRef.current = setTimeout(() => {
      setVoiceState('RESPONSE')
      setVoiceText(`How can I help you, ${driverProfile}?`)
      
      // Step 2: Response text
      voiceTimeoutRef.current = setTimeout(() => {
        setVoiceState('ACTIONS')
        setVoiceText('Adjusting cabin temperature to 21°C...')
        setAcTempDriver(21.0)
        setAcTempPassenger(21.0)
        
        // Step 3: Action trigger
        voiceTimeoutRef.current = setTimeout(() => {
          setVoiceState('DONE')
          setVoiceText('Done! Temperature set to 21°C.')
          
          // Step 4: Close Wave
          voiceTimeoutRef.current = setTimeout(() => {
            setVoiceState('INACTIVE')
            setVoiceText('')
          }, 1500)

        }, 2000)
      }, 2000)
    }, 1500)
  }

  // Pedal Press Handlers
  const startAccelerate = () => {
    if (systemState === 'FAILOVER') return
    if (gear === 'P' || gear === 'N') return
    
    isAccelerating.current = true
    clearInterval(accelInterval.current)
    
    accelInterval.current = setInterval(() => {
      setSpeed(prev => {
        let nextSpeed = prev
        if (gear === 'R') {
          nextSpeed = Math.max(-25, prev - 3)
        } else {
          nextSpeed = Math.min(260, prev + 5)
        }
        // Broadcast speed update to watchdog server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ speed: nextSpeed }))
        }
        return nextSpeed
      })
    }, 50)
  }

  const stopAccelerate = () => {
    isAccelerating.current = false
    clearInterval(accelInterval.current)
  }

  const startBraking = () => {
    if (systemState === 'FAILOVER') return
    
    isBraking.current = true
    clearInterval(brakeInterval.current)
    
    brakeInterval.current = setInterval(() => {
      setSpeed(prev => {
        let nextSpeed = prev
        if (prev > 0) nextSpeed = Math.max(0, prev - 8)
        else if (prev < 0) nextSpeed = Math.min(0, prev + 8)
        else nextSpeed = 0
        
        // Broadcast speed update to watchdog server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ speed: nextSpeed }))
        }
        return nextSpeed
      })
    }, 80)
  }

  const stopBraking = () => {
    isBraking.current = false
    clearInterval(brakeInterval.current)
  }

  const handleGearShift = (newGear) => {
    setGear(newGear)
    if (newGear === 'R') {
      setActiveOverlay('Camera')
    } else if (activeOverlay === 'Camera') {
      setActiveOverlay(null)
    }
  }

  const playTrack = (trackIdx) => {
    if (trackIdx === currentTrackIdx && audioRef.current) {
      audioRef.current.currentTime = 0
      requestAudioPlayback()
    }
    setCurrentTrackIdx(trackIdx)
    setMusicProgress(0)
    setIsPlaying(true)
  }

  const handleNextTrack = () => {
    playTrack((currentTrackIdx + 1) % PLAYLIST.length)
  }

  const handlePrevTrack = () => {
    playTrack((currentTrackIdx - 1 + PLAYLIST.length) % PLAYLIST.length)
  }

  const toggleSeatHeater = (side) => {
    if (side === 'driver') {
      setSeatHeatDriver(prev => (prev + 1) % 4)
      setSeatCoolDriver(0)
    } else {
      setSeatHeatPassenger(prev => (prev + 1) % 4)
      setSeatCoolPassenger(0)
    }
  }

  const toggleSeatCooler = (side) => {
    if (side === 'driver') {
      setSeatCoolDriver(prev => (prev + 1) % 4)
      setSeatHeatDriver(0)
    } else {
      setSeatCoolPassenger(prev => (prev + 1) % 4)
      setSeatHeatPassenger(0)
    }
  }

  const handleAppClick = (appName) => {
    if (appName === 'Navigation') {
      // Toggle between 3D Map view and AR Camera Navigation view!
      if (activeOverlay === 'ARNav') {
        setActiveOverlay(null)
      } else {
        setActiveOverlay('ARNav')
      }
    } else {
      setActiveOverlay(appName)
    }
  }

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Classic left speedometer dial angles
  const classicDialAngle = 135 + (Math.min(Math.abs(speed), maxSpeed) / maxSpeed) * 270
  const speedPercentage = Math.min(Math.abs(speed) / maxSpeed, 1)

  // Classic right power dial needle angle
  // 0% (center-up 0deg), negative regen goes counter-clockwise to -90deg, positive power goes clockwise to +180deg
  const powerMeterAngle = 0 + (powerLoad >= 0 ? (powerLoad / 100) * 180 : (powerLoad / 50) * 90)

  // Sport central dial RPM representation (mapped speed to RPM: speed * 30 + 1000)
  const maxRpm = 8000
  const currentRpm = gear === 'P' || gear === 'N' ? 800 : Math.min(8000, Math.abs(speed) * 28 + 1000)
  const sportDialAngle = 135 + (currentRpm / maxRpm) * 270

  const getRouteCoordinates = (t) => {
    let x, y, dx, dy
    if (t <= 0.5) {
      const u = t * 2
      x = (1 - u) * (1 - u) * 320 + 2 * (1 - u) * u * 220 + u * u * 280
      y = (1 - u) * (1 - u) * 450 + 2 * (1 - u) * u * 290 + u * u * 180
      dx = 2 * (1 - u) * (220 - 320) + 2 * u * (280 - 220)
      dy = 2 * (1 - u) * (290 - 450) + 2 * u * (180 - 290)
    } else {
      const u = (t - 0.5) * 2
      x = (1 - u) * (1 - u) * 280 + 2 * (1 - u) * u * 340 + u * u * 220
      y = (1 - u) * (1 - u) * 180 + 2 * (1 - u) * u * 70 + u * u * (-50)
      dx = 2 * (1 - u) * (340 - 280) + 2 * u * (220 - 340)
      dy = 2 * (1 - u) * (70 - 180) + 2 * u * (-50 - 70)
    }
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    return { x, y, angle }
  }

  const vehiclePos = getRouteCoordinates(mapProgress)

  const roadAnimDuration = speed !== 0 ? `${Math.max(0.4, Math.min(12, 100 / Math.abs(speed)))}s` : '0s'
  const roadAnimDirection = speed < 0 ? 'reverse' : 'normal'

  const getHudClasses = () => {
    switch (systemState) {
      case 'DEGRADED':
        return {
          size: 'w-[260px] h-[100px] rounded-2xl',
          innerRound: 'rounded-[15px]',
          glow: 'from-amber-600 via-orange-500 to-yellow-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
          dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
        }
      case 'FAILOVER':
        return {
          size: 'w-[260px] h-[100px] rounded-2xl',
          innerRound: 'rounded-[15px]',
          glow: 'from-red-600 via-rose-500 to-red-800 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
          dot: 'bg-red-500 shadow-[0_0_10px_#ef4444] animate-ping'
        }
      case 'REBOOT':
        return {
          size: 'w-[160px] h-[34px] rounded-full',
          innerRound: 'rounded-full',
          glow: 'from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(6,182,212,0.15)]',
          dot: 'bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-pulse'
        }
      default: // NOMINAL
        return {
          size: 'w-[160px] h-[34px] rounded-full',
          innerRound: 'rounded-full',
          glow: 'from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.15)]',
          dot: 'bg-indigo-400 shadow-[0_0_8px_#a855f7] animate-pulse'
        }
    }
  }

  const hudStyle = getHudClasses()

  return (
    <div className="h-screen w-full bg-black text-white font-sans flex flex-col justify-between overflow-hidden relative select-none">
      
      {/* GLOBAL PHYSICAL GLARE OVERLAY */}
      <div className="absolute inset-0 z-50 glass-glare pointer-events-none"></div>

      {/* APPLE INTELLIGENCE BEZEL NEON GLOW */}
      <div className={`absolute inset-0 z-40 pointer-events-none transition-all duration-1000 border-2 rounded-[28px] ${
        displayState === 'NOMINAL' 
          ? 'border-purple-500/20 shadow-[inset_0_0_20px_rgba(168,85,247,0.15)] animate-[pulse_3s_ease-in-out_infinite]' 
          : displayState === 'DEGRADED'
          ? 'border-amber-500/40 shadow-[inset_0_0_30px_rgba(245,158,11,0.25)] animate-[pulse_1.5s_ease-in-out_infinite]'
          : displayState === 'FAILOVER'
          ? 'border-red-500/60 shadow-[inset_0_0_40px_rgba(239,68,68,0.4)] animate-pulse'
          : 'opacity-0 border-transparent'
      }`}></div>

      {/* HTML5 Audio Player for Actual Music streaming */}
      <audio 
        ref={audioRef}
        src={currentTrack.url}
        preload="auto"
        onTimeUpdate={(e) => setMusicProgress(Math.floor(e.currentTarget.currentTime))}
        onEnded={handleNextTrack}
      />

      {/* MBUX BREATHING AMBIENT CABIN LIGHTS */}
      {displayState === 'NOMINAL' && (
        <>
          {ambientColor === 'CYAN' ? (
            <>
              {/* Comfort Ambient Colors */}
              <div className="absolute left-[5%] top-[15%] w-[420px] h-[420px] rounded-full bg-blue-950/25 pointer-events-none animate-cabin-breathe"></div>
              <div className="absolute left-[38%] top-[-15%] w-[650px] h-[350px] rounded-full bg-cyan-950/20 pointer-events-none animate-cabin-breathe" style={{ animationDelay: '2.5s' }}></div>
              <div className="absolute right-[5%] bottom-[10%] w-[480px] h-[480px] rounded-full bg-purple-950/15 pointer-events-none animate-cabin-breathe" style={{ animationDelay: '5s' }}></div>
              <div className="absolute bottom-[64px] left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600/30 via-cyan-400/50 to-purple-600/30 shadow-[0_0_15px_rgba(0,240,255,0.5)] pointer-events-none z-10"></div>
            </>
          ) : (
            <>
              {/* Sport Ambient Colors */}
              <div className="absolute left-[5%] top-[15%] w-[420px] h-[420px] rounded-full bg-rose-950/20 pointer-events-none animate-cabin-breathe"></div>
              <div className="absolute left-[38%] top-[-15%] w-[650px] h-[350px] rounded-full bg-purple-950/25 pointer-events-none animate-cabin-breathe" style={{ animationDelay: '2.5s' }}></div>
              <div className="absolute right-[5%] bottom-[10%] w-[480px] h-[480px] rounded-full bg-red-950/20 pointer-events-none animate-cabin-breathe" style={{ animationDelay: '5s' }}></div>
              <div className="absolute bottom-[64px] left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600/30 via-red-500/50 to-orange-600/30 shadow-[0_0_15px_rgba(239,68,68,0.5)] pointer-events-none z-10"></div>
            </>
          )}
        </>
      )}

      {/* TOP STATUS BAR */}
      <div className={`w-full h-12 flex justify-between items-center px-8 z-20 ${
        systemState === 'FAILOVER' 
          ? 'border-b border-red-950/40 bg-black' 
          : 'border-b border-white/5 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm'
      }`}>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold tracking-[0.2em] text-gray-500">MBUX HYPERSCREEN</span>
          <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider transition-all duration-300 ${
            systemState === 'NOMINAL' 
              ? (ambientColor === 'CYAN' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]')
              : systemState === 'DEGRADED'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'bg-red-500/20 text-red-500 border border-red-500/40 animate-pulse'
          }`}>
            {systemState === 'NOMINAL' && `${driverProfile.toUpperCase()}: ${ambientColor === 'CYAN' ? 'COMFORT' : 'SPORT'}`}
            {systemState === 'DEGRADED' && 'GRACEFUL DEGRADATION'}
            {systemState === 'FAILOVER' && 'CRITICAL FAILOVER (ISO-26262)'}
          </div>
        </div>

        {systemState !== 'FAILOVER' && (
          <div className="flex items-center gap-6 text-xs">
            {/* HEY MERCEDES BUTTON TRIGGER */}
            <button 
              onClick={triggerVoiceAssistant}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider cursor-pointer border transition-all duration-500 ${
                voiceState !== 'INACTIVE'
                  ? 'bg-cyan-500/15 border-cyan-400/30 text-cyan-400 text-glow-cyan scale-105'
                  : 'bg-white/3 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              <Mic size={12} className={voiceState !== 'INACTIVE' ? 'animate-pulse' : ''} />
              HEY MERCEDES
            </button>

            <span className="text-gray-400 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              24.5 °C
            </span>
          </div>
        )}

        <div className="flex items-center gap-6 text-xs">
          {systemState !== 'FAILOVER' ? (
            <>
              {/* PROFILE SWITCHER */}
              <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <User size={12} className="text-gray-500" />
                {['Michael', 'Serena'].map((name) => (
                  <button
                    key={name}
                    onClick={() => handleProfileChange(name)}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition-all ${
                      driverProfile === name
                        ? (ambientColor === 'CYAN' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-black' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 font-black')
                        : 'text-gray-600 hover:text-gray-400'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-gray-400">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-400">PASS AIRBAG OFF</span>
                <Bluetooth size={14} className={ambientColor === 'CYAN' ? 'text-cyan-400' : 'text-rose-400'} />
                <Wifi size={14} />
              </div>
              <span className="font-semibold tracking-wide text-white text-glow-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{time}</span>
            </>
          ) : (
            <div className="flex items-center gap-3 text-red-500">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10">EMERGENCY TELEMETRY ONLY</span>
              <span className="font-mono font-bold text-glow-red">{time}</span>
            </div>
          )}
        </div>
      </div>

      {/* "HEY MERCEDES" soundwave overlay at top-center */}
      {voiceState !== 'INACTIVE' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 w-[450px] glass-panel-heavy bg-slate-950/90 rounded-2xl p-4 flex flex-col gap-3 items-center border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-fade-in">
          <div className="flex items-center gap-2">
            <Mic size={14} className="text-cyan-400 text-glow-cyan animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase text-glow-cyan">Hey Mercedes Voice Assistance</span>
          </div>

          <p className="text-sm font-semibold tracking-tight text-white text-center h-5 transition-all">
            {voiceText}
          </p>

          {/* Glowing Animated Waveform */}
          <div className="flex items-end justify-center gap-1.5 h-8 w-44">
            {Array.from({ length: 9 }).map((_, wIdx) => {
              const h = Math.abs(Math.sin(wIdx * 0.6) * 100)
              return (
                <div 
                  key={wIdx} 
                  className="w-1 bg-cyan-400 rounded-full text-glow-cyan soundwave-bar"
                  style={{ 
                    height: `${Math.max(6, h)}%`,
                    animationDelay: `${wIdx * 0.1}s`,
                    animationDuration: voiceState === 'LISTENING' ? '0.8s' : '1.5s'
                  }}
                />
              )
            })}
          </div>
        </div>
      )}


      {/* MAIN SCREEN BODY */}
      <div className="flex-1 flex w-full relative z-10">
        
        {/* ========================================================================= */}
        {/* LEFT ZONE: RTOS SPEEDOMETER (30% Width)                                   */}
        {/* ========================================================================= */}
        <div className="w-[30%] h-full flex flex-col justify-between py-8 px-8 relative border-r border-white/5 bg-black/20">
          
          <div className="flex justify-between items-center w-full">
            <button 
              onClick={() => {
                if (systemState === 'FAILOVER') return
                // Cycle Cluster Styles CLASSIC -> SPORT -> DISCREET
                setClusterStyle(prev => {
                  if (prev === 'CLASSIC') return 'SPORT'
                  if (prev === 'SPORT') return 'DISCREET'
                  return 'CLASSIC'
                })
              }}
              className="text-[9px] tracking-[0.2em] text-gray-500 uppercase font-black cursor-pointer hover:text-white flex items-center gap-1.5 transition-all border border-transparent hover:border-white/10 hover:bg-white/5 px-2.5 py-0.5 rounded-full"
            >
              <RefreshCw size={10} /> Style: {clusterStyle}
            </button>
            {systemState === 'NOMINAL' && (
              <span className={`text-[10px] px-2 py-0.5 rounded border text-glow-cyan transition-all duration-300 ${
                ambientColor === 'CYAN' 
                  ? 'bg-cyan-900/30 text-cyan-400 border-cyan-800/40' 
                  : 'bg-rose-900/30 text-rose-400 border-rose-800/40 text-glow-magenta'
              }`}>
                RTOS Cluster
              </span>
            )}
          </div>

          {!wsConnected && (
            <div className="mt-2 w-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-black tracking-widest text-center py-1.5 px-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              ⚠️ WS DISCONNECTED - OFFLINE SIMULATION
            </div>
          )}

          {/* Speedometer Center Dial Switcher */}
          <div className="flex-1 flex items-center justify-center relative my-4">
            <>
              {/* A. CLASSIC MBUX STYLE: DUAL DIALS (SPEEDO + POWER) */}
              {clusterStyle === 'CLASSIC' && (
                <div className="flex items-center justify-center gap-2 relative">
                  
                  {/* Left: Speedometer dial */}
                  <div className="relative w-44 h-44 flex items-center justify-center border border-white/3 bg-slate-950/15 rounded-full p-2">
                    <svg className="w-full h-full transform -rotate-180 scale-x-[-1]" viewBox="0 0 200 200">
                      <path d="M 50 150 A 70 70 0 1 1 150 150" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                      <path d="M 50 150 A 70 70 0 1 1 150 150" fill="none" stroke="rgba(0,210,255,0.15)" strokeWidth="1" strokeDasharray="1.5, 3" />
                      
                      {/* Active arc */}
                      <path 
                        d={`M 50 150 A 70 70 0 ${speedPercentage > 0.65 ? 1 : 0} 1 ${
                          100 + 70 * Math.cos((classicDialAngle * Math.PI) / 180)
                        } ${
                          100 + 70 * Math.sin((classicDialAngle * Math.PI) / 180)
                        }`}
                        fill="none" 
                        stroke={isSpeedWarning ? '#ff3344' : '#00d2ff'}
                        strokeWidth="4" 
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Center labels */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className={`text-3xl font-light drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] ${
                        isSpeedWarning ? 'text-red-500 text-glow-red' : 'text-white'
                      }`}>{Math.round(speed)}</span>
                      <span className="text-[7px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">km/h</span>
                    </div>
                  </div>

                  {/* Center: ADAS safety rendering */}
                  <div className="w-16 h-28 border-x border-dashed border-white/10 flex flex-col justify-between items-center py-4 relative bg-slate-950/20 rounded">
                    <span className="text-[6px] tracking-widest text-gray-500 uppercase font-black">ADAS</span>
                    {/* Lane markers */}
                    <div className="absolute inset-y-0 w-px border-l border-dashed border-emerald-500/40 left-3.5"></div>
                    <div className="absolute inset-y-0 w-px border-r border-dashed border-emerald-500/40 right-3.5"></div>
                    {/* Vehicle outline */}
                    <div className="w-6 h-10 border border-white/20 rounded bg-slate-900/60 shadow-sm relative flex items-center justify-center">
                      <span className="text-[5px] text-gray-500">MBUX</span>
                    </div>
                    <span className="text-[6px] text-emerald-400 font-bold tracking-widest">OK</span>
                  </div>

                  {/* Right: Power/Regen meter (Reactions to pedals!) */}
                  <div className="relative w-44 h-44 flex items-center justify-center border border-white/3 bg-slate-950/15 rounded-full p-2">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                      {/* Power track */}
                      <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                      {/* Regen track (Counter clockwise) */}
                      <path d="M 30 100 A 70 70 0 0 0 100 170" fill="none" stroke="rgba(16,185,129,0.06)" strokeWidth="4" />
                      
                      {/* Active needle indicator load path */}
                      <path 
                        d={powerLoad >= 0 
                          ? `M 100 30 A 70 70 0 0 1 ${100 + 70 * Math.sin((powerLoad / 100) * Math.PI)} ${100 - 70 * Math.cos((powerLoad / 100) * Math.PI)}`
                          : `M 100 30 A 70 70 0 0 0 ${100 - 70 * Math.sin((Math.abs(powerLoad) / 50) * Math.PI / 2)} ${100 - 70 * Math.cos((Math.abs(powerLoad) / 50) * Math.PI / 2)}`
                        }
                        fill="none" 
                        stroke={powerLoad >= 0 ? '#ffaa00' : '#10b981'}
                        strokeWidth="4" 
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className={`text-2xl font-light drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] ${
                        powerLoad >= 0 ? 'text-amber-500' : 'text-emerald-400 text-glow-cyan'
                      }`}>
                        {powerLoad >= 0 ? `${powerLoad}%` : `REGEN`}
                      </span>
                      <span className="text-[7px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                        {powerLoad >= 0 ? 'Power output' : 'Energy charge'}
                      </span>
                    </div>
                  </div>

                  {/* Shifter stack */}
                  <div className="absolute right-[-34px] top-1/2 -translate-y-1/2 flex flex-col gap-1.5 items-center justify-center bg-black/50 px-1.5 py-2 rounded-lg border border-white/5 shadow-md z-30">
                    {['P', 'R', 'N', 'D'].map((g) => {
                      const isSelected = gear === g
                      return (
                        <button 
                          key={g} 
                          onClick={() => handleGearShift(g)}
                          className={`text-[9px] font-bold transition-all w-4 h-4 flex items-center justify-center rounded cursor-pointer ${
                            isSelected 
                              ? (ambientColor === 'CYAN' 
                                ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 scale-110 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] font-black text-glow-cyan' 
                                : 'text-rose-400 bg-rose-950/40 border border-rose-800/30 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] font-black text-glow-magenta')
                              : 'text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          {g}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* B. SPORT MBUX STYLE: RED CENTER TACHOMETER */}
              {clusterStyle === 'SPORT' && (
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-180 scale-x-[-1]" viewBox="0 0 260 260">
                    {/* Outer track */}
                    <path d="M 60 200 A 90 90 0 1 1 200 200" fill="none" stroke="rgba(255,0,128,0.1)" strokeWidth="6" />
                    
                    {/* Active needle track */}
                    <path 
                      d={`M 60 200 A 90 90 0 ${currentRpm / maxRpm > 0.65 ? 1 : 0} 1 ${
                        130 + 90 * Math.cos((sportDialAngle * Math.PI) / 180)
                      } ${
                        130 + 90 * Math.sin((sportDialAngle * Math.PI) / 180)
                      }`}
                      fill="none" 
                      stroke="#ff0055"
                      strokeWidth="6" 
                      strokeLinecap="round"
                      filter="url(#glow-filter)"
                    />

                    {/* Carbon ticks */}
                    {Array.from({ length: 9 }).map((_, rpmIdx) => {
                      const rpmVal = rpmIdx * 1000
                      const angleDeg = 135 + rpmIdx * (270 / 8)
                      const angleRad = (angleDeg * Math.PI) / 180
                      const x1 = 130 + 92 * Math.cos(angleRad)
                      const y1 = 130 + 92 * Math.sin(angleRad)
                      const x2 = 130 + 100 * Math.cos(angleRad)
                      const y2 = 130 + 100 * Math.sin(angleRad)
                      const isActive = rpmVal <= currentRpm

                      return (
                        <g key={rpmIdx}>
                          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isActive ? '#ff0055' : 'rgba(255,255,255,0.1)'} strokeWidth="2.5" />
                          <text 
                            x={130 + 112 * Math.cos(angleRad)} 
                            y={130 + 112 * Math.sin(angleRad) + 3} 
                            textAnchor="middle" 
                            fontSize="8" 
                            fontWeight="bold" 
                            fill={isActive ? '#ffffff' : 'rgba(255,255,255,0.2)'}
                          >
                            {rpmIdx}
                          </text>
                        </g>
                      )
                    })}
                  </svg>

                  {/* Central Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[8px] tracking-[0.2em] text-red-500 font-extrabold text-glow-red uppercase mb-1">SPORT ENGINE</span>
                    <span className="text-6xl font-light text-white text-glow-white tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">{Math.round(speed)}</span>
                    <span className="text-[8px] text-gray-500 font-bold uppercase mt-0.5">km/h</span>
                    
                    {/* RPM Value */}
                    <span className="text-[9px] font-mono text-red-400 mt-2 font-semibold">
                      {currentRpm.toFixed(0)} RPM
                    </span>
                  </div>

                  {/* Needle */}
                  <div 
                    className="absolute w-1/2 h-0.5 left-1/2 top-1/2 origin-left transition-transform duration-300 ease-out z-10 pointer-events-none"
                    style={{ transform: `translateY(-50%) rotate(${sportDialAngle}deg)` }}
                  >
                    <div className="h-full w-20 ml-6 rounded-full bg-red-500 shadow-[0_0_12px_#ff0055] border-t border-white/20"></div>
                  </div>

                  {/* Shifter indicators */}
                  <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-black/40 px-2 py-3 rounded-xl border border-white/5 shadow-md z-30">
                    {['P', 'R', 'N', 'D'].map((g) => {
                      const isSelected = gear === g
                      return (
                        <button 
                          key={g} 
                          onClick={() => handleGearShift(g)}
                          className={`text-xs font-bold transition-all w-5 h-5 flex items-center justify-center rounded cursor-pointer ${
                            isSelected 
                              ? 'text-red-500 bg-red-950/40 border border-red-800/30 scale-125 font-extrabold drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] text-glow-red' 
                              : 'text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          {g}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* C. DISCREET MBUX STYLE: MINIMAL DIGITS */}
              {clusterStyle === 'DISCREET' && (
                <div className="flex flex-col items-center justify-center relative">
                  <span className="text-[8px] tracking-[0.25em] text-gray-500 uppercase font-black mb-3">DISCREET HEADS-UP</span>
                  <div className="flex items-baseline gap-2 font-sans">
                    <span className="text-8xl font-thin tracking-tighter text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                      {Math.round(speed)}
                    </span>
                    <span className="text-lg font-bold text-gray-500 tracking-wider">
                      km/h
                    </span>
                  </div>

                  {/* Simple Shifter Horizontal */}
                  <div className="flex items-center gap-5 mt-8 bg-neutral-900/40 px-4 py-1.5 rounded-full border border-white/5">
                    {['P', 'R', 'N', 'D'].map((g) => {
                      const isSelected = gear === g
                      return (
                        <button 
                          key={g} 
                          onClick={() => handleGearShift(g)}
                          className={`text-xs font-bold transition-all cursor-pointer ${
                            isSelected ? 'text-white scale-110 font-extrabold' : 'text-gray-600'
                          }`}
                        >
                          {g}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          </div>

          {/* Left Zone Bottom: Pedals & Telemetry */}
          <div className="flex flex-col gap-4 items-center w-full">
            <div className="flex gap-4 items-end bg-black/40 border border-white/5 rounded-2xl p-3 shadow-md w-fit">
              {/* Brake Pedal */}
              <button
                onMouseDown={startBraking}
                onMouseUp={stopBraking}
                onMouseLeave={stopBraking}
                onTouchStart={startBraking}
                onTouchEnd={stopBraking}
                className={`w-14 h-20 border rounded-lg flex flex-col justify-between p-2 cursor-pointer transition-all duration-300 active:scale-95 select-none ${
                  isBraking.current
                    ? 'bg-red-500/15 border-red-500/60 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                    : 'bg-neutral-800/40 border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                }`}
              >
                <div className="flex flex-col gap-1 w-full opacity-60">
                  <div className="h-0.5 w-full bg-current rounded"></div>
                  <div className="h-0.5 w-full bg-current rounded"></div>
                  <div className="h-0.5 w-full bg-current rounded"></div>
                </div>
                <span className="text-[7px] font-black tracking-widest text-center uppercase">Brake</span>
              </button>

              {/* Gas Pedal */}
              <button
                onMouseDown={startAccelerate}
                onMouseUp={stopAccelerate}
                onMouseLeave={stopAccelerate}
                onTouchStart={startAccelerate}
                onTouchEnd={stopAccelerate}
                className={`w-10 h-24 border rounded-lg flex flex-col justify-between p-2 cursor-pointer transition-all duration-300 active:scale-95 select-none ${
                  isAccelerating.current
                    ? (ambientColor === 'CYAN' ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]' : 'bg-rose-500/15 border-rose-500/60 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]')
                    : 'bg-neutral-800/40 border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                }`}
              >
                <div className="flex gap-0.5 h-12 w-full justify-center opacity-60">
                  <div className="w-0.5 h-full bg-current rounded"></div>
                  <div className="w-0.5 h-full bg-current rounded"></div>
                </div>
                <span className="text-[7px] font-black tracking-widest text-center uppercase">Gas</span>
              </button>
            </div>

            <div className="flex justify-center items-center gap-3 w-full">
              <div className={`px-4 py-2.5 rounded-full flex items-center gap-2 shrink-0 drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)] ${
                systemState === 'NOMINAL' ? 'glass-pill' : 'bg-neutral-900 border border-neutral-800'
              }`}>
                <Zap size={14} className={systemState === 'NOMINAL' ? (ambientColor === 'CYAN' ? 'text-cyan-400 text-glow-cyan' : 'text-rose-400 text-glow-magenta') : 'text-white'} />
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-500 font-bold uppercase leading-none">Range</span>
                  <span className="text-xs font-bold mt-0.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{range} km</span>
                </div>
              </div>

              <div className={`px-4 py-2.5 rounded-full flex items-center gap-2 shrink-0 drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)] ${
                systemState === 'NOMINAL' ? 'glass-pill' : 'bg-neutral-900 border border-neutral-800'
              }`}>
                <BatteryCharging size={14} className={systemState === 'NOMINAL' ? (ambientColor === 'CYAN' ? 'text-cyan-400 text-glow-cyan animate-pulse' : 'text-rose-400 text-glow-magenta animate-pulse') : 'text-white'} />
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-500 font-bold uppercase leading-none">Battery</span>
                  <span className="text-xs font-bold mt-0.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{battery}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT ZONE: INFOTAINMENT & MAP & APPS (70% Width) */}
        <div className="w-[70%] h-full flex flex-row p-6 pl-2 gap-6 relative">
          
          {displayState === 'BLACKOUT' ? (
            /* SOLID BLACKOUT STATE */
            <div className="w-full h-full bg-black rounded-3xl flex-1 animate-fade-out duration-300"></div>
          ) : displayState === 'REBOOTING' ? (
            /* MBUX REBOOTING STATE LAYOUT */
            <div className="w-full h-full rounded-3xl bg-black flex flex-col items-center justify-center gap-6 shadow-2xl relative overflow-hidden flex-1 animate-fade-in duration-500">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border border-white/10"></div>
                <div className="absolute inset-0 rounded-full border border-t-white border-r-white/30 animate-spin"></div>
              </div>
              <div className="text-center flex flex-col gap-2.5">
                <h2 className="text-xs font-black tracking-[0.35em] text-white uppercase">
                  MBUX Core Restoring
                </h2>
                <p className="text-[9px] text-neutral-500 font-mono">
                  Re-initializing infotainment subsystem protocols...
                </p>
              </div>
            </div>
          ) : displayState !== 'FAILOVER' ? (
            <>
              {/* ZERO-LAYER Infotainment main card */}
              <div className={`w-2/3 h-full rounded-3xl relative overflow-hidden flex flex-col justify-between p-6 transition-all duration-500 ${
                displayState === 'NOMINAL' 
                  ? 'border-t border-l border-white/20 border-r border-b border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] bg-gradient-to-b from-slate-950 to-slate-900' 
                  : 'border border-neutral-800 bg-neutral-900'
              }`}>
                
                {/* Custom SVG Navigation Map simulator */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <svg 
                    className="w-full h-full object-cover scale-100 transition-transform duration-700" 
                    viewBox="0 0 500 400" 
                    preserveAspectRatio="none"
                  >
                    <defs>
                      {/* Rich 3D Dark Blue Gradient for Nominal Background */}
                      <linearGradient id="map-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#040a16" />
                        <stop offset="50%" stopColor="#071329" />
                        <stop offset="100%" stopColor="#0d2449" />
                      </linearGradient>

                      {/* Cyan/Purple Active Route Glow Gradient */}
                      <linearGradient id="route-grad-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d946ef" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>

                      {/* Drop Shadow/Glow Filters for Nominal Mode */}
                      <filter id="route-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>

                      <filter id="arrow-glow-filter" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#a855f7" floodOpacity="0.8" />
                      </filter>

                      <filter id="pin-glow" x="-40%" y="-40%" width="180%" height="180%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {/* SVG Map Background */}
                    <rect 
                      width="100%" 
                      height="100%" 
                      fill={displayState === 'NOMINAL' ? 'url(#map-bg-grad)' : '#121212'} 
                    />

                    {/* Secondary roads */}
                    <g>
                      <path 
                        d="M 20 200 C 100 120, 200 300, 480 300" 
                        fill="none" 
                        stroke={displayState === 'NOMINAL' ? 'rgba(0, 240, 255, 0.08)' : '#ffffff'} 
                        strokeWidth={displayState === 'NOMINAL' ? '3.5' : '1'} 
                        opacity={displayState === 'NOMINAL' ? '0.7' : '0.2'} 
                      />
                      <path 
                        d="M 100 380 C 150 250, 350 250, 400 20" 
                        fill="none" 
                        stroke={displayState === 'NOMINAL' ? 'rgba(0, 240, 255, 0.08)' : '#ffffff'} 
                        strokeWidth={displayState === 'NOMINAL' ? '3.5' : '1'} 
                        opacity={displayState === 'NOMINAL' ? '0.7' : '0.2'} 
                      />
                      <path 
                        d="M 450 380 C 350 300, 200 100, 50 50" 
                        fill="none" 
                        stroke={displayState === 'NOMINAL' ? 'rgba(0, 240, 255, 0.08)' : '#ffffff'} 
                        strokeWidth={displayState === 'NOMINAL' ? '3.5' : '1'} 
                        opacity={displayState === 'NOMINAL' ? '0.7' : '0.2'} 
                      />
                    </g>

                    {/* Main Active Route Path */}
                    {displayState === 'NOMINAL' ? (
                      <>
                        {/* Glow outline layer */}
                        <path 
                          id="active-route"
                          d="M 60 330 L 150 330 Q 170 330, 170 310 L 170 240 Q 170 220, 190 220 L 300 220 Q 320 220, 320 200 L 320 130 Q 320 110, 340 110 L 430 110 Q 450 110, 450 90 L 450 70"
                          fill="none" 
                          stroke="url(#route-grad-glow)" 
                          strokeWidth="10" 
                          strokeLinecap="round"
                          filter="url(#route-glow-filter)"
                          opacity="0.8"
                        />
                        {/* Realistic 3D Breadcrumb Dots (Dotted Route) */}
                        <path 
                          d="M 60 330 L 150 330 Q 170 330, 170 310 L 170 240 Q 170 220, 190 220 L 300 220 Q 320 220, 320 200 L 320 130 Q 320 110, 340 110 L 430 110 Q 450 110, 450 90 L 450 70"
                          fill="none" 
                          stroke="#ffffff" 
                          strokeWidth="6" 
                          strokeLinecap="round"
                          strokeDasharray="1, 15"
                        />

                        {/* START PIN (Red pin at 60, 330) */}
                        <g transform="translate(60, 330) scale(0.75)" filter="url(#pin-glow)">
                          {/* Pin drop shadow base */}
                          <ellipse cx="0" cy="5" rx="6" ry="3" fill="#000000" opacity="0.4" />
                          {/* Map Pin Shape */}
                          <path 
                            d="M 0 0 C -12 -12, -12 -30, 0 -30 C 12 -30, 12 -12, 0 0 Z" 
                            fill="#EF4444" 
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                          {/* Inner pin cutout hole */}
                          <circle cx="0" cy="-18" r="4.5" fill="#ffffff" />
                        </g>

                        {/* END PIN (Green pin at 450, 70) */}
                        <g transform="translate(450, 70) scale(0.75)" filter="url(#pin-glow)">
                          {/* Pin drop shadow base */}
                          <ellipse cx="0" cy="5" rx="6" ry="3" fill="#000000" opacity="0.4" />
                          {/* Map Pin Shape */}
                          <path 
                            d="M 0 0 C -12 -12, -12 -30, 0 -30 C 12 -30, 12 -12, 0 0 Z" 
                            fill="#10B981" 
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                          {/* Inner pin cutout hole */}
                          <circle cx="0" cy="-18" r="4.5" fill="#ffffff" />
                        </g>
                      </>
                    ) : (
                      <>
                        {/* Flat 2D Dashed Amber Line for Degradation/Failover */}
                        <path 
                          id="active-route"
                          d="M 60 330 L 150 330 Q 170 330, 170 310 L 170 240 Q 170 220, 190 220 L 300 220 Q 320 220, 320 200 L 320 130 Q 320 110, 340 110 L 430 110 Q 450 110, 450 90 L 450 70"
                          fill="none" 
                          stroke="#FFB300" 
                          strokeWidth="4" 
                          strokeLinecap="round"
                          strokeDasharray="10, 10"
                        />
                        {/* Flat Amber Pin 1 */}
                        <g transform="translate(60, 330) scale(0.7)" opacity="0.8">
                          <path 
                            d="M 0 0 C -12 -12, -12 -30, 0 -30 C 12 -30, 12 -12, 0 0 Z" 
                            fill="none" 
                            stroke="#FFB300" 
                            strokeWidth="2" 
                          />
                          <circle cx="0" cy="-18" r="4.5" fill="none" stroke="#FFB300" strokeWidth="1.5" />
                        </g>
                        {/* Flat Amber Pin 2 */}
                        <g transform="translate(450, 70) scale(0.7)" opacity="0.8">
                          <path 
                            d="M 0 0 C -12 -12, -12 -30, 0 -30 C 12 -30, 12 -12, 0 0 Z" 
                            fill="none" 
                            stroke="#FFB300" 
                            strokeWidth="2" 
                          />
                          <circle cx="0" cy="-18" r="4.5" fill="none" stroke="#FFB300" strokeWidth="1.5" />
                        </g>
                      </>
                    )}

                    {/* Moving Arrow (Navigation Cursor) */}
                    <g>
                      <animateMotion 
                        dur="60s" 
                        repeatCount="indefinite" 
                        rotate="auto"
                      >
                        <mpath href="#active-route" />
                      </animateMotion>
                      
                      {displayState === 'NOMINAL' ? (
                        /* Solid white arrow with purple drop shadow - pointing East (Right) */
                        <polygon 
                          points="-12,-7 12,0 -12,7 -6,0" 
                          fill="#ffffff" 
                          filter="url(#arrow-glow-filter)" 
                        />
                      ) : (
                        /* Flat 2D wireframe amber triangle - pointing East (Right) */
                        <polygon 
                          points="-12,-7 12,0 -12,7 -6,0" 
                          fill="none" 
                          stroke="#FFB300" 
                          strokeWidth="1.5" 
                        />
                      )}
                    </g>
                  </svg>
                </div>

                {/* Search / Pre-configured target selections */}
                <div className={`absolute left-6 z-10 transition-all duration-500 ease-out ${
                  displayState === 'NOMINAL' ? 'top-16' : 'top-[136px]'
                } w-52 flex flex-col gap-2 ${
                  displayState === 'NOMINAL' ? 'glass-panel' : 'bg-neutral-900 border border-neutral-800'
                } rounded-2xl p-3 shadow-lg`}>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-black/40 rounded-xl border border-white/5 text-xs">
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <span className="text-[10px] text-gray-500 font-medium">Select route:</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <button 
                      onClick={() => setActiveDestination('Home')}
                      className={`flex items-center gap-2.5 text-[10px] text-left px-2 py-1 rounded transition-all cursor-pointer ${
                        activeDestination === 'Home' 
                          ? (ambientColor === 'CYAN' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20')
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Home size={12} className={ambientColor === 'CYAN' ? 'text-cyan-400 shrink-0' : 'text-rose-400 shrink-0'} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold leading-none">Home</div>
                        <span className="text-[8px] text-gray-500">5.2 km away</span>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveDestination('Office')}
                      className={`flex items-center gap-2.5 text-[10px] text-left px-2 py-1 rounded transition-all cursor-pointer ${
                        activeDestination === 'Office' 
                          ? (ambientColor === 'CYAN' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20')
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Briefcase size={12} className="text-purple-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold leading-none">Office</div>
                        <span className="text-[8px] text-gray-500">18.5 km away</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => setActiveDestination('Favourites')}
                      className={`flex items-center gap-2.5 text-[10px] text-left px-2 py-1 rounded transition-all cursor-pointer ${
                        activeDestination === 'Favourites' 
                          ? (ambientColor === 'CYAN' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20')
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Star size={12} className="text-amber-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold leading-none">Scenic Ridge</div>
                        <span className="text-[8px] text-gray-500">42.1 km away</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Floating Map Actions (Compass, Zoom, 3D) */}
                <div className="absolute right-6 top-6 flex flex-col gap-2.5 z-30">
                  <button 
                    onClick={() => setZoomScale(1.1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 ${
                      displayState === 'NOMINAL' ? 'glass-panel' : 'bg-neutral-900 border border-neutral-800'
                    }`}
                  >
                    <Compass size={18} className={ambientColor === 'CYAN' ? 'text-cyan-400' : 'text-rose-400'} />
                  </button>
                  
                  <div className={`flex flex-col rounded-xl overflow-hidden transition-all duration-300 ${
                    displayState === 'NOMINAL' ? 'glass-panel' : 'bg-neutral-900 border border-neutral-800'
                  }`}>
                    <button 
                      onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.2))}
                      className="w-10 h-10 border-b border-white/5 text-xs font-bold hover:bg-white/10 cursor-pointer active:bg-white/20 transition-colors"
                    >+</button>
                    <button 
                      onClick={() => setZoomScale(prev => Math.max(0.6, prev - 0.2))}
                      className="w-10 h-10 text-xs font-bold hover:bg-white/10 cursor-pointer active:bg-white/20 transition-colors"
                    >-</button>
                  </div>

                  <button 
                    onClick={() => setIs3D(!is3D)}
                    className={`w-10 h-10 flex items-center justify-center text-[10px] font-bold rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 ${
                      is3D 
                        ? (displayState === 'NOMINAL' ? (ambientColor === 'CYAN' ? 'glass-panel text-cyan-400 text-glow-cyan' : 'glass-panel text-rose-400 text-glow-magenta') : 'bg-neutral-800 text-white border border-neutral-700')
                        : (displayState === 'NOMINAL' ? 'glass-panel text-neutral-400' : 'bg-neutral-900 border border-neutral-800 text-neutral-600')
                    }`}
                  >
                    3D
                  </button>
                </div>

                {/* Floating Navigation Card overlay */}
                <div className="z-10 w-fit self-end mt-20">
                  <div className={`flex items-center gap-3.5 transition-all duration-300 ${
                    displayState === 'NOMINAL' ? 'glass-panel-heavy bg-black/40 shadow-lg' : 'bg-neutral-900 border border-neutral-800'
                  } rounded-2xl p-4 pr-6`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      displayState === 'NOMINAL' ? (ambientColor === 'CYAN' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-glow-cyan' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 text-glow-magenta') : 'bg-neutral-800 text-white'
                    }`}>
                      <CornerUpRight size={22} className="rotate-270" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {destData.distance}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{destData.instruction}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Trip metrics bar */}
                <div className={`z-10 w-full mt-auto transition-all duration-300 ${
                  displayState === 'NOMINAL' ? 'glass-panel bg-black/40 shadow-md' : 'bg-neutral-900 border border-neutral-800'
                } rounded-2xl px-6 py-4 flex justify-between items-center text-xs`}>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Arrival</span>
                    <span className="text-sm font-bold text-white mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{destData.eta}</span>
                  </div>
                  <div className="h-6 w-px bg-white/10"></div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Duration</span>
                    <span className="text-sm font-bold text-white mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{destData.duration}</span>
                  </div>
                  <div className="h-6 w-px bg-white/10"></div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Distance</span>
                    <span className="text-sm font-bold text-white mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{destData.distance}</span>
                  </div>
                  <div className="h-6 w-px bg-white/10"></div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Battery ETA</span>
                    <span className={`text-sm font-bold mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${
                      ambientColor === 'CYAN' ? 'text-cyan-400 text-glow-cyan' : 'text-rose-400 text-glow-magenta'
                    }`}>{destData.battery}</span>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* INTERACTIVE FLOATING APP OVERLAYS                                         */}
                {/* ========================================================================= */}
                {activeOverlay && (
                  <div className="absolute inset-0 z-20 glass-panel-heavy bg-slate-950/85 backdrop-blur-2xl flex flex-col p-6 animate-fade-in animate-duration-300">
                    
                    {/* Header bar of App overlay */}
                    <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                          activeOverlay === 'Spotify' 
                            ? 'bg-[#1DB954] shadow-[0_0_8px_#1DB954]' 
                            : activeOverlay === 'WhatsApp' 
                            ? 'bg-[#25D366] shadow-[0_0_8px_#25D366]' 
                            : (ambientColor === 'CYAN' ? 'bg-cyan-400 text-glow-cyan' : 'bg-rose-400 text-glow-magenta')
                        }`}></span>
                        <span className={`text-xs uppercase font-black tracking-widest ${
                          activeOverlay === 'Spotify' 
                            ? 'text-[#1DB954]' 
                            : activeOverlay === 'WhatsApp' 
                            ? 'text-[#25D366]' 
                            : (ambientColor === 'CYAN' ? 'text-cyan-400 text-glow-cyan' : 'text-rose-400 text-glow-magenta')
                        }`}>
                          {activeOverlay === 'Phone' && 'MBUX Phone Hub'}
                          {activeOverlay === 'WhatsApp' && 'MBUX WhatsApp Messaging'}
                          {activeOverlay === 'CarInfo' && 'Telemetry Diagnostics'}
                          {activeOverlay === 'Browser' && 'MBUX HTML Browser'}
                          {activeOverlay === 'Camera' && '360° Reverse Assist Camera'}
                          {activeOverlay === 'YouTube' && 'MBUX YouTube Theater'}
                          {activeOverlay === 'Spotify' && 'MBUX Spotify Stream'}
                          {activeOverlay === 'ARNav' && 'MBUX Augmented Reality Assist'}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => setActiveOverlay(null)}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300 group"
                      >
                        <X size={14} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                      </button>
                    </div>

                    {/* Content switcher */}
                    <div className="flex-1 flex overflow-hidden">
                      
                      {/* PHONE APP OVERLAY */}
                      {activeOverlay === 'Phone' && (
                        <div className="flex-1 flex flex-col justify-center items-center gap-6 max-w-md mx-auto">
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 border-dashed transition-all ${
                            callActive ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 text-glow-cyan animate-pulse' : (ambientColor === 'CYAN' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-rose-500/10 border-rose-500 text-rose-400')
                          }`}>
                            <PhoneCall size={36} />
                          </div>
                          
                          <div className="text-center">
                            <h3 className="text-lg font-bold">Mercedes Concierge</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {callActive ? `Active Call • ${formatSeconds(callTimer)}` : 'Ready to call vehicle assistance'}
                            </p>
                          </div>

                          <div className="flex gap-4">
                            {!callActive ? (
                              <button 
                                onClick={() => setCallActive(true)}
                                className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold tracking-widest uppercase cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                              >
                                Place Call
                              </button>
                            ) : (
                              <button 
                                onClick={() => setCallActive(false)}
                                className="px-6 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold tracking-widest uppercase cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                              >
                                End Call
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SPOTIFY APP OVERLAY */}
                      {activeOverlay === 'Spotify' && (
                        <div className="flex-1 flex gap-6 relative animate-fade-in w-full">
                          {/* Left Column: Album Art & Controls */}
                          <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between items-center text-center">
                            
                            {/* Spinning Record Art */}
                            <div className="relative group cursor-pointer my-auto flex flex-col items-center">
                              <div className={`w-36 h-36 rounded-full bg-slate-900 border-4 border-neutral-800 flex items-center justify-center shadow-2xl relative ${
                                isPlaying ? 'animate-spin-slow' : ''
                              }`} style={{ animationDuration: '20s' }}>
                                {currentTrack.art === '/album_art.png' ? (
                                  <img 
                                    src="/album_art.png" 
                                    alt="Album Art" 
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <div className={`w-full h-full bg-gradient-to-tr ${currentTrack.color} rounded-full`} />
                                )}
                                {/* Center vinyl spindle hole */}
                                <div className="absolute w-6 h-6 bg-black border-2 border-neutral-700 rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-[#1DB954] rounded-full"></div>
                                </div>
                              </div>
                              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg pointer-events-none">
                                <SiSpotify size={16} className="text-black" />
                              </div>
                            </div>

                            {/* Song info */}
                            <div className="mt-4">
                              <h3 className="text-sm font-extrabold text-white tracking-wide">{currentTrack.title}</h3>
                              <p className="text-[10px] text-gray-400 mt-1">{currentTrack.artist}</p>
                              <p className="text-[8px] font-black text-[#1DB954] uppercase tracking-widest mt-1">{currentTrack.type}</p>
                            </div>

                            {/* Control Bar */}
                            <div className="w-full mt-6">
                              {/* Progress bar */}
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-mono text-gray-500">{formatSeconds(musicProgress)}</span>
                                <div 
                                  className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative"
                                  onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    const pct = (e.clientX - rect.left) / rect.width
                                    const newTime = Math.floor(pct * currentTrack.duration)
                                    setMusicProgress(newTime)
                                    if (audioRef.current) audioRef.current.currentTime = newTime
                                  }}
                                >
                                  <div 
                                    className="h-full bg-[#1DB954] rounded-full shadow-[0_0_8px_rgba(29,185,84,0.6)]"
                                    style={{ width: `${(musicProgress / currentTrack.duration) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-[8px] font-mono text-gray-500">{formatSeconds(currentTrack.duration)}</span>
                              </div>

                              {/* Playback Controls */}
                              <div className="flex items-center justify-center gap-6 mt-4">
                                <button 
                                  onClick={handlePrevTrack}
                                  className="text-gray-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
                                >
                                  <SkipBack size={18} />
                                </button>
                                <button 
                                  onClick={() => setIsPlaying(!isPlaying)}
                                  className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center active:scale-95 hover:scale-105 transition-transform shadow-[0_0_12px_rgba(29,185,84,0.4)] cursor-pointer"
                                >
                                  {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
                                </button>
                                <button 
                                  onClick={handleNextTrack}
                                  className="text-gray-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
                                >
                                  <SkipForward size={18} />
                                </button>
                              </div>
                            </div>

                          </div>

                          {/* Right Column: Burmester Sound Profiler & Playlists */}
                          <div className="w-56 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                            
                            {/* Playlist Container */}
                            <div className="flex-1 flex flex-col min-h-0">
                              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-3.5 block border-b border-white/5 pb-2">Burmester Playlist</span>
                              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-0">
                                {PLAYLIST.map((track, trackIdx) => {
                                  const isActive = currentTrackIdx === trackIdx
                                  return (
                                    <button
                                      key={trackIdx}
                                      onClick={() => playTrack(trackIdx)}
                                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                        isActive 
                                          ? 'border-[#1DB954]/40 bg-[#1DB954]/5 text-[#1DB954]' 
                                          : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                                      }`}
                                    >
                                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${track.color} flex items-center justify-center shrink-0`}>
                                        <Music size={10} className="text-white" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[9px] font-bold truncate">{track.title}</div>
                                        <div className="text-[7px] text-gray-500 truncate mt-0.5">{track.artist} · {track.type}</div>
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>

                            {/* EQ presets select */}
                            <div className="mt-4 border-t border-white/5 pt-3">
                              <span className="text-[7px] font-black text-gray-500 uppercase tracking-wider block mb-2">BURMESTER® 3D SURROUND</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {['Pure 3D', 'Live Concert', 'Easy Listening', 'Stage Focus'].map((soundProfile) => (
                                  <button 
                                    key={soundProfile} 
                                    className="py-1 text-[7px] font-bold bg-white/5 hover:bg-[#1DB954]/10 border border-white/10 hover:border-[#1DB954]/30 text-gray-400 hover:text-[#1DB954] rounded uppercase transition-all cursor-pointer"
                                  >
                                    {soundProfile}
                                  </button>
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}

                      {/* WHATSAPP APP OVERLAY */}
                      {activeOverlay === 'WhatsApp' && (
                        <div className="flex-1 flex gap-6 relative animate-fade-in w-full">
                          {/* Left Column: Chat thread selection */}
                          <div className="w-52 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col min-h-0">
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-3 block border-b border-white/5 pb-2">Chats</span>
                            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-0">
                              {[
                                { name: 'Michael', msg: 'On my way to the shoreline...', time: '10:46 AM', unread: true },
                                { name: 'Concierge', msg: 'Route guidance initialized...', time: 'Yesterday', unread: false },
                                { name: 'AMG Performance', msg: 'Safety telemetry diagnostics completed.', time: '2 days ago', unread: false }
                              ].map((chat, cIdx) => (
                                <button
                                  key={cIdx}
                                  className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                    cIdx === 0 
                                      ? 'border-[#25D366]/40 bg-[#25D366]/5 text-white' 
                                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-white/10">
                                    <User size={10} className="text-gray-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                      <span className="text-[9px] font-bold truncate">{chat.name}</span>
                                      <span className="text-[6px] text-gray-500 shrink-0">{chat.time}</span>
                                    </div>
                                    <div className="text-[7px] text-gray-500 truncate mt-0.5">{chat.msg}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Right Column: Chat area */}
                          <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                            <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 min-h-0">
                              {/* Received message */}
                              <div className="flex flex-col gap-1 max-w-[70%]">
                                <span className="text-[7px] text-gray-500 font-bold ml-1.5">Michael</span>
                                <div className="p-3 bg-neutral-900 border border-white/5 rounded-2xl rounded-tl-none text-xs text-gray-200">
                                  Hey! Are we still meeting at Shoreline Boulevard? I am driving the new EQS.
                                </div>
                                <span className="text-[6px] text-gray-600 ml-1.5 mt-0.5">10:45 AM</span>
                              </div>

                              {/* Sent message */}
                              <div className="flex flex-col gap-1 max-w-[70%] self-end items-end">
                                <span className="text-[7px] text-[#25D366] font-bold mr-1.5">You</span>
                                <div className="p-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl rounded-tr-none text-xs text-white">
                                  Yes, I am cruising in style too! Just shifted to autopilot now. See you soon.
                                </div>
                                <span className="text-[6px] text-gray-600 mr-1.5 mt-0.5">10:46 AM</span>
                              </div>
                            </div>

                            {/* Quick Replies */}
                            <div className="mt-4 border-t border-white/5 pt-3">
                              <span className="text-[7px] font-black text-gray-500 uppercase tracking-wider block mb-2">QUICK AUTO-REPLIES</span>
                              <div className="flex gap-2">
                                {[
                                  "Yes, see you there!",
                                  "Driving now, call you later.",
                                  "Sharing my ETA from MBUX."
                                ].map((reply, rIdx) => (
                                  <button 
                                    key={rIdx} 
                                    className="px-3 py-1.5 text-[8px] font-bold bg-white/5 hover:bg-[#25D366]/15 border border-white/10 hover:border-[#25D366]/30 text-gray-400 hover:text-white rounded-full transition-all cursor-pointer"
                                  >
                                    {reply}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CAR INFO OVERLAY */}
                      {activeOverlay === 'CarInfo' && (
                        <div className="flex-1 grid grid-cols-2 gap-6 items-center">
                          <div className="relative border border-white/5 bg-black/40 rounded-2xl p-6 h-full flex flex-col justify-center items-center">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest absolute top-4 left-4 flex items-center gap-1.5">
                              <Activity size={10} className={ambientColor === 'CYAN' ? 'text-cyan-400' : 'text-rose-400'} /> Sensor Chassis Graph
                            </span>
                            
                            <svg className="w-32 h-60 opacity-85" viewBox="0 0 100 200">
                              <path d="M 35 15 C 40 10 60 10 65 15 L 75 40 L 78 90 L 75 140 L 68 185 L 32 185 L 25 140 L 22 90 L 25 40 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                              <rect x="20" y="30" width="8" height="18" rx="2" fill={ambientColor === 'CYAN' ? '#00d2ff' : '#ff0055'} opacity="0.8" className="animate-pulse" />
                              <rect x="72" y="30" width="8" height="18" rx="2" fill={ambientColor === 'CYAN' ? '#00d2ff' : '#ff0055'} opacity="0.8" className="animate-pulse" />
                              <rect x="20" y="140" width="8" height="18" rx="2" fill={ambientColor === 'CYAN' ? '#00d2ff' : '#ff0055'} opacity="0.8" className="animate-pulse" />
                              <rect x="72" y="140" width="8" height="18" rx="2" fill={ambientColor === 'CYAN' ? '#00d2ff' : '#ff0055'} opacity="0.8" className="animate-pulse" />
                              <path d="M 30 100 L 70 100" stroke={ambientColor === 'CYAN' ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 0, 128, 0.4)'} strokeWidth="1.5" strokeDasharray="3, 3" />
                            </svg>
                            
                            <div className={`absolute top-24 left-4 text-[9px] font-mono bg-black/60 px-2 py-1 rounded border ${
                              ambientColor === 'CYAN' ? 'text-cyan-400 text-glow-cyan border-cyan-500/20' : 'text-rose-400 text-glow-magenta border-rose-500/20'
                            }`}>FL: 2.4 bar</div>
                            <div className={`absolute top-24 right-4 text-[9px] font-mono bg-black/60 px-2 py-1 rounded border ${
                              ambientColor === 'CYAN' ? 'text-cyan-400 text-glow-cyan border-cyan-500/20' : 'text-rose-400 text-glow-magenta border-rose-500/20'
                            }`}>FR: 2.5 bar</div>
                            <div className={`absolute bottom-24 left-4 text-[9px] font-mono bg-black/60 px-2 py-1 rounded border ${
                              ambientColor === 'CYAN' ? 'text-cyan-400 text-glow-cyan border-cyan-500/20' : 'text-rose-400 text-glow-magenta border-rose-500/20'
                            }`}>RL: 2.4 bar</div>
                            <div className={`absolute bottom-24 right-4 text-[9px] font-mono bg-black/60 px-2 py-1 rounded border ${
                              ambientColor === 'CYAN' ? 'text-cyan-400 text-glow-cyan border-cyan-500/20' : 'text-rose-400 text-glow-magenta border-rose-500/20'
                            }`}>RR: 2.5 bar</div>
                          </div>

                          <div className="flex flex-col justify-between h-full">
                            <div className="flex flex-col gap-4">
                              <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">Vehicle Core Diagnostics</h3>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
                                  <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Motor Temp</span>
                                  <div className={`text-sm font-bold mt-1 ${ambientColor === 'CYAN' ? 'text-cyan-400' : 'text-rose-400'}`}>65 °C</div>
                                </div>
                                <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
                                  <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Torque Split</span>
                                  <div className={`text-sm font-bold mt-1 ${ambientColor === 'CYAN' ? 'text-cyan-400' : 'text-rose-400'}`}>45:55 AWD</div>
                                </div>
                                <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
                                  <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Suspension Mode</span>
                                  <div className={`text-sm font-bold mt-1 ${ambientColor === 'CYAN' ? 'text-cyan-400' : 'text-rose-400'}`}>{ambientColor === 'CYAN' ? 'Adaptive Comfort' : 'Adaptive Sport'}</div>
                                </div>
                                <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
                                  <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Energy Flow</span>
                                  <div className="text-sm font-bold text-emerald-400 mt-1">Regen Active</div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                              <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                              <div>
                                <h4 className="text-xs font-bold text-emerald-500">Chassis Diagnostics Integrity</h4>
                                <p className="text-[9px] text-gray-400 mt-0.5">All structural nodes fully aligned and safe.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* WEB BROWSER OVERLAY */}
                      {activeOverlay === 'Browser' && (
                        <div className="flex-1 flex flex-col gap-4">
                          <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-2 rounded-xl text-xs">
                            <Globe size={14} className="text-gray-400 shrink-0" />
                            <div className={`bg-white/5 border border-white/5 px-2.5 py-0.5 rounded text-[10px] tracking-wider font-mono ${
                              ambientColor === 'CYAN' ? 'text-cyan-400' : 'text-rose-400'
                            }`}>https</div>
                            <input type="text" value="www.mercedes-benz.com/mbos-tech" className="bg-transparent border-none focus:outline-none w-full text-gray-200" disabled />
                          </div>
                          
                          <div className="flex-1 bg-white/3 border border-white/5 rounded-xl p-6 overflow-y-auto font-sans leading-relaxed text-xs">
                            <h2 className="text-base font-extrabold text-white mb-2">Mercedes-Benz MB.OS: The Software Architecture</h2>
                            <p className="text-gray-400 mb-3">
                              Mercedes-Benz Operating System (MB.OS) represents a proprietary chip-to-cloud architecture designed to decouple software development cycles from physical hardware constraints.
                            </p>
                            <p className="text-gray-400 mb-3">
                              By separating mixed-criticality execution pipelines (using dedicated microkernels for RTOS cluster readouts under ISO-26262 directives) from highly immersive infotainment layers (running on powerful GPU engines), the system achieves state-of-the-art failsafe reliability.
                            </p>
                            <p className="text-gray-400">
                              This zero-layer design enables instant navigation, streaming widgets, and ambient control interfaces to run side-by-side without compromises.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* REVERSE CAMERA */}
                      {activeOverlay === 'Camera' && (
                        <div className="flex-1 flex gap-6 relative">
                          <div className="flex-1 bg-neutral-950 border border-white/5 rounded-xl overflow-hidden relative flex justify-center items-center">
                            <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1)_0%,transparent_80%)]">
                              <svg className="w-full h-full stroke-cyan-500/10 stroke-[0.5]" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M 0 0 L 100 100 M 100 0 L 0 100" />
                                <circle cx="50" cy="50" r="20" fill="none" />
                                <circle cx="50" cy="50" r="40" fill="none" />
                              </svg>
                            </div>
                            
                            <svg className="absolute bottom-0 w-80 h-44 z-10 opacity-75" viewBox="0 0 100 50">
                              <path d="M 15 50 Q 30 25 45 10" fill="none" stroke="#ffaa00" strokeWidth="1.5" strokeDasharray="2, 2" />
                              <path d="M 85 50 Q 70 25 55 10" fill="none" stroke="#ffaa00" strokeWidth="1.5" strokeDasharray="2, 2" />
                              <line x1="33" y1="20" x2="67" y2="20" stroke="#ff3344" strokeWidth="1.5" />
                              <line x1="40" y1="10" x2="60" y2="10" stroke="#ff3344" strokeWidth="1" />
                            </svg>

                            <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[9px] font-bold text-red-500 bg-black/60 border border-red-500/20 px-2 py-0.5 rounded">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                              REAR WIDE SCREEN
                            </div>

                            <span className="text-[10px] font-mono text-gray-500 z-10 uppercase tracking-[0.2em]">Check Surroundings for Safety</span>
                          </div>

                          <div className="w-48 bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between items-center relative">
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest text-center">360° VIEW</span>
                            
                            <div className="w-16 h-28 border border-white/20 rounded-lg relative flex items-center justify-center bg-neutral-900/50 my-auto">
                              <div className="absolute w-2 h-2 rounded-full bg-cyan-400 text-glow-cyan animate-ping"></div>
                              <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-wider text-glow-cyan">MB.OS</span>
                            </div>

                            <div className="flex gap-2 w-full mt-2">
                              <button className="flex-1 py-1 text-[8px] font-bold bg-white/5 border border-white/10 rounded uppercase hover:bg-white/10 active:scale-95 transition-all cursor-pointer">Rear</button>
                              <button className="flex-1 py-1 text-[8px] font-bold bg-white/5 border border-white/10 rounded uppercase hover:bg-white/10 active:scale-95 transition-all cursor-pointer">Front</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* YOUTUBE APP */}
                      {activeOverlay === 'YouTube' && (
                        <div className="flex-1 bg-black border border-white/5 rounded-xl overflow-hidden relative flex flex-col justify-between p-6">
                          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.15)_0%,transparent_75%)]"></div>
                          
                          <div className="flex justify-between items-center z-10">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-5 bg-red-600 rounded flex items-center justify-center">
                                <Play size={10} className="fill-white text-white ml-0.5" />
                              </div>
                              <span className="text-xs font-bold text-white tracking-wider">MBUX Theater</span>
                            </div>
                            <span className="text-[8px] text-gray-500 font-mono">1080P ACTIVE</span>
                          </div>

                          <div className="my-auto flex flex-col justify-center items-center z-10 gap-3">
                            <div className="w-14 h-14 rounded-full bg-red-600/10 border border-red-500/30 flex justify-center items-center animate-pulse">
                              <Tv size={24} className="text-red-500" />
                            </div>
                            <div className="text-center">
                              <h4 className="text-xs font-bold">MB.OS Cinematic Concept Reveal</h4>
                              <p className="text-[9px] text-gray-500 mt-1">456,801 Views • 3 days ago</p>
                            </div>
                          </div>

                          <div className="w-full flex flex-col gap-1 z-10">
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full w-2/3 bg-red-600"></div>
                            </div>
                            <div className="flex justify-between items-center text-[8px] text-gray-500 font-bold font-mono">
                              <span>3:24</span>
                              <span>5:10</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MBUX AUGMENTED REALITY NAVIGATION APP (MBUX AR Cues) */}
                      {activeOverlay === 'ARNav' && (
                        <div className="flex-1 bg-slate-950 border border-white/10 rounded-xl overflow-hidden relative flex flex-col justify-between p-6">
                          
                          {/* Mock Road view camera streams */}
                          <div className="absolute inset-0 opacity-40 z-0">
                            <svg className="w-full h-full object-cover scale-105" viewBox="0 0 400 300">
                              <path d="M 0 300 L 150 120 L 250 120 L 400 300" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                              {/* Glowing blue lane indicators */}
                              <path d="M 130 140 Q 200 130 230 300" fill="none" stroke="#00f0ff" strokeWidth="4" strokeDasharray="5, 10" className="animate-road-flow" style={{ animationDuration: '3s' }} />
                              <path d="M 270 140 Q 200 130 170 300" fill="none" stroke="#00f0ff" strokeWidth="4" strokeDasharray="5, 10" className="animate-road-flow" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                            </svg>
                          </div>

                          {/* Floating AR blue navigation guidance turn arrow */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
                            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                              <Navigation2 size={36} className="text-cyan-400 text-glow-cyan rotate-90" />
                            </div>
                            <span className="text-[10px] font-black text-cyan-400 text-glow-cyan uppercase bg-black/60 px-3 py-1 rounded-full border border-cyan-500/20">Turn Right In 300m</span>
                          </div>

                          <div className="flex justify-between items-center z-10">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-cyan-400 bg-black/60 border border-cyan-500/20 px-2 py-0.5 rounded">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                              FRONT AR CAM FEED
                            </div>
                            <span className="text-[8px] text-gray-500 font-mono">AUGMENTED REALITY ACTIVE</span>
                          </div>

                          <div className="mt-auto z-10 bg-black/75 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                            <CornerUpRight size={24} className="text-cyan-400 text-glow-cyan shrink-0" />
                            <div className="flex flex-col">
                              <h4 className="text-xs font-bold text-white">Shoreline Boulevard</h4>
                              <p className="text-[9px] text-gray-400 mt-0.5">Follow holographic road cues to target destination.</p>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                )}

              </div>

              {/* FAR RIGHT COLUMN (APPS GRID & MEDIA) */}
              <div className="w-1/3 h-full flex flex-col justify-between gap-6">
                
                {/* Apps Grid Panel */}
                <div className={`flex-1 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 ${
                  displayState === 'NOMINAL' 
                    ? 'border-t border-l border-white/15 border-r border-b border-white/5 bg-slate-950/40 backdrop-blur-md shadow-md' 
                    : 'border border-neutral-800 bg-neutral-900'
                }`}>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[9px] tracking-[0.25em] text-gray-500 uppercase font-bold">SYSTEM APPS</span>
                    <SlidersHorizontal size={12} className="text-gray-500" />
                  </div>

                  <div className="grid grid-cols-4 gap-2.5 my-auto">
                    {[
                      { id: 'Navigation', icon: Map, label: 'Navigation', color: 'text-cyan-400' },
                      { id: 'Spotify', icon: SiSpotify, label: 'Media', color: 'text-[#1DB954]' },
                      { id: 'WhatsApp', icon: SiWhatsapp, label: 'WhatsApp', color: 'text-[#25D366]' },
                      { id: 'CarInfo', icon: Sliders, label: 'Car Info', color: 'text-amber-400' },
                      { id: 'YouTube', icon: SiYoutube, label: 'YouTube', color: 'text-[#FF0000]' },
                      { id: 'Spotify', icon: SiSpotify, label: 'Spotify', color: 'text-[#1DB954]' },
                      { id: 'Browser', icon: Globe, label: 'Browser', color: 'text-purple-400' },
                      { id: 'Camera', icon: Camera, label: 'Camera', color: 'text-yellow-400' }
                    ].map((app, idx) => {
                      const IconComp = app.icon
                      const isActiveOverlay = activeOverlay === app.id || (app.id === 'Navigation' && activeOverlay === 'ARNav')
                      return (
                        <button 
                          key={idx}
                          onClick={() => handleAppClick(app.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-500 ease-out cursor-pointer ${
                            isActiveOverlay
                              ? (ambientColor === 'CYAN' ? 'bg-cyan-500/15 border-cyan-500/40 scale-105 shadow-md shadow-cyan-950/20' : 'bg-rose-500/15 border-rose-500/40 scale-105 shadow-md shadow-rose-950/20')
                              : (displayState === 'NOMINAL' 
                                ? 'bg-white/4 border border-white/5 hover:bg-white/10 hover:border-white/40 hover:-translate-y-1 active:scale-95 shadow-sm' 
                                : 'bg-neutral-800/60 border border-neutral-800')
                          }`}
                        >
                          <IconComp 
                            size={18} 
                            className={`transition-all duration-500 ${
                              isActiveOverlay
                                ? (ambientColor === 'CYAN' ? 'text-cyan-400 text-glow-cyan' : 'text-rose-400 text-glow-magenta')
                                : (displayState === 'NOMINAL' ? app.color : 'text-neutral-400')
                            }`} 
                          />
                          <span className="text-[8px] text-gray-400 font-bold mt-1 text-center truncate w-full">
                            {app.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Media Player Glass Card */}
                <div className={`rounded-3xl p-5 flex flex-col gap-3 transition-all duration-300 ${
                  displayState === 'NOMINAL' 
                    ? 'border-t border-l border-white/15 border-r border-b border-white/5 bg-slate-950/60 backdrop-blur-xl shadow-lg' 
                    : 'border border-neutral-800 bg-neutral-900'
                }`}>
                  <div className="flex items-center gap-4">
                    
                    <div className="relative shrink-0">
                      {displayState === 'NOMINAL' ? (
                        <div className="relative group cursor-pointer w-14 h-14 rounded-full overflow-hidden border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-900/30">
                          {currentTrack.art === '/album_art.png' ? (
                            <img 
                              src="/album_art.png" 
                              alt="Celestial Drive" 
                              className={`w-full h-full object-cover rounded-full ${
                                isPlaying ? 'animate-spin-slow' : ''
                              }`}
                              style={{ animationDuration: '24s' }}
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-tr ${currentTrack.color} rounded-full ${
                              isPlaying ? 'animate-spin-slow' : ''
                            }`} style={{ animationDuration: '24s' }} />
                          )}
                          <div className="absolute w-2 h-2 bg-black border border-white/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                          <SiSpotify size={20} className="text-[#1DB954] text-glow-cyan animate-pulse" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                        {currentTrack.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate font-medium">{currentTrack.artist} · {currentTrack.type}</p>
                      
                      {displayState === 'NOMINAL' && isPlaying && (
                        <div className="flex items-end gap-0.5 h-3.5 mt-1">
                          {equalizerHeights.map((h, i) => (
                            <div 
                              key={i} 
                              className={`w-[2px] rounded-full transition-all duration-150 ${
                                ambientColor === 'CYAN' ? 'bg-cyan-400' : 'bg-rose-400 text-glow-magenta'
                              }`}
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3.5 shrink-0">
                      <button 
                        onClick={handlePrevTrack}
                        className="text-gray-500 hover:text-white cursor-pointer active:scale-90 transition-all duration-500 ease-out hover:scale-110"
                      >
                        <SkipBack size={16} />
                      </button>
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-500 ease-out ${
                          displayState === 'NOMINAL' 
                            ? (ambientColor === 'CYAN' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-glow-cyan shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:bg-cyan-500/25 hover:border-cyan-400/50 hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 text-glow-magenta shadow-[0_0_10px_rgba(244,63,94,0.2)] hover:bg-rose-500/25 hover:border-rose-400/50 hover:shadow-[0_0_12px_rgba(244,63,94,0.4)]') 
                            : 'bg-white text-black hover:bg-neutral-200'
                        }`}
                      >
                        {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
                      </button>
                      <button 
                        onClick={handleNextTrack}
                        className="text-gray-500 hover:text-white cursor-pointer active:scale-90 transition-all duration-500 ease-out hover:scale-110"
                      >
                        <SkipForward size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div 
                      className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const pct = (e.clientX - rect.left) / rect.width
                        const newTime = Math.floor(pct * currentTrack.duration)
                        setMusicProgress(newTime)
                        if (audioRef.current) audioRef.current.currentTime = newTime
                      }}
                    >
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          displayState === 'NOMINAL' ? (ambientColor === 'CYAN' ? 'bg-gradient-to-r from-cyan-400 to-purple-400' : 'bg-gradient-to-r from-rose-400 to-purple-400') : 'bg-white'
                        }`}
                        style={{ width: `${(musicProgress / currentTrack.duration) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[8px] text-gray-500 font-bold">
                      <span>{formatSeconds(musicProgress)}</span>
                      <span>{formatSeconds(currentTrack.duration)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </>
          ) : (
            // CRITICAL FAILOVER LAYOUT
            <>
              {/* Left 2/3: Emergency Notice */}
              <div className="w-2/3 h-full rounded-3xl bg-black border border-red-950/40 flex flex-col items-center justify-center text-center p-12">
                <AlertTriangle size={64} className="text-red-500 text-glow-red animate-pulse" />
                <h1 className="text-2xl font-black text-red-500 tracking-wider uppercase mt-6 text-glow-red">
                  CRITICAL FAILOVER ACTIVE
                </h1>
                <p className="text-sm font-mono text-gray-400 max-w-sm mt-3 leading-relaxed">
                  ISO-26262 functional safety limits initialized. All non-essential graphics cores are powered down.
                </p>
                <div className="mt-8 px-6 py-2 border border-red-500/30 bg-red-950/20 text-red-500 text-xs font-mono font-bold tracking-widest uppercase rounded">
                  {recoveryStage === 'INITIATED' 
                    ? 'RECOVERY INIT: POWER CYCLING...' 
                    : 'SYSTEM CORE: DEGRADED OPERATION'}
                </div>

                {/* Manual Recovery and Reboot Button */}
                <button
                  disabled={recoveryStage === 'INITIATED'}
                  onClick={() => {
                    // Clear any prior timers
                    if (rebootTimerRef.current) clearTimeout(rebootTimerRef.current)

                    // Send reset signal to watchdog backend
                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                      wsRef.current.send(JSON.stringify({ action: "reset" }))
                    }

                    // Step 1: Initiate recovery (Show Critical Failover with status label for 2 seconds)
                    setRecoveryStage('INITIATED')

                    const t1 = setTimeout(() => {
                      // Step 2: Shut down (Blackout) for 2 seconds
                      setDisplayState('BLACKOUT')
                      setRecoveryStage(null)

                      const t2 = setTimeout(() => {
                        // Step 3: Rebooting circular loader for 3 seconds
                        setDisplayState('REBOOTING')

                        const t3 = setTimeout(() => {
                          // Step 4: Restore NOMINAL
                          setDisplayState('NOMINAL')
                          setSystemState('NOMINAL')
                        }, 3000)
                        rebootTimerRef.current = t3
                      }, 2000)
                      rebootTimerRef.current = t2
                    }, 2000)
                    rebootTimerRef.current = t1
                  }}
                  className={`mt-8 px-6 py-2.5 rounded-full border border-cyan-500/40 bg-cyan-950/15 text-cyan-400 font-black text-[10px] uppercase tracking-widest hover:bg-cyan-500/25 active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.35)] cursor-pointer text-glow-cyan ${
                    recoveryStage === 'INITIATED' ? 'opacity-50 cursor-not-allowed animate-pulse' : ''
                  }`}
                >
                  {recoveryStage === 'INITIATED' 
                    ? '⚡ REBOOTING IN 2S...' 
                    : '🔄 RECOVER & REBOOT SYSTEM'}
                </button>
              </div>

              {/* Right 1/3: Telemetry Status */}
              <div className="w-1/3 h-full rounded-3xl bg-black border border-red-950/40 p-6 flex flex-col justify-between font-mono">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-red-950/40 mb-4">
                    <span className="text-[10px] text-red-500 font-bold">TELEMETRY CHECKLIST</span>
                    <span className="text-[8px] text-gray-500">V.2.62</span>
                  </div>
                  
                  <div className="flex flex-col gap-3 text-xs">
                    {[
                      { name: 'Steering', status: 'OK', color: 'text-emerald-500 text-glow-white' },
                      { name: 'Brakes', status: 'OK', color: 'text-emerald-500 text-glow-white' },
                      { name: 'Powertrain', status: 'OK', color: 'text-emerald-500 text-glow-white' },
                      { name: 'Battery', status: '68%', color: 'text-amber-500 text-glow-amber' },
                      { name: 'GPS', status: 'OK', color: 'text-emerald-500 text-glow-white' },
                      { name: 'Connectivity', status: 'LOST', color: 'text-red-500 text-glow-red' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-white/3">
                        <span className="text-gray-400 font-semibold">{item.name}</span>
                        <span className={`font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${item.color}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[9px] text-emerald-500 border border-emerald-950/40 bg-emerald-950/20 px-3 py-2 rounded-lg">
                  <ShieldCheck size={14} className="shrink-0" />
                  <span>ISO DIAGNOSTICS: CRITICAL FUNCTIONS SAFE</span>
                </div>
              </div>
            </>
          )}

          {/* SHADOW AI HUD OVERLAY */}
          <div className={`absolute top-6 left-6 z-40 transition-all duration-700 ease-out p-[1.5px] overflow-hidden ${hudStyle.size} ${displayState === 'REBOOTING' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`}>
            {/* Spinning iridescent edge glow background */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden z-0 pointer-events-none">
              <div className={`absolute -inset-10 bg-gradient-to-r ${hudStyle.glow} animate-[spin_4s_linear_infinite] blur-md opacity-80`}></div>
            </div>

            {/* Inner container (masks center of glow) */}
            <div className={`relative w-full h-full bg-black/85 ${hudStyle.innerRound} backdrop-blur-3xl p-3 z-10 transition-all duration-700 ease-out overflow-hidden`}>
              
              {/* NOMINAL HUD */}
              {displayState === 'NOMINAL' && (
                <div className="flex items-center justify-center gap-2 h-full w-full px-2 animate-fade-in">
                  <span className={`w-1.5 h-1.5 rounded-full ${hudStyle.dot} shrink-0`}></span>
                  <span className="text-[9px] font-black tracking-widest text-white/80 uppercase">
                    Shadow AI: Optimized
                  </span>
                </div>
              )}

              {/* DEGRADED HUD */}
              {displayState === 'DEGRADED' && (
                <div className="flex flex-col h-full justify-between animate-fade-in font-sans text-left">
                  <div className="flex justify-between items-center border-b border-amber-500/20 pb-1">
                    <span className="font-black text-[9px] text-amber-400 tracking-wider uppercase">System Tuning</span>
                    <span className="font-mono text-[8px] text-amber-500 font-bold">RAM: {Math.round(ramUsage)}%</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-1 mt-1 text-[9px] text-gray-300 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                      <span>Isolating memory leak</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                      <span>Tuning display pipelines</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FAILOVER HUD */}
              {displayState === 'FAILOVER' && (
                <div className="flex flex-col h-full justify-between animate-fade-in font-sans text-left">
                  <div className="flex justify-between items-center border-b border-red-500/20 pb-1">
                    <span className="font-black text-[9px] text-red-500 tracking-wider uppercase">Driver Protection</span>
                    <span className="font-mono text-[8px] text-red-500 font-bold">RAM: {Math.round(ramUsage)}%</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-1 mt-1 text-[9px] text-gray-300 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-red-500 animate-ping"></span>
                      <span className="text-red-400 font-bold">Infotainment suspended</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                      <span className="text-emerald-400">Protecting driver core</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM CLIMATE BAR & STATE SELECTOR */}
      <div className={`w-full h-16 px-8 flex justify-between items-center z-20 ${
        systemState === 'FAILOVER' 
          ? 'border-t border-red-950/40 bg-black' 
          : 'border-t border-white/5 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-md'
      }`}>
        
        {/* Left AC Controls + Seat heating cycling */}
        {systemState !== 'FAILOVER' ? (
          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* Heat Toggle (Red cycles 0 to 3) */}
            <button 
              onClick={() => toggleSeatHeater('driver')}
              title={`Driver Seat Heating: Level ${seatHeatDriver}`}
              className={`w-8 h-8 rounded-full border flex items-center justify-center active:scale-90 transition-all duration-500 ease-out cursor-pointer relative ${
                seatHeatDriver > 0 
                  ? 'border-orange-500 bg-orange-950/20 text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]' 
                  : 'border-white/10 hover:bg-white/10 hover:border-white/30 text-gray-400'
              }`}
            >
              <Flame size={14} />
              {/* Heating Level dots */}
              {seatHeatDriver > 0 && (
                <span className="absolute bottom-0.5 flex gap-0.5 justify-center w-full">
                  {Array.from({ length: seatHeatDriver }).map((_, d) => (
                    <span key={d} className="w-1 h-1 rounded-full bg-orange-500"></span>
                  ))}
                </span>
              )}
            </button>

            {/* Cool Toggle (Blue cycles 0 to 3) */}
            <button 
              onClick={() => toggleSeatCooler('driver')}
              title={`Driver Seat Cooling: Level ${seatCoolDriver}`}
              className={`w-8 h-8 rounded-full border flex items-center justify-center active:scale-90 transition-all duration-500 ease-out cursor-pointer relative ${
                seatCoolDriver > 0 
                  ? (ambientColor === 'CYAN' ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]' : 'border-rose-500 bg-rose-950/20 text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]')
                  : 'border-white/10 hover:bg-white/10 hover:border-white/30 text-gray-400'
              }`}
            >
              <Snowflake size={14} />
              {seatCoolDriver > 0 && (
                <span className="absolute bottom-0.5 flex gap-0.5 justify-center w-full">
                  {Array.from({ length: seatCoolDriver }).map((_, d) => (
                    <span key={d} className={`w-1 h-1 rounded-full animate-pulse ${ambientColor === 'CYAN' ? 'bg-cyan-500' : 'bg-rose-500'}`}></span>
                  ))}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-white/10 ml-1"></div>

            {/* Temp adjust */}
            <button 
              onClick={() => setAcTempDriver(prev => parseFloat((prev - 0.5).toFixed(1)))}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center active:scale-90 transition-all duration-500 ease-out hover:bg-white/10 hover:border-white/30 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-glow-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{acTempDriver.toFixed(1)}</span>
              <span className="text-[10px] text-gray-500">°C</span>
            </div>
            <button 
              onClick={() => setAcTempDriver(prev => parseFloat((prev + 0.5).toFixed(1)))}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center active:scale-90 transition-all duration-500 ease-out hover:bg-white/10 hover:border-white/30 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-wider text-glow-red">
            DRVR AC: SYSTEM SUSPENDED
          </div>
        )}

        {/* Center: System State Selector console */}
        <div className={`flex items-center gap-1.5 p-1 rounded-full ${
          systemState === 'FAILOVER' 
            ? 'bg-red-950/20 border border-red-800/40' 
            : 'glass-pill'
        }`}>
          {[
            { id: 'NOMINAL', label: 'NOMINAL', activeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-glow-cyan shadow-[0_0_10px_rgba(6,182,212,0.25)]' },
            { id: 'DEGRADED', label: 'GRACEFUL DEGRADATION', activeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
            { id: 'FAILOVER', label: 'FAILOVER MODE', activeColor: 'bg-red-500/20 text-red-500 border-red-500/40 text-glow-red animate-pulse' }
          ].map((state) => {
            const isActive = systemState === state.id
            return (
              <button
                key={state.id}
                onClick={() => {
                  setSystemState(state.id)
                  setActiveOverlay(null)
                  if (state.id === 'FAILOVER') {
                    setCallActive(false)
                  }
                  // Broadcast state update to watchdog server
                  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    const wsAction = state.id === 'NOMINAL' ? 'reset' : state.id === 'DEGRADED' ? 'degrade' : 'failover'
                    wsRef.current.send(JSON.stringify({ action: wsAction }))
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest transition-all duration-300 cursor-pointer border border-transparent ${
                  isActive 
                    ? (state.id === 'NOMINAL' && ambientColor === 'MAGENTA' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 text-glow-magenta shadow-[0_0_10px_rgba(244,63,94,0.25)]' : state.activeColor) 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {state.label}
              </button>
            )
          })}
        </div>

        {/* Right AC Controls + Seat heating cycling */}
        {systemState !== 'FAILOVER' ? (
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button 
              onClick={() => setAcTempPassenger(prev => parseFloat((prev - 0.5).toFixed(1)))}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center active:scale-90 transition-all duration-500 ease-out hover:bg-white/10 hover:border-white/30 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-glow-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{acTempPassenger.toFixed(1)}</span>
              <span className="text-[10px] text-gray-500">°C</span>
            </div>
            <button 
              onClick={() => setAcTempPassenger(prev => parseFloat((prev + 0.5).toFixed(1)))}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center active:scale-90 transition-all duration-500 ease-out hover:bg-white/10 hover:border-white/30 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>

            <div className="h-6 w-px bg-white/10 mr-1"></div>

            {/* Heat Toggle (Passenger) */}
            <button 
              onClick={() => toggleSeatHeater('passenger')}
              title={`Passenger Seat Heating: Level ${seatHeatPassenger}`}
              className={`w-8 h-8 rounded-full border flex items-center justify-center active:scale-90 transition-all duration-500 ease-out cursor-pointer relative ${
                seatHeatPassenger > 0 
                  ? 'border-orange-500 bg-orange-950/20 text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]' 
                  : 'border-white/10 hover:bg-white/10 hover:border-white/30 text-gray-400'
              }`}
            >
              <Flame size={14} />
              {seatHeatPassenger > 0 && (
                <span className="absolute bottom-0.5 flex gap-0.5 justify-center w-full">
                  {Array.from({ length: seatHeatPassenger }).map((_, d) => (
                    <span key={d} className="w-1 h-1 rounded-full bg-orange-500"></span>
                  ))}
                </span>
              )}
            </button>

            {/* Cool Toggle (Passenger) */}
            <button 
              onClick={() => toggleSeatCooler('passenger')}
              title={`Passenger Seat Cooling: Level ${seatCoolPassenger}`}
              className={`w-8 h-8 rounded-full border flex items-center justify-center active:scale-90 transition-all duration-500 ease-out cursor-pointer relative ${
                seatCoolPassenger > 0 
                  ? (ambientColor === 'CYAN' ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]' : 'border-rose-500 bg-rose-950/20 text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]')
                  : 'border-white/10 hover:bg-white/10 hover:border-white/30 text-gray-400'
              }`}
            >
              <Snowflake size={14} />
              {seatCoolPassenger > 0 && (
                <span className="absolute bottom-0.5 flex gap-0.5 justify-center w-full">
                  {Array.from({ length: seatCoolPassenger }).map((_, d) => (
                    <span key={d} className={`w-1 h-1 rounded-full animate-pulse ${ambientColor === 'CYAN' ? 'bg-cyan-500' : 'bg-rose-500'}`}></span>
                  ))}
                </span>
              )}
            </button>
          </div>
        ) : (
          <div className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-wider text-glow-red">
            PASS AC: SYSTEM SUSPENDED
          </div>
        )}

      </div>

    </div>
  )
}

// Constants
const maxSpeed = 280
