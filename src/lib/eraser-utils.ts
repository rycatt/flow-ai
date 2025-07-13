type Point = [number, number];
type Rectangle = { x: number; y: number; width: number; height: number };

function lineSegmentsIntersect(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): boolean {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [x3, y3] = p3;
  const [x4, y4] = p4;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return false;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function pointInRectangle(point: Point, rect: Rectangle): boolean {
  const [x, y] = point;
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

function getRectangleEdges(rect: Rectangle): [Point, Point][] {
  const { x, y, width, height } = rect;
  return [
    [
      [x, y],
      [x + width, y],
    ],
    [
      [x + width, y],
      [x + width, y + height],
    ],
    [
      [x + width, y + height],
      [x, y + height],
    ],
    [
      [x, y + height],
      [x, y],
    ],
  ];
}

export function polylineIntersectsRectangle(
  points: Point[],
  rect: Rectangle
): boolean {
  if (points.length < 2) return false;

  for (const point of points) {
    if (pointInRectangle(point, rect)) {
      return true;
    }
  }

  const rectEdges = getRectangleEdges(rect);

  for (let i = 0; i < points.length - 1; i++) {
    const lineStart = points[i];
    const lineEnd = points[i + 1];

    for (const [edgeStart, edgeEnd] of rectEdges) {
      if (lineSegmentsIntersect(lineStart, lineEnd, edgeStart, edgeEnd)) {
        return true;
      }
    }
  }

  return false;
}

function distanceBetweenPoints(p1: Point, p2: Point): number {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function closestPointOnSegment(
  point: Point,
  segmentStart: Point,
  segmentEnd: Point
): Point {
  const [px, py] = point;
  const [x1, y1] = segmentStart;
  const [x2, y2] = segmentEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) return segmentStart;

  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared)
  );
  return [x1 + t * dx, y1 + t * dy];
}

export function pathsIntersect(
  path1: Point[],
  path2: Point[],
  threshold: number = 1
): boolean {
  if (path1.length < 2 || path2.length < 2) return false;

  for (let i = 0; i < path1.length - 1; i++) {
    for (let j = 0; j < path2.length - 1; j++) {
      if (
        lineSegmentsIntersect(path1[i], path1[i + 1], path2[j], path2[j + 1])
      ) {
        return true;
      }
    }
  }

  if (threshold > 0) {
    for (let i = 0; i < path1.length - 1; i++) {
      const segment1Start = path1[i];
      const segment1End = path1[i + 1];

      for (let j = 0; j < path2.length - 1; j++) {
        const segment2Start = path2[j];
        const segment2End = path2[j + 1];

        const distances = [
          distanceBetweenPoints(
            segment1Start,
            closestPointOnSegment(segment1Start, segment2Start, segment2End)
          ),
          distanceBetweenPoints(
            segment1End,
            closestPointOnSegment(segment1End, segment2Start, segment2End)
          ),
          distanceBetweenPoints(
            segment2Start,
            closestPointOnSegment(segment2Start, segment1Start, segment1End)
          ),
          distanceBetweenPoints(
            segment2End,
            closestPointOnSegment(segment2End, segment1Start, segment1End)
          ),
        ];

        if (Math.min(...distances) <= threshold) {
          return true;
        }
      }
    }
  }

  return false;
}

export function samplePathPoints(
  points: Point[],
  maxDistance: number = 5
): Point[] {
  if (points.length < 2) return [...points];

  const result: Point[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1];
    const current = points[i];
    const distance = distanceBetweenPoints(prev, current);

    if (distance > maxDistance) {
      // Add intermediate points
      const numSegments = Math.ceil(distance / maxDistance);
      for (let j = 1; j < numSegments; j++) {
        const t = j / numSegments;
        const interpolated: Point = [
          prev[0] + (current[0] - prev[0]) * t,
          prev[1] + (current[1] - prev[1]) * t,
        ];
        result.push(interpolated);
      }
    }

    result.push(current);
  }

  return result;
}
