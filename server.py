#!/usr/bin/env python3
"""
Simple HTTP Server with HTTP Range (206 Partial Content) Support
for Solar Flare Big Data Operations Dashboard
CSE412: Big Data Analytics
"""

import http.server
import socketserver
import os
import sys
import re

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class RangeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            return super().send_head()

        range_header = self.headers.get("Range")
        file_size = os.path.getsize(path)

        if not range_header or not range_header.startswith("bytes="):
            f = super().send_head()
            if f:
                self.send_header("Accept-Ranges", "bytes")
            return f

        match = re.match(r"^bytes=(\d*)-(\d*)$", range_header.strip())
        if not match:
            return super().send_head()

        start, end = match.groups()
        start = int(start) if start else 0
        end = int(end) if end else file_size - 1
        end = min(end, file_size - 1)
        length = end - start + 1

        try:
            f = open(path, "rb")
            f.seek(start)
        except OSError:
            self.send_error(404, "File not found")
            return None

        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
        self.send_header("Content-Length", str(length))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        return f

def main():
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), RangeHTTPRequestHandler) as httpd:
        print("=" * 72)
        print(" OPERATIONAL SOLAR FLARE FORECASTING DASHBOARD (CSE412)")
        print(f" Serving at: http://localhost:{PORT} (with HTTP 206 Range support)")
        print("=" * 72)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down dashboard server.")

if __name__ == "__main__":
    main()
