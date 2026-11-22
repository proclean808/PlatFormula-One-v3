"""PlatFormula.One bridge to win4r/UltraMemory REST server."""
import json
import os
import urllib.parse
import urllib.request
import urllib.error

class UpstreamError(RuntimeError):
    pass

def request(method, path, payload=None):
    if not path.startswith("/api/v1/"):
        raise ValueError("Invalid UltraMemory API path")
    base = os.environ.get("ULTRAMEMORY_URL", "http://127.0.0.1:1933").rstrip("/")
    headers = {"Accept": "application/json"}
    token = os.environ.get("ULTRAMEMORY_TOKEN")
    if token:
        headers["Authorization"] = "Bearer " + token
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(base + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return json.loads(response.read().decode("utf-8"))
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
        raise UpstreamError("UltraMemory upstream request failed: " + str(exc)) from exc

def store(text, category="fact"):
    if not isinstance(text, str) or not text.strip():
        raise ValueError("text must be nonempty")
    return request("POST", "/api/v1/memory", {"text": text, "category": category})

def recall(query):
    if not isinstance(query, str) or not query.strip():
        raise ValueError("query must be nonempty")
    return request("GET", "/api/v1/memory/recall?" + urllib.parse.urlencode({"query": query}))
