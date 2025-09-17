#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8080
os.chdir('/home/user/webapp')

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/test':
            self.path = '/frontend_test.html'
        return super().do_GET()

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()