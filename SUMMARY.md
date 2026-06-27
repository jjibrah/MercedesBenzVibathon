# Shadow AI System Summary

## Overview

This workspace implements a small Software-in-the-Loop simulation architecture for Shadow AI.
The current system consists of:

- `simulation/fake_car.py` — a virtual vehicle simulator that reads OBD-II dataset records and sends telemetry over UDP.
- `backend_infrastructure/central_relay.py` — a UDP relay that validates telemetry, measures relay latency, and forwards messages between simulator, AI/watchdog, and frontend endpoints.
- `backend_infrastructure/json_validator.py` — validation logic used by the relay to accept or reject simulator telemetry.
- `backend_infrastructure/protocol_config.json` — the canonical network configuration for host and UDP ports.
- `simulation/telemetry_receiver_test.py` — a basic telemetry consumer to verify forwarded packets.
- `simulation/chaos_bomb.py` / `simulation/reset_simulation.py` — simple command clients to exercise memory-leak attack and recovery commands.

## Architecture Breakdown

### 1. Network configuration

The relay uses `backend_infrastructure/protocol_config.json` as the authoritative configuration.
It defines:

- `host`: `127.0.0.1`
- `ports.simulation_in`: `5004`
- `ports.ai_telemetry_out`: `5005`
- `ports.ai_command_in`: `5006`
- `ports.frontend_out`: `5007`

These ports define the current system boundary between the simulator, relay, AI/watchdog, and frontend.

### 2. Simulator behavior (`simulation/fake_car.py`)

`fake_car.py` loads `simulation/vehicle_data.csv` and converts each row into metrics including:

- `speed_kph`
- `engine_rpm`
- `gear`
- `ecu_memory_percent`
- `simulation_mode`
- `timestamp`
- `sequence`
- `vehicle_id`

The simulator sends telemetry packets every `0.1` seconds via UDP to:

- `127.0.0.1:5004` (`protocol_config.json` `simulation_in`)

It also opens a local UDP listener on:

- `127.0.0.1:5007` (`protocol_config.json` `frontend_out`)

This listener consumes commands forwarded by the relay, such as:

- `START_MEMORY_LEAK`
- `STOP_MEMORY_LEAK`
- `RESET_VIRTUAL_MEMORY`
- `SHUTDOWN_SIMULATION`

The simulator manages an internal memory state and adjusts `ecu_memory_percent` over time when a memory leak is active.

### 3. Relay behavior (`backend_infrastructure/central_relay.py`)

The relay starts two daemon threads:

- `telemetry_relay()`
- `command_relay()`

#### `telemetry_relay()`

- Binds to `127.0.0.1:5004`
- Receives UDP telemetry packets from the simulator
- Validates payloads through `backend_infrastructure/json_validator.py`
- When valid, forwards the packet unchanged to `127.0.0.1:5005`
- Logs telemetry latency to `latency_monitor.log`

#### `command_relay()`

- Binds to `127.0.0.1:5006`
- Receives UDP packets from AI/watchdog systems
- Forwards them unchanged to `127.0.0.1:5007`
- Logs command latency and command content to `latency_monitor.log`

The relay is designed as a central network infrastructure component that can be extended to perform additional auditing, filtering, or message enrichment.

### 4. Validation (`backend_infrastructure/json_validator.py`)

The relay validates incoming telemetry before forwarding it.
Current validation rules:

- Payload must decode as UTF-8 JSON
- Payload must be a JSON object
- Required fields:
  - `timestamp` (number)
  - `vehicle_id` (string)
- Optional field validation:
  - `ecu_memory_percent` must be numeric if present

If validation fails, the packet is dropped and an audit log entry is written.

## Current Data Flows

### Telemetry path

```
simulation/fake_car.py --UDP--> relay on 127.0.0.1:5004
relay validates packet --> forwards to 127.0.0.1:5005
telemetry_receiver_test.py or AI component listens on 127.0.0.1:5005
```

### Command path

```
AI/watchdog --UDP--> relay on 127.0.0.1:5006
relay forwards command --> 127.0.0.1:5007
simulation/fake_car.py listens on 127.0.0.1:5007
```

## Example packet formats

### Telemetry packet

```json
{
  "timestamp": 1782545452.879,
  "sequence": 549,
  "vehicle_id": "SHADOW_ECU_01",
  "speed_kph": 22.0,
  "engine_rpm": 1261.0,
  "gear": "D2",
  "ecu_memory_percent": 40.0,
  "simulation_mode": "NORMAL"
}
```

### Command packet

```json
{
  "command": "RESET_VIRTUAL_MEMORY",
  "target_memory_percent": 40.0,
  "timestamp": 1782545457.123
}
```

## How to run the current system

1. Start the relay:

```powershell
cd backend_infrastructure
python central_relay.py
```

2. Start the telemetry receiver / AI test listener:

```powershell
cd simulation
python telemetry_receiver_test.py
```

3. Start the simulator:

```powershell
cd simulation
python fake_car.py
```

4. Send commands to the relay:

```powershell
cd simulation
python chaos_bomb.py
python reset_simulation.py
```

## Notes

- The relay is the main integration point between the simulation and external AI or frontend systems.
- The simulator no longer binds directly to `5006`; it receives forwarded commands on `5007`.
- `protocol_config.json` is the single source of truth for UDP port mapping.
- `latency_monitor.log` records relay performance and errors.
