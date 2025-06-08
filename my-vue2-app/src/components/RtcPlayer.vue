<template>
  <div>
    <video ref="video" autoplay playsinline muted></video>
  </div>
</template>

<script>
export default {
  mounted() {
    const ws = new WebSocket("ws://localhost:8443");
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    pc.ontrack = (event) => {
      this.$refs.video.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(JSON.stringify({ type: "ice", candidate: event.candidate }));
      }
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      console.log("Received:", msg);
      if (msg.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(msg));
      }
    };

    ws.onopen = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify(offer));
    };
  },
};
</script>
