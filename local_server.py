"""Run the Vercel-shaped SKillSync app locally without Flask."""

import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from groq_client import call_model, load_client
from utils import get_system_prompt


class SkillsyncHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="web", **kwargs)

    def do_POST(self):
        if self.path != "/api/chat":
            self.send_error(404, "Not found")
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length) or b"{}")
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
                self._json_response(400, {"error": "messages must be a list of user and assistant messages"})
                return

            messages = [{"role": "system", "content": get_system_prompt("qa")}]
            messages.extend(user_messages[-20:])
            reply = call_model(load_client(), messages)
            if reply.startswith("[Error"):
                self._json_response(502, {"error": reply})
                return
            self._json_response(200, {"reply": reply})
        except Exception as error:
            self._json_response(500, {"error": str(error)})

    def _json_response(self, status_code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format_string, *args):
        print(f"{self.address_string()} - {format_string % args}")


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    server = ThreadingHTTPServer(("127.0.0.1", port), SkillsyncHandler)
    print(f"SKillSync AI running at http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()
