import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

// quality ladder: height aur approx bandwidth (bits/sec)
const LADDER = [
  { height: 360, bandwidth: 800000 },
  { height: 720, bandwidth: 2800000 },
];

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d));
    // ffmpeg bahut log karta hai, sirf aakhri hissa chahiye error ke liye
    proc.stderr.on("data", (d) => (stderr = (stderr + d).slice(-2000)));

    proc.on("error", (e) => reject(new Error(`Could not start ${cmd}: ${e.message}`)));
    proc.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${cmd} exited with code ${code}\n${stderr}`));
    });
  });
}

async function probe(file) {
  const out = await run("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height",
    "-show_entries", "format=duration",
    "-of", "json",
    file,
  ]);
  const data = JSON.parse(out);
  const stream = data.streams && data.streams[0];
  if (!stream) throw new Error("No video stream found in file");

  return {
    width: stream.width,
    height: stream.height,
    duration: Math.round(parseFloat(data.format.duration)),
  };
}

async function makeRendition(input, outDir, height) {
  const dir = path.join(outDir, `${height}p`);
  await fs.mkdir(dir, { recursive: true });

  await run("ffmpeg", [
    "-y",
    "-i", input,
    "-vf", `scale=-2:${height}`,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "23",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "128k",
    "-ac", "2",
    "-hls_time", "6",
    "-hls_playlist_type", "vod",
    "-hls_segment_filename", path.join(dir, "seg_%03d.ts"),
    path.join(dir, "index.m3u8"),
  ]);
}

export async function convertToHls(input, outDir) {
  const info = await probe(input);
  await fs.mkdir(outDir, { recursive: true });

  // source se bada rendition banane ka koi fayda nahi
  let renditions = LADDER.filter((r) => r.height <= info.height);
  if (renditions.length === 0) {
    const even = info.height - (info.height % 2);
    renditions = [{ height: even, bandwidth: 600000 }];
  }

  for (const r of renditions) {
    await makeRendition(input, outDir, r.height);
  }

  // master playlist: player isi file ko kholta hai
  const lines = ["#EXTM3U", "#EXT-X-VERSION:3"];
  for (const r of renditions) {
    const width = Math.round((info.width / info.height) * r.height / 2) * 2;
    lines.push(`#EXT-X-STREAM-INF:BANDWIDTH=${r.bandwidth},RESOLUTION=${width}x${r.height}`);
    lines.push(`${r.height}p/index.m3u8`);
  }
  await fs.writeFile(path.join(outDir, "master.m3u8"), lines.join("\n") + "\n");

  return { duration: info.duration, renditions: renditions.map((r) => r.height) };
}