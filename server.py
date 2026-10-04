#!/usr/bin/env python3
"""
Simple HTTP Server for Solar Flare Big Data Operations Dashboard
CSE412: Big Data Analytics
Zero external dependencies (uses standard library http.server)
"""

import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Clean terminal output
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

def main():
    os.chdir(DIRECTORY)
    # Allow port reuse immediately
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("=" * 72)
        print(" OPERATIONAL SOLAR FLARE FORECASTING DASHBOARD (CSE412)")
        print(f" Serving at: http://localhost:{PORT}")
        print(" Open this URL in your web browser for screen recording.")
        print(" Press Ctrl+C to stop.")
        print("=" * 72)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down dashboard server.")

if __name__ == "__main__":
    main()
