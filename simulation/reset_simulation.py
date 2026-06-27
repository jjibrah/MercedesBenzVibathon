import json
import socket
import time

HOST = "127.0.0.1"
COMMAND_PORT = 5006


def main() -> None:
    packet = {
        "command": "RESET_VIRTUAL_MEMORY",
        "reason": "MANUAL_TEST",
        "target_memory_percent": 40.0,
        "timestamp": round(time.time(), 3),
    }

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(3.0)
        sock.sendto(json.dumps(packet).encode("utf-8"), (HOST, COMMAND_PORT))
        print("[SENT] Reset command sent.")
        try:
            raw, _ = sock.recvfrom(4096)
            print(json.dumps(json.loads(raw.decode("utf-8")), indent=2))
        except socket.timeout:
            print("[WARNING] No acknowledgement. Confirm fake_car.py is running.")


if __name__ == "__main__":
    main()
