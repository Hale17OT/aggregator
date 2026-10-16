/** Retire route-owned media, including caption tracks held by the browser style engine. */
export function releaseMedia(media:HTMLMediaElement|null){
  if(!media)return;
  media.pause();
  for(const track of Array.from(media.textTracks))track.mode='disabled';
  for(const child of media.querySelectorAll('track,source'))child.removeAttribute('src');
  media.removeAttribute('src');
  media.load();
}
