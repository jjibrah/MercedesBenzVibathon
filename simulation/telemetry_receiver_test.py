import json
import socket

HOST = "127.0.0.1"
PORT = 5005


def main() -> None:
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.bind((HOST, PORT))
        print(f"Listening for telemetry on UDP {HOST}:{PORT}. Press Ctrl+C to stop.")
        try:
            while True:
                raw, sender = sock.recvfrom(4096)
                packet = json.loads(raw.decode("utf-8"))
                print(f"From {sender}: {json.dumps(packet, indent=2)}")
        except KeyboardInterrupt:
            print("\nReceiver stopped.")


if __name__ == "__main__":
    main()
