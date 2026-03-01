const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8081;

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".wasm": "application/wasm",
  ".data": "application/octet-stream",
  ".png": "image/png",
  ".ogg": "audio/ogg",
  ".ttf": "font/ttf",
  ".json": "application/json",
  ".css": "text/css",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg"
};

http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === "/" ? "/index.html" : req.url);
  const ext = path.extname(filePath);

  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Optionally serve index.html for unknown routes (SPA fallback)
      if (ext === "" || ext === ".html") {
        fs.readFile(path.join(__dirname, "index.html"), (err2, data2) => {
          if (err2) {
            res.writeHead(404);
            return res.end("Not found");
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data2);
        });
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));