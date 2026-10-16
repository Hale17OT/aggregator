export function validatePortraitProbe(probe){const video=probe.streams.find(s=>s.codec_type==='video'),audio=probe.streams.find(s=>s.codec_type==='audio');const durationMs=Number(probe.format.duration)*1000;
 if(!video||video.width!==720||video.height!==1280||video.codec_name!=='h264'||video.pix_fmt!=='yuv420p'||video.avg_frame_rate!=='30/1'||!audio||audio.codec_name!=='aac'||!Number.isFinite(durationMs)||durationMs<30000||durationMs>120000)throw Error('Invalid portrait duration or encoding');return durationMs;
}
