import json
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from groq_client import call_model, load_client
from utils import get_system_prompt


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        response = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(response)

    def do_GET(self):
        self._send_json(405, {"error": "Use POST /api/chat to send a message."})

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(content_length) or b"{}")
            user_messages = payload.get("messages", [])

            valid_messages = (
                isinstance(user_messages, list)
                and all(
                    isinstance(message, dict)
                    and message.get("role") in {"user", "assistant"}
                    and isinstance(message.get("content"), str)
                    for message in user_messages
                )
            )
            if not valid_messages:
                self._send_json(400, {"error": "messages must be a list of user and assistant messages"})
                return

            messages = [{"role": "system", "content": get_system_prompt("qa")}]
            messages.extend(user_messages[-20:])
            reply = call_model(load_client(), messages)

            if reply.startswith("[Error"):
                self._send_json(502, {"error": reply})
                return

            self._send_json(200, {"reply": reply})
        except Exception as error:
            self._send_json(500, {"error": str(error)})

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
