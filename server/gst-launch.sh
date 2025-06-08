#!/bin/bash

SDP_JSON=$1

# Replace this with a valid RTSP source
RTSP_SOURCE="rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream"

gst-launch-1.0 -v rtspsrc location=$RTSP_SOURCE latency=0 ! \
rtph264depay ! h264parse ! \
webrtcbin name=sendrecv stun-server=stun://stun.l.google.com:19302 \
sendrecv. ! queue ! videoconvert ! vp8enc ! rtpvp8pay ! sendrecv.
