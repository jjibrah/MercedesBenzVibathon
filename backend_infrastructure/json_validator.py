import json
import logging

def validate_telemetry(payload: bytes) -> dict:
    """
    Decode the UDP packet and validate it matches the simulator telemetry schema.
    Expected minimal schema: {"timestamp": number, "vehicle_id": str}
    Returns the parsed dictionary if valid, or None if malformed.
    """
    try:
        data_str = payload.decode('utf-8')
        data = json.loads(data_str)

        # Basic required fields for simulator telemetry
        if not isinstance(data, dict):
            logging.warning(f"DROPPED PACKET: Not a JSON object. Raw: {data_str}")
            return None

        if "timestamp" not in data or "vehicle_id" not in data:
            logging.warning(f"DROPPED PACKET: Missing required keys. Payload: {data_str}")
            return None

        if not isinstance(data["timestamp"], (int, float)):
            logging.warning(f"DROPPED PACKET: 'timestamp' wrong type. Payload: {data_str}")
            return None

        if not isinstance(data["vehicle_id"], str):
            logging.warning(f"DROPPED PACKET: 'vehicle_id' wrong type. Payload: {data_str}")
            return None

        # Optional: ensure numeric memory field exists and is numeric if present
        if "ecu_memory_percent" in data and not isinstance(data["ecu_memory_percent"], (int, float)):
            logging.warning(f"DROPPED PACKET: 'ecu_memory_percent' wrong type. Payload: {data_str}")
            return None

        return data

    except json.JSONDecodeError:
        logging.error(f"DROPPED PACKET: Malformed JSON received. Raw: {payload}")
        return None
    except Exception as e:
        logging.error(f"VALIDATION ERROR: Unexpected fault -> {e}")
        return None