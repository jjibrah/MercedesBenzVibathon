# Shadow AI — Simulation Engineer Package

This package implements the Software-in-the-Loop virtual vehicle for the Shadow AI project.

## Included dataset

`simulation/vehicle_data.csv` is the `dailyRoutes.csv` dataset from the public `cephasax/OBDdatasets` repository. The same repository is linked from the Kaggle dataset **OBD-II datasets** by cephasax. It contains real OBD-II automobile readings and more than 45,000 records. The simulator uses:

- `SPEED` — vehicle speed in km/h
- `ENGINE_RPM` — engine revolutions per minute

The dataset is semicolon-delimited and uses commas for decimal values. The included simulator handles this format automatically.

Kaggle dataset name: `OBD-II datasets`
Kaggle owner: `cephasax`
Dataset identifier: `cephasax/obdii-ds3`
Original repository: `cephasax/OBDdatasets`
License shown by Kaggle: CC0 / Public Domain

## Files

- `fake_car.py` — reads the dataset, broadcasts telemetry, simulates ECU memory, and accepts commands.
- `chaos_bomb.py` — activates a controlled virtual memory leak.
- `reset_simulation.py` — manually tests Shadow AI's recovery command.
- `telemetry_receiver_test.py` — displays packets arriving on UDP port 5005.
- `vehicle_data.csv` — real OBD-II driving dataset.

## Network contract and backend relay

This workspace contains a small UDP relay in `backend_infrastructure/central_relay.py` that sits between the
simulator and the AI/watchdog/frontend components. The relay centralizes telemetry validation and measures
latency while forwarding messages to the configured destinations.

Telemetry flow:

- Simulator (`fake_car.py`) -> Relay input (`protocol_config.json` -> `ports.simulation_in`)
- Relay validates telemetry and forwards to AI telemetry listener (`ports.ai_telemetry_out`)

Command flow:

- AI sends commands to the relay (`ports.ai_command_in`)
- Relay forwards commands to the frontend or simulator output (`ports.frontend_out`)

Default network ports (see `backend_infrastructure/protocol_config.json`):

- `simulation_in`: 5004 (simulator should send telemetry here)
- `ai_telemetry_out`: 5005 (AI/watchdog/receiver listens here)
- `ai_command_in`: 5006 (relay listens here for AI commands)
- `frontend_out`: 5007 (relay forwards commands here)

Encoding: UTF-8 JSON for both telemetry and commands.

Example telemetry packet:

```json
{
  "timestamp": 1782484800.125,
  "sequence": 20,
  "vehicle_id": "SHADOW_ECU_01",
  "speed_kph": 65.0,
  "engine_rpm": 2100.0,
  "gear": "D4",
  "ecu_memory_percent": 40.0,
  "simulation_mode": "NORMAL"
}
```

## Running the demonstration

Open four VS Code terminals and run the components in this order so the relay can forward messages correctly.

### Terminal 1 — relay

```powershell
cd backend_infrastructure
python central_relay.py
```

### Terminal 2 — telemetry receiver / AI test

```powershell
cd simulation
python telemetry_receiver_test.py
```

### Terminal 3 — virtual vehicle

```powershell
cd simulation
python fake_car.py
```

### Terminal 4 — attack and recovery (commands)

Start the leak:

```powershell
cd simulation
python chaos_bomb.py
```

Reset memory to 40%:

```powershell
cd simulation
python reset_simulation.py
```

## Expected sequence

1. `fake_car.py` loads over 60,000 valid OBD-II records.
2. Memory begins at 40% and telemetry is broadcast every 100 ms.
3. `chaos_bomb.py` starts increasing virtual memory by 8 percentage points per second.
4. The eventual AI watchdog sends `RESET_VIRTUAL_MEMORY` to UDP port 5006.
5. The simulator stops the leak and returns memory to 40%.

## Python requirements

Only the Python standard library is used. Python 3.10 or newer is recommended.
