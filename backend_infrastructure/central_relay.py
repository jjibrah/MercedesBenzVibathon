import socket
import json
import threading
import time
import logging
from json_validator import (
    validate_telemetry,
    transform_telemetry_for_ai,
    validate_ai_command,
)

# ---------------------------------------------------------
# 1. INITIALIZE AUDIT TRAIL (latency_monitor.log)
# ---------------------------------------------------------
logging.basicConfig(
    filename='latency_monitor.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# ---------------------------------------------------------
# 2. LOAD MASTER CONFIGURATION (from script directory)
# ---------------------------------------------------------
import os

config_path = os.path.join(os.path.dirname(__file__), 'protocol_config.json')
try:
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
except FileNotFoundError:
    print(f"CRITICAL: protocol_config.json missing at {config_path}. Halting system.")
    exit(1)
except json.JSONDecodeError as e:
    print(f"CRITICAL: protocol_config.json is invalid JSON: {e}. Path: {config_path}")
    exit(1)

HOST = config['host']
SIM_IN_PORT = config['ports']['simulation_in']
AI_OUT_PORT = config['ports']['ai_telemetry_out']
AI_IN_PORT = config['ports']['ai_command_in']
FRONTEND_OUT_PORT = config['ports']['frontend_out']
SIM_COMMAND_IN_PORT = config['ports']['simulator_command_in']

# ---------------------------------------------------------
# 3. THE RELAY THREADS
# ---------------------------------------------------------
def telemetry_relay():
    """ 
    Thread 1: Listens for Simulation data (5004), validates it, 
    and forwards to the AI Watchdog (5005). 
    """
    # Socket to receive from Simulation
    rx_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    rx_sock.bind((HOST, SIM_IN_PORT))
    
    # Socket to send to AI
    tx_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    print(f"[ACTIVE] Telemetry Pipeline: Listening on {SIM_IN_PORT} -> Forwarding to {AI_OUT_PORT}")
    
    while True:
        try:
            payload, addr = rx_sock.recvfrom(4096)
            start_time = time.perf_counter()  # Start stopwatch

            validated = validate_telemetry(payload)
            if validated is None:
                continue

            ai_payload = transform_telemetry_for_ai(validated)
            tx_sock.sendto(ai_payload, (HOST, AI_OUT_PORT))

            latency_ms = (time.perf_counter() - start_time) * 1000
            logging.info(
                f"[TELEMETRY ROUTED] Latency: {latency_ms:.3f} ms | Sequence: {validated.get('sequence')}"
            )

        except Exception as e:
            logging.error(f"[TELEMETRY CRASH] {e}")


def command_relay():
    """ 
    Thread 2: Listens for AI Commands (5006),
    validates them, and broadcasts to frontend and simulator command ports.
    """
    # Socket to receive from AI Watchdog
    rx_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    rx_sock.bind((HOST, AI_IN_PORT))
    
    # Socket to send to Frontend and Simulator
    tx_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    print(
        f"[ACTIVE] Command Pipeline: Listening on {AI_IN_PORT} -> Forwarding to {FRONTEND_OUT_PORT} and {SIM_COMMAND_IN_PORT}"
    )
    
    while True:
        try:
            payload, addr = rx_sock.recvfrom(4096)
            start_time = time.perf_counter()

            command_data = validate_ai_command(payload)
            if command_data is None:
                continue

            command_payload = json.dumps(command_data).encode('utf-8')
            tx_sock.sendto(command_payload, (HOST, FRONTEND_OUT_PORT))
            tx_sock.sendto(command_payload, (HOST, SIM_COMMAND_IN_PORT))

            latency_ms = (time.perf_counter() - start_time) * 1000
            logging.info(
                f"[COMMAND ROUTED] Latency: {latency_ms:.3f} ms | Command: {command_data['command']}"
            )

        except Exception as e:
            logging.error(f"[COMMAND CRASH] {e}")


# ---------------------------------------------------------
# 4. START THE INFRASTRUCTURE
# ---------------------------------------------------------
if __name__ == "__main__":
    print("==================================================")
    print(" SHADOW AI - UDP RELAY PIPELINE INITIALIZING...")
    print("==================================================")
    
    # Create daemon threads so they die when the main script stops
    t1 = threading.Thread(target=telemetry_relay, daemon=True)
    t2 = threading.Thread(target=command_relay, daemon=True)
    
    t1.start()
    t2.start()
    
    try:
        # Keep the main process alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[SHUTDOWN] Shadow AI Relay offline.")
