// const { spawn } = require('child_process');
// const WebSocket = require('ws');
// const http = require('http');
//
// const server = http.createServer();
// const wss = new WebSocket.Server({ server });
//
// wss.on('connection', function connection(ws) {
//     console.log('🧩 Client connected');
//
//     const gstCmd = `
//     gst-launch-1.0 -v \\
// rtspsrc location=rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream latency=300 ! \\
// rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! \\
// x264enc tune=zerolatency bitrate=512 speed-preset=ultrafast ! \\
// rtph264pay config-interval=1 pt=96 ! \\
// application/x-rtp,media=video,encoding-name=H264,payload=96 ! \\
// webrtcbin name=sendrecv stun-server=stun://stun.l.google.com:19302
//     `;
//
//     const gstProcess = spawn('bash', ['-c', gstCmd]);
//
//     gstProcess.stdout.on('data', (data) => {
//         console.log(`GStreamer stdout: ${data}`);
//     });
//
//     gstProcess.stderr.on('data', (data) => {
//         console.error(`GStreamer stderr: ${data}`);
//     });
//
//     gstProcess.on('close', (code) => {
//         console.log(`GStreamer exited with code ${code}`);
//     });
//
//     ws.on('message', function incoming(message) {
//         console.log('Received message: %s', message);
//         // 这里应对 WebRTC 的 SDP offer/ICE candidate 做处理
//     });
//
//     ws.on('close', () => {
//         console.log('WebSocket closed, killing GStreamer process...');
//         gstProcess.kill();
//     });
// });
//
// server.listen(3000, () => {
//     console.log('🚀 HTTP + WS Server running on http://localhost:3000');
// });





const WebSocket = require("ws");
const { spawn } = require("child_process");

const wss = new WebSocket.Server({ port: 8443 });

wss.on("connection", function connection(ws) {
    console.log("Client connected");

    // 启动 gst-launch-1.0
    const gst = spawn("gst-launch-1.0", [
        "-v",
        "rtspsrc", "location=rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream", "latency=300", "name=src",
        "src.", "!", "application/x-rtp,media=video", "!", "rtph264depay", "!", "h264parse", "!", "avdec_h264", "!", "videoconvert",
        "!", "x264enc", "tune=zerolatency", "bitrate=512", "speed-preset=ultrafast", "!", "rtph264pay", "config-interval=1", "pt=96",
        "!", "application/x-rtp,media=video,encoding-name=H264,payload=96",
        "!", "webrtcbin", "name=sendrecv", "stun-server=stun://stun.l.google.com:19302"
    ]);

    gst.stderr.on("data", data => console.error(`[GStreamer] ${data}`));
    gst.stdout.on("data", data => console.log(`[GStreamer] ${data}`));
    gst.on("exit", code => console.log(`GStreamer exited with ${code}`));

    ws.on("message", function incoming(message) {
        console.log("Received from client:", message.toString());
        // TODO：你要把 SDP/ICE 转发给 webrtcbin，这里只是演示 WebSocket 通道
    });

    ws.send(JSON.stringify({ type: "hello", message: "WebRTC server ready." }));
});


