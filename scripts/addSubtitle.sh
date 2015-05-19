#!/bin/sh

ffmpeg -i $1 -f image2 -loop 1 -i $3 -filter_complex \
  '[1:v]fade=t=in:st=1:d=1, fade=t=out:st=8:d=1[wm];[0:v][wm]overlay=x=(W-overlay_w)/2:y=H-overlay_h-20:shortest=1[outv]' \
  -map [outv] -map 0:a -c:a copy -c:v libx264 -crf 18 $2
