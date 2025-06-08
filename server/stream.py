import sys, json, gi
gi.require_version('Gst', '1.0')
gi.require_version('GstWebRTC', '1.0')
from gi.repository import Gst, GstWebRTC, GObject

Gst.init(None)

pipeline = Gst.parse_launch("""
rtspsrc location=rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream latency=100 !
rtph264depay ! h264parse ! avdec_h264 ! videoconvert !
x264enc tune=zerolatency bitrate=512 speed-preset=ultrafast !
rtph264pay config-interval=1 pt=96 !
application/x-rtp,media=video,encoding-name=H264,payload=96 !
webrtcbin name=sendrecv stun-server=stun://stun.l.google.com:19302
""")

webrtc = pipeline.get_by_name('sendrecv')

def on_offer_created(_, promise):
    reply = promise.get_reply()
    offer = reply.get_value('offer')
    text = offer.sdp.as_text()
    print(json.dumps({'type': 'offer', 'sdp': text}))
    sys.stdout.flush()
    webrtc.emit('set-local-description', offer, None)

def on_negotiation_needed(element):
    promise = Gst.Promise.new_with_change_func(on_offer_created, element, None)
    element.emit('create-offer', None, promise)

def on_message():
    line = sys.stdin.readline()
    msg = json.loads(line)
    if msg['type'] == 'answer':
        sdp = GstSdp.SDPMessage.new()
        GstSdp.sdp_message_parse_buffer(msg['sdp'].encode(), sdp)
        answer = GstWebRTC.WebRTCSessionDescription.new(GstWebRTC.WebRTCSDPType.ANSWER, sdp)
        webrtc.emit('set-remote-description', answer, None)

webrtc.connect('on-negotiation-needed', on_negotiation_needed)

pipeline.set_state(Gst.State.PLAYING)

loop = GObject.MainLoop()
GObject.io_add_watch(sys.stdin, GObject.IO_IN, lambda *a: on_message() or True)
loop.run()
