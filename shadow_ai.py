import asyncio
import websockets
import json
import random

system_data = {
    "speed": 120,
    "rpm": 3600,
    "battery": 85,
    "range": 520,
    "state": "NOMINAL",
    "cpu_load": 25.0,
    "ram_usage": 45.0
}

async def run_watchdog():
    global system_data
    while True:
        # Simulate live safety domain metrics
        # Cruising speed: dynamic cruise control model
        current = system_data["speed"]
        if current > 40:
            target = 120
            # Slowly guide speed back to 120 km/h target
            system_data["speed"] += (target - current) * 0.05
            if random.random() < 0.1:
                system_data["speed"] += random.choice([-1, 1])
            # Clamp limits
            system_data["speed"] = max(41, min(240, system_data["speed"]))
        else:
            # Natural friction coast-decay to 0 when moving slow or stopped
            if current > 0:
                system_data["speed"] = max(0, current - 1)
        
        system_data["rpm"] = int(system_data["speed"] * 30 + random.randint(-15, 15))
        
        # Watchdog degradation & failover thresholds based on RAM utilization
        if system_data["ram_usage"] >= 90.0:
            system_data["state"] = "CRITICAL FAILOVER"
        elif system_data["ram_usage"] >= 75.0:
            system_data["state"] = "GRACEFUL DEGRADATION"
        else:
            if system_data["state"] != "CRITICAL FAILOVER":
                system_data["state"] = "NOMINAL"
        await asyncio.sleep(0.1)

async def send_telemetry(websocket):
    try:
        while True:
            await websocket.send(json.dumps(system_data))
            await asyncio.sleep(0.1)
    except websockets.exceptions.ConnectionClosed:
        pass

async def receive_commands(websocket):
    global system_data
    try:
        async for message in websocket:
            data = json.loads(message)
            # Handle client-side commands
            if "action" in data:
                action = data["action"]
                if action == "reset":
                    system_data["ram_usage"] = 40.0
                    system_data["state"] = "NOMINAL"
                    print("\n[Watchdog] System State set to NOMINAL by Client.")
                elif action == "degrade":
                    system_data["ram_usage"] = 80.0
                    system_data["state"] = "GRACEFUL DEGRADATION"
                    print("\n[Watchdog] System State set to GRACEFUL DEGRADATION by Client.")
                elif action == "failover":
                    system_data["ram_usage"] = 95.0
                    system_data["state"] = "CRITICAL FAILOVER"
                    print("\n[Watchdog] System State set to CRITICAL FAILOVER by Client.")
            elif "speed" in data:
                # Update speed from frontend sports pedals
                system_data["speed"] = data["speed"]
                system_data["rpm"] = int(data["speed"] * 28 + 1000)
    except websockets.exceptions.ConnectionClosed:
        pass

async def broadcast_telemetry(websocket):
    # Concurrently send telemetry and listen for client commands
    await asyncio.gather(
        send_telemetry(websocket),
        receive_commands(websocket)
    )

async def cli_controller():
    global system_data
    loop = asyncio.get_event_loop()
    while True:
        print("\n--- SHADOW AI WATCHDOG CONTROL PANEL ---")
        print("1: Clear Chaos (Set State to NOMINAL)")
        print("2: Inject Chaos Bomb (RAM Spike -> GRACEFUL DEGRADATION)")
        print("3: Inject Critical Chaos Bomb (RAM > 90% -> CRITICAL FAILOVER)")
        choice = await loop.run_in_executor(None, input, "Select action: ")
        if choice == '1':
            system_data["ram_usage"] = 40.0
            system_data["state"] = "NOMINAL"
        elif choice == '2':
            system_data["ram_usage"] = 80.0
        elif choice == '3':
            system_data["ram_usage"] = 95.0

async def main():
    server = await websockets.serve(broadcast_telemetry, "localhost", 8080)
    print("Shadow AI Watchdog server broadcasting on ws://localhost:8080")
    await asyncio.gather(server.wait_closed(), run_watchdog(), cli_controller())

if __name__ == "__main__":
    asyncio.run(main())
