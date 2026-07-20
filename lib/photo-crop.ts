import sharp from "sharp";

/**
 * Crop pătrat cu fața GARANTAT în cadru — unica implementare, folosită de
 * upload (/api/photo/process) și de plasa de siguranță din PDF.
 *
 * Pași:
 *  1. rotație EXIF (pozele de telefon vin des culcate) + trim de margini uniforme
 *  2. STRIP CHROME: screenshot-urile de telefon au benzi de UI / letterbox
 *     (negre sau albe, pe toată lățimea) sus și jos — le detectăm pe o versiune
 *     mică a imaginii și le tăiem; altfel „ancorarea sus" încadra bara de
 *     status în loc de față
 *  3. FAȚA PRIN PIELE: pe imaginea mică căutăm pixelii de piele (reguli RGB +
 *     YCbCr, acoperă tonuri diverse); capul e partea de SUS a masei de piele —
 *     centrăm pătratul pe ea și strângem cadrul (zoom limitat) ca fața să nu
 *     fie nici prea mică, nici tăiată
 *  4. fallback (nu s-a găsit piele — poză fără persoană, alb-negru etc.):
 *     poze înalte → ancorare sus; altfel „attention"
 */

const SMALL_W = 128;

interface FaceRegion {
  /** centrul feței pe x, în pixelii imaginii MICI */
  cx: number;
  /** nivelul ochilor/frunții pe y, în pixelii imaginii MICI */
  cy: number;
  /** înălțimea estimată a capului, în pixelii imaginii MICI */
  faceH: number;
  /** rândul unde începe capul, în pixelii imaginii MICI */
  headTop: number;
}

interface SmallImage {
  data: Buffer;
  width: number;
  height: number;
  channels: number;
}

async function toSmall(img: Buffer): Promise<SmallImage | null> {
  try {
    const { data, info } = await sharp(img)
      .resize({ width: SMALL_W, withoutEnlargement: true })
      .raw()
      .toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height, channels: info.channels };
  } catch {
    return null;
  }
}

/** rând de „chrome": aproape tot rândul e foarte întunecat sau foarte deschis
 *  (bare de UI, letterbox) — textul mic din bară nu strică majoritatea */
function chromeRows(small: SmallImage): boolean[] {
  const { data, width, height, channels } = small;
  const out: boolean[] = new Array(height).fill(false);
  for (let y = 0; y < height; y++) {
    let dark = 0;
    let light = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const v = Math.max(data[i], data[i + 1], data[i + 2]);
      if (v < 55) dark++;
      else if (v > 228) light++;
    }
    out[y] = dark / width > 0.78 || light / width > 0.88;
  }
  return out;
}

/** cât se taie de la marginea de sus (sau de jos, cu rândurile inversate):
 *  banda de UI poate avea „găuri" (rânduri cu text/avatar), așa că luăm
 *  ULTIMUL rând de chrome din primele 40% și cerem ca banda până la el să fie
 *  majoritar chrome */
function bandCut(chrome: boolean[], height: number, minBand: number): number {
  const limit = Math.floor(height * 0.4);
  let lastChrome = -1;
  for (let y = 0; y < limit; y++) if (chrome[y]) lastChrome = y;
  if (lastChrome + 1 < minBand) return 0;
  let count = 0;
  for (let y = 0; y <= lastChrome; y++) if (chrome[y]) count++;
  return count / (lastChrome + 1) >= 0.55 ? lastChrome + 1 : 0;
}

function isSkin(r: number, g: number, b: number): boolean {
  // regulă RGB clasică (lumină de zi)
  const rgb =
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b && Math.abs(r - g) > 15 &&
    Math.max(r, g, b) - Math.min(r, g, b) > 15;
  if (rgb) return true;
  // regulă YCbCr (robustă la iluminare)
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
}

/** găsește banda feței în masa de piele: capul = partea de sus a masei */
function findFace(small: SmallImage, rowFrom: number, rowTo: number): FaceRegion | null {
  const { data, width, channels } = small;
  const rows: number[] = [];
  const pts: { x: number; y: number }[] = [];
  for (let y = rowFrom; y < rowTo; y++) {
    let count = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (isSkin(data[i], data[i + 1], data[i + 2])) {
        count++;
        pts.push({ x, y });
      }
    }
    rows[y] = count;
  }
  const area = width * (rowTo - rowFrom);
  if (pts.length < Math.max(25, area * 0.005)) return null;

  // începutul capului: primul rând cu densitate reală de piele
  const rowMax = Math.max(...rows.slice(rowFrom, rowTo));
  const thresh = Math.max(2, rowMax * 0.18);
  let r0 = rowFrom;
  while (r0 < rowTo && (rows[r0] ?? 0) < thresh) r0++;

  // sfârșitul capului: fie GÂTUL (scădere abruptă a densității de piele —
  // haine/barbă/păr), fie UMERII/PIEPTUL (salt brusc de lățime la piele
  // descoperită) — altfel torsul/brațele umflă estimarea și fața iese mică
  // sau descentrată. Vârful (peak) se actualizează DUPĂ testare, ca saltul
  // de la cap la piept să fie prins înainte să fie absorbit în vârf.
  let peak = Math.max(1, rows[r0] ?? 0);
  let headEnd = rowTo;
  for (let y = r0 + 1; y < rowTo; y++) {
    const c = rows[y] ?? 0;
    if (y > r0 + 3) {
      if (c < peak * 0.35) {
        headEnd = y;
        break;
      }
      if (peak >= 6 && c > peak * 1.7) {
        headEnd = y;
        break;
      }
    }
    peak = Math.max(peak, c);
  }
  const faceH = Math.max(5, headEnd - r0);
  const headPts = pts.filter((p) => p.y >= r0 && p.y < headEnd);
  if (headPts.length < 12) return null;
  const cx = headPts.reduce((s, p) => s + p.x, 0) / headPts.length;
  return { cx, cy: r0 + faceH * 0.45, faceH, headTop: r0 };
}

export async function smartSquareCrop(input: Buffer, size = 600): Promise<Buffer> {
  const rotated = await sharp(input, { limitInputPixels: 80_000_000 })
    .rotate()
    .toBuffer();

  // margini uniforme de fundal (studio/alb) — persoana rămâne strâns încadrată
  let content = rotated;
  try {
    content = await sharp(rotated).trim({ threshold: 12 }).toBuffer();
  } catch {
    // fundal neuniform / nimic de tăiat — continuăm cu poza întreagă
  }

  let meta = await sharp(content).metadata();
  let w = meta.width ?? 0;
  let h = meta.height ?? 0;
  if (!w || !h) {
    return sharp(content).resize(size, size, { fit: "cover" }).jpeg({ quality: 88 }).toBuffer();
  }

  let small = await toSmall(content);

  // 2) tăiem benzile de chrome/letterbox de sus și de jos (≥3% din înălțime)
  if (small) {
    const chrome = chromeRows(small);
    const minBand = Math.max(2, Math.round(small.height * 0.03));
    const cutTop = bandCut(chrome, small.height, minBand);
    const cutBottom = bandCut([...chrome].reverse(), small.height, minBand);
    if ((cutTop || cutBottom) && small.height - cutTop - cutBottom > small.height * 0.25) {
      const k = w / small.width;
      const px = (v: number) => Math.round(v * k);
      const newTop = px(cutTop);
      const newH = Math.min(h - newTop, px(small.height - cutTop - cutBottom));
      content = await sharp(content)
        .extract({ left: 0, top: newTop, width: w, height: newH })
        .toBuffer();
      meta = await sharp(content).metadata();
      w = meta.width ?? w;
      h = newH;
      small = await toSmall(content);
    }
  }

  // 3) centrare pe față prin detecția pielii
  if (small) {
    const face = findFace(small, 0, small.height);
    if (face) {
      const k = w / small.width;
      const cx = face.cx * k;
      const cy = face.cy * k;
      const faceH = face.faceH * k;
      const headTop = face.headTop * k;
      const minS = Math.min(w, h);
      // maximum ~0,65 înălțimi de cap „aer" deasupra capului — altfel barele
      // de status rămase peste cer/fundal intră în cadru
      const airTop = Math.max(0, Math.round(headTop - 0.65 * faceH));
      // capul ~ un sfert din cadru; nu strângem sub 55% din latura mică, dar
      // nici nu lăsăm pătratul să urce peste limita de aer (îl micșorăm)
      let S = Math.round(Math.min(minS, Math.max(4.2 * faceH, 0.55 * minS)));
      S = Math.max(Math.round(0.45 * minS), Math.min(S, h - airTop));
      const left = Math.round(Math.min(Math.max(cx - S / 2, 0), w - S));
      const idealTop = Math.max(cy - 0.38 * S, airTop);
      const top = Math.round(Math.min(Math.max(idealTop, 0), h - S));
      return sharp(content)
        .extract({ left, top, width: S, height: S })
        .resize(size, size)
        .jpeg({ quality: 88 })
        .toBuffer();
    }
  }

  // 4) fallback fără piele detectată: la poze înalte capul e sus; altfel attention
  const position = w > 0 && h > 1.25 * w ? "top" : sharp.strategy.attention;
  return sharp(content)
    .resize(size, size, { fit: "cover", position })
    .jpeg({ quality: 88 })
    .toBuffer();
}
