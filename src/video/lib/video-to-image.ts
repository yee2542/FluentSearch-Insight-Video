import * as FFmpeg from 'fluent-ffmpeg';
import * as path from 'path';

const MAX_THREADS = 5;
const SECOUND_FACTOR = 1000;
const CHUNK = 30;

// const VIDEO_PATH = path.join(__dirname, '../../../sample/sample.mp4');
const VIDEO_PATH = path.join(__dirname, '../../../sample/sample-2.mp4');

const getVideoMeta = (path: string) =>
  new Promise<FFmpeg.FfprobeData>((resolve, reject) => {
    FFmpeg.ffprobe(path, function (err, metadata) {
      //console.dir(metadata); // all metadata
      if (err) return reject(err);
      resolve(metadata);
    });
  });

const extractVideo = (i: number, start: number, stop: number, path: string) =>
  new Promise((resolve, reject) => {
    // const startTime = new Date(start * SECOUND_FACTOR);

    const timemarks = Array(CHUNK)
      .fill(0)
      .map((_, i) => start + i)
      .map((el) => new Date(el * SECOUND_FACTOR).toISOString().substr(11, 8));

    FFmpeg(path)
      .on('error', reject)
      .on('end', resolve)
      .takeScreenshots(
        {
          filename: `thumbnail-${i}-%i-%s.jpg`,
          timemarks,
          // size: '640x360',
          size: '320x180',
          fastSeek: true,
        },
        './tests/',
      );
  });

(async () => {
  console.log('process...');
  const videoInfo = await getVideoMeta(VIDEO_PATH);
  const duration = videoInfo.format.duration;
  if (!duration) throw new Error('unsupported duration format');
  const nOfChunk = Math.round(duration / CHUNK);

  const queue = Array(nOfChunk + 1)
    .fill(0)
    .map((_, i) => i * CHUNK) // split chunk
    .map((el, i, arr) => {
      // map start, stop
      const end = arr[i + 1] === undefined;
      if (!end) return { start: el, stop: arr[i + 1] };
      return { start: el, stop: duration };
    });

  const chunkQueue = chunkArray(queue, MAX_THREADS);

  for (const [i, task] of chunkQueue.entries()) {
    await Promise.all(
      task.map((t, ti) => extractVideo(i + ti, t.start, t.stop, VIDEO_PATH)),
    );
  }

  console.log('finish');
})();

function chunkArray<T>(array: Array<T>, size: number): Array<T>[] {
  if (array.length <= size) {
    return [array];
  }
  return [array.slice(0, size), ...chunkArray(array.slice(size), size)];
}
