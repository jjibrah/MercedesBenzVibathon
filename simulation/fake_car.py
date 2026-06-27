import csv
import json
import socket
import threading
import time
from pathlib import Path
from typing import Any

HOST = "127.0.0.1"
TELEMETRY_PORT = 5005
COMMAND_PORT = 5006
TELEMETRY_INTERVAL = 0.1
CSV_FILE = Path(__file__).parent / "vehicle_data.csv"

BASELINE_MEMORY = 40.0
MAX_MEMORY = 100.0


class VirtualCar:
    def __init__(self) -> None:
        self.memory_percent = BASELINE_MEMORY
        self.memory_leak_active = False
        self.memory_leak_rate = 8.0
        self.simulation_mode = "NORMAL"
        self.running = True
        self.state_lock = threading.Lock()

        self.telemetry_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.command_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.command_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.command_socket.bind((HOST, COMMAND_PORT))

    @staticmethod
    def parse_number(value: Any) -> float | None:
        if value is None:
            return None
        text = str(value).strip().replace("%", "").replace(",", ".")
        if not text:
            return None
        try:
            return float(text)
        except ValueError:
            return None

    def load_vehicle_data(self) -> list[dict[str, float]]:
        if not CSV_FILE.exists():
            raise FileNotFoundError(f"Dataset not found: {CSV_FILE}")

        rows: list[dict[str, float]] = []
        with CSV_FILE.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle, delimiter=";")
            required = {"SPEED", "ENGINE_RPM"}
            if not reader.fieldnames or not required.issubset(set(reader.fieldnames)):
                raise ValueError("Dataset must contain SPEED and ENGINE_RPM columns.")

            for row in reader:
                speed = self.parse_number(row.get("SPEED"))
                rpm = self.parse_number(row.get("ENGINE_RPM"))
                if speed is None or rpm is None:
                    continue
                rows.append({"speed_kph": max(0.0, speed), "engine_rpm": max(0.0, rpm)})

        if not rows:
            raise ValueError("No valid SPEED and ENGINE_RPM rows were found.")
        return rows

    @staticmethod
    def determine_gear(speed_kph: float, engine_rpm: float) -> str:
        if speed_kph <= 0.5 and engine_rpm < 1200:
            return "P"
        if speed_kph < 15:
            return "D1"
        if speed_kph < 30:
            return "D2"
        if speed_kph < 50:
            return "D3"
        if speed_kph < 80:
            return "D4"
        return "D5"

    def update_memory(self, elapsed_seconds: float) -> None:
        with self.state_lock:
            if self.memory_leak_active:
                self.memory_percent = min(
                    MAX_MEMORY,
                    self.memory_percent + self.memory_leak_rate * elapsed_seconds,
                )
                self.simulation_mode = "MEMORY_LEAK"
            else:
                self.simulation_mode = "NORMAL"

    def create_packet(self, row: dict[str, float], sequence: int) -> dict[str, Any]:
        with self.state_lock:
            memory = round(self.memory_percent, 2)
            mode = self.simulation_mode

        return {
            "timestamp": round(time.time(), 3),
            "sequence": sequence,
            "vehicle_id": "SHADOW_ECU_01",
            "speed_kph": round(row["speed_kph"], 2),
            "engine_rpm": round(row["engine_rpm"], 2),
            "gear": self.determine_gear(row["speed_kph"], row["engine_rpm"]),
            "ecu_memory_percent": memory,
            "simulation_mode": mode,
        }

    def send_ack(self, destination: tuple[str, int], command: str, status: str) -> None:
        packet = {
            "timestamp": round(time.time(), 3),
            "vehicle_id": "SHADOW_ECU_01",
            "command": command,
            "status": status,
        }
        self.command_socket.sendto(json.dumps(packet).encode("utf-8"), destination)

    def process_command(self, packet: dict[str, Any], sender: tuple[str, int]) -> None:
        command = str(packet.get("command", "")).upper()

        if command == "START_MEMORY_LEAK":
            try:
                rate = float(packet.get("increase_percent_per_second", 8.0))
            except (TypeError, ValueError):
                rate = 8.0
            rate = max(0.1, min(rate, 30.0))
            with self.state_lock:
                self.memory_leak_active = True
                self.memory_leak_rate = rate
                self.simulation_mode = "MEMORY_LEAK"
            print(f"\n[ATTACK] Memory leak started at {rate:.1f}% per second.")
            self.send_ack(sender, command, "ACCEPTED")

        elif command == "STOP_MEMORY_LEAK":
            with self.state_lock:
                self.memory_leak_active = False
                self.simulation_mode = "NORMAL"
            print("\n[CONTROL] Memory leak stopped.")
            self.send_ack(sender, command, "ACCEPTED")

        elif command == "RESET_VIRTUAL_MEMORY":
            try:
                target = float(packet.get("target_memory_percent", BASELINE_MEMORY))
            except (TypeError, ValueError):
                target = BASELINE_MEMORY
            target = max(0.0, min(target, 100.0))
            with self.state_lock:
                self.memory_leak_active = False
                self.memory_percent = target
                self.simulation_mode = "RECOVERED"
            print(f"\n[RECOVERY] Virtual ECU Memory reset to {target:.1f}%.")
            self.send_ack(sender, command, "COMPLETED")

        elif command == "SHUTDOWN_SIMULATION":
            self.running = False
            self.send_ack(sender, command, "ACCEPTED")

        else:
            print(f"\n[WARNING] Unknown command: {command}")
            self.send_ack(sender, command, "REJECTED")

    def command_listener(self) -> None:
        self.command_socket.settimeout(1.0)
        print(f"[READY] Command listener: {HOST}:{COMMAND_PORT}")
        while self.running:
            try:
                raw, sender = self.command_socket.recvfrom(4096)
                packet = json.loads(raw.decode("utf-8"))
                if isinstance(packet, dict):
                    self.process_command(packet, sender)
            except socket.timeout:
                continue
            except json.JSONDecodeError:
                print("\n[WARNING] Invalid JSON command received.")
            except OSError:
                break

    def run(self) -> None:
        vehicle_rows = self.load_vehicle_data()
        threading.Thread(target=self.command_listener, daemon=True).start()

        print("=" * 78)
        print("SHADOW AI - VIRTUAL VEHICLE / SOFTWARE-IN-THE-LOOP SIMULATOR")
        print("=" * 78)
        print(f"Valid dataset rows: {len(vehicle_rows):,}")
        print(f"Telemetry output: UDP {HOST}:{TELEMETRY_PORT}")
        print(f"Command input:    UDP {HOST}:{COMMAND_PORT}")
        print(f"Update interval:  {TELEMETRY_INTERVAL} seconds")
        print("Press Ctrl+C to stop.")
        print("=" * 78)

        index = 0
        sequence = 0
        previous = time.monotonic()

        try:
            while self.running:
                now = time.monotonic()
                self.update_memory(now - previous)
                previous = now

                packet = self.create_packet(vehicle_rows[index], sequence)
                self.telemetry_socket.sendto(
                    json.dumps(packet).encode("utf-8"),
                    (HOST, TELEMETRY_PORT),
                )

                print(
                    "\r"
                    f"Seq {sequence:06d} | "
                    f"Speed {packet['speed_kph']:6.1f} km/h | "
                    f"RPM {packet['engine_rpm']:7.0f} | "
                    f"Gear {packet['gear']:>2} | "
                    f"ECU Memory {packet['ecu_memory_percent']:6.2f}% | "
                    f"{packet['simulation_mode']:<11}",
                    end="",
                    flush=True,
                )

                index = (index + 1) % len(vehicle_rows)
                sequence += 1
                time.sleep(TELEMETRY_INTERVAL)

        except KeyboardInterrupt:
            print("\n[STOPPED] Simulation stopped by user.")
        finally:
            self.running = False
            self.telemetry_socket.close()
            self.command_socket.close()


if __name__ == "__main__":
    try:
        VirtualCar().run()
    except (FileNotFoundError, ValueError, OSError) as error:
        print(f"[ERROR] {error}")
