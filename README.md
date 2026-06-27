# Shadow AI — Simulation Engineer Package

This package implements the Software-in-the-Loop virtual vehicle for the Shadow AI project.

## Included dataset

`simulation/vehicle_data.csv` is the `dailyRoutes.csv` dataset from the public `cephasax/OBDdatasets` repository. The same repository is linked from the Kaggle dataset **OBD-II datasets** by cephasax. It contains real OBD-II automobile readings and more than 60,000 records. The simulator uses:

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

## Network contract

Telemetry output:

- Protocol: UDP
- Address: `127.0.0.1`
- Port: `5005`
- Frequency: approximately 10 packets per second
- Encoding: UTF-8 JSON

Command input:

- Protocol: UDP
- Address: `127.0.0.1`
- Port: `5006`
- Encoding: UTF-8 JSON

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

Open three VS Code terminals.

### Terminal 1 — telemetry receiver/backend test

```powershell
cd simulation
python telemetry_receiver_test.py
```

### Terminal 2 — virtual vehicle

```powershell
cd simulation
python fake_car.py
```

### Terminal 3 — attack and recovery

Start the leak:

```powershell
cd simulation
python chaos_bomb.py
```

Reset memory to 40%:

```powershell
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
