"""Placeholder adapter: requires a separately approved speech runtime."""
import json, sys
for line in sys.stdin:
    req = json.loads(line)
    ok = req.get("method") in ("version", "health")
    result = {"version": "unprovisioned", "capability": "speech"} if req.get("method") == "version" else {"status": "unavailable", "reason": "runtime not provisioned"}
    print(json.dumps({"protocolVersion": 1, "requestId": req.get("requestId", ""), "ok": ok, "result": result} if ok else {"protocolVersion": 1, "requestId": req.get("requestId", ""), "ok": False, "error": {"code": "UNAVAILABLE", "message": "Speech runtime not provisioned"}}), flush=True)
