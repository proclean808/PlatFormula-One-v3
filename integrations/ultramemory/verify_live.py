"""Fail-closed live write/readback test; does not use mocks."""
import json
import sys
import uuid
from bridge import store, recall, UpstreamError

def main():
    marker = "pf1-ultramemory-" + uuid.uuid4().hex
    try:
        written = store(marker)
        print("WRITE:", json.dumps(written)[:500])
        result = recall(marker)
        print("RECALL:", json.dumps(result)[:1000])
        if marker not in json.dumps(result):
            print("FAIL: unique marker absent from recall result")
            return 1
        print("PASS: upstream write and immediate recall")
        return 0
    except (UpstreamError, Exception) as exc:
        print("BLOCKED/FAIL:", repr(exc))
        return 2

if __name__ == "__main__":
    sys.exit(main())
