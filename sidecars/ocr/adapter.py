"""Placeholder adapter: requires a separately approved OCR runtime."""
import json, sys
for line in sys.stdin:
    try:
        req = json.loads(line)
        if req.get("method") == "version": result = {"version": "unprovisioned", "capability": "ocr"}
        elif req.get("method") == "health": result = {"status": "unavailable", "reason": "runtime not provisioned"}
        else: result = None
        if result is None: out = {"protocolVersion": 1, "requestId": req.get("requestId", ""), "ok": False, "error": {"code": "UNAVAILABLE", "message": "OCR runtime not provisioned"}}
        else: out = {"protocolVersion": 1, "requestId": req["requestId"], "ok": True, "result": result}
        print(json.dumps(out), flush=True)
    except Exception as exc: print(json.dumps({"protocolVersion": 1, "requestId": "", "ok": False, "error": {"code": "INVALID_INPUT", "message": str(exc)}}), flush=True)
