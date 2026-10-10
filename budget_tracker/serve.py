#!/usr/bin/env python3
"""
serve.py
--------
Open Budget Tracker in a browser.

The pages live in web/. The records are the same data/budget_data.json
file used by the command-line program (main.py). No extra packages are
required.

    python serve.py
    python serve.py --share
"""

import argparse
import hmac
import json
import mimetypes
import os
import secrets
import socket
import sys
import threading
import webbrowser

mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("image/svg+xml", ".svg")
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)

from storage import load_data, save_data  # noqa: E402

WEB_DIR = os.path.join(ROOT, "web")
DEFAULT_DATA = os.path.join(ROOT, "data", "budget_data.json")
MAX_BODY = 5 * 1024 * 1024

DATA_FILE = DEFAULT_DATA
ROOM_TOKEN = ""
SECURITY_HEADERS = (
    ("Content-Security-Policy",
     "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
     "connect-src 'self' https://api.frankfurter.dev; manifest-src 'self'; worker-src 'self'; "
     "base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'none'"),
    ("Referrer-Policy", "no-referrer"),
    ("X-Frame-Options", "DENY"),
    ("Permissions-Policy", "camera=(), microphone=(self), geolocation=()"),
)


def lan_ip():
    """Best-effort address a phone on the same network can use."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("8.8.8.8", 80))
        return sock.getsockname()[0]
    except OSError:
        return None
    finally:
        sock.close()


def valid_payload(data):
    if not isinstance(data, dict):
        return False
    transactions = data.get("transactions")
    goals = data.get("goals")
    if not isinstance(transactions, list) or not isinstance(goals, list):
        return False
    if len(transactions) > 20000 or len(goals) > 5000:
        return False
    return True


class BudgetHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def _route(self):
        return urlparse(self.path).path.rstrip("/") or "/"

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        for name, value in SECURITY_HEADERS:
            self.send_header(name, value)
        super().end_headers()

    def _client_is_local(self):
        return self.client_address[0] in ("127.0.0.1", "::1")

    def _room_cookie(self):
        raw = self.headers.get("Cookie", "")
        for part in raw.split(";"):
            name, _, value = part.strip().partition("=")
            if name == "bt-room":
                return value
        return ""

    def _room_ok(self):
        if not ROOM_TOKEN or self._client_is_local():
            return True
        got = self._room_cookie()
        if len(got) != len(ROOM_TOKEN):
            return False
        return hmac.compare_digest(got, ROOM_TOKEN)

    def do_GET(self):
        parsed = urlparse(self.path)
        if ROOM_TOKEN and not self._client_is_local():
            if self._route() == "/" and parse_qs(parsed.query).get("room", [""])[0] == ROOM_TOKEN:
                self.send_response(302)
                self.send_header(
                    "Set-Cookie",
                    "bt-room=%s; Path=/; HttpOnly; SameSite=Strict" % ROOM_TOKEN,
                )
                self.send_header("Location", "/")
                self.end_headers()
                return
            if self._route() == "/api/data" and not self._room_ok():
                self._send_json(401, {"ok": False, "error": "Open the private link from the computer first"})
                return
        if self._route() == "/api/data":
            self._send_json(200, load_data(DATA_FILE))
            return
        super().do_GET()

    def do_PUT(self):
        if self._route() != "/api/data":
            self.send_error(404)
            return
        if not self._room_ok():
            self._send_json(401, {"ok": False, "error": "Open the private link from the computer first"})
            return
        self._save_body()

    def _save_body(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send_json(400, {"ok": False, "error": "Missing length"})
            return
        if length < 0 or length > MAX_BODY:
            self._send_json(413, {"ok": False, "error": "Record file is too large"})
            return
        content_type = self.headers.get("Content-Type", "")
        if "application/json" not in content_type:
            self._send_json(415, {"ok": False, "error": "Records must be JSON"})
            return
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json(400, {"ok": False, "error": "Records must be JSON"})
            return
        if not valid_payload(data):
            self._send_json(400, {"ok": False, "error": "Records are missing transactions or goals"})
            return
        if not save_data(data, DATA_FILE):
            self._send_json(500, {"ok": False, "error": "Could not write the record file"})
            return
        self._send_json(200, {"ok": True})

    def _send_json(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        safe = []
        for arg in args:
            text = str(arg)
            if "?" in text:
                text = text.split("?", 1)[0]
            safe.append(text)
        sys.stderr.write("[Budget Tracker] " + (fmt % tuple(safe)) + "\n")


def main():
    global DATA_FILE, ROOM_TOKEN

    parser = argparse.ArgumentParser(description="Open Budget Tracker in a browser.")
    parser.add_argument("--port", type=int, default=8765, help="Port to listen on (default 8765)")
    parser.add_argument("--share", action="store_true", help="Also allow phones on the same Wi-Fi")
    parser.add_argument("--no-browser", action="store_true", help="Do not open a browser window")
    parser.add_argument("--data", default=DEFAULT_DATA, help="Path to the JSON record file")
    args = parser.parse_args()

    DATA_FILE = os.path.abspath(args.data)
    ROOM_TOKEN = secrets.token_urlsafe(18) if args.share else ""
    host = "0.0.0.0" if args.share else "127.0.0.1"
    local_url = "http://127.0.0.1:%s" % args.port

    class Server(ThreadingHTTPServer):
        allow_reuse_address = True

    try:
        httpd = Server((host, args.port), BudgetHandler)
    except OSError as exc:
        print("Could not start Budget Tracker on port %s (%s)." % (args.port, exc))
        print("Try another port: python serve.py --port 8766")
        return 1

    print("")
    print("Budget Tracker")
    print("Open this address on this computer:")
    print("  " + local_url)
    if args.share:
        ip = lan_ip()
        if ip:
            print("On a phone connected to the same Wi-Fi, open this private link:")
            print("  http://%s:%s/?room=%s" % (ip, args.port, ROOM_TOKEN))
            print("Anyone else on the Wi-Fi cannot read the records without that link.")
        print("In the phone browser, choose Add to Home Screen.")
    print("The command-line program (python main.py) uses the same records.")
    print("Stop this window with Ctrl+C when you are finished.")
    print("")

    if not args.no_browser:
        threading.Thread(target=lambda: webbrowser.open(local_url), daemon=True).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nBudget Tracker stopped. Records stay in the data file.")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
