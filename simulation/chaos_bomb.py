import json
import socket
import time

HOST = "127.0.0.1"
COMMAND_PORT = 5006
LEAK_RATE = 8.0


def main() -> None:
    packet = {
        "command": "START_MEMORY_LEAK",
        "increase_percent_per_second": LEAK_RATE,
        "timestamp": round(time.time(), 3),
    }

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(3.0)
        sock.sendto(json.dumps(packet).encode("utf-8"), (HOST, COMMAND_PORT))
        print(f"[SENT] Chaos Bomb activated at {LEAK_RATE:.1f}% memory per second.")
        try:
            raw, _ = sock.recvfrom(4096)
            print(json.dumps(json.loads(raw.decode("utf-8")), indent=2))
        except socket.timeout:
            print("[WARNING] No acknowledgement. Confirm fake_car.py is running.")


if __name__ == "__main__":
    main()
