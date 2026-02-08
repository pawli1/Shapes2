
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Vector2 } from '../types';

export const add = (v1: Vector2, v2: Vector2): Vector2 => ({ x: v1.x + v2.x, y: v1.y + v2.y });
export const sub = (v1: Vector2, v2: Vector2): Vector2 => ({ x: v1.x - v2.x, y: v1.y - v2.y });
export const mult = (v: Vector2, s: number): Vector2 => ({ x: v.x * s, y: v.y * s });
export const dot = (v1: Vector2, v2: Vector2): number => v1.x * v2.x + v1.y * v2.y;
export const mag = (v: Vector2): number => Math.sqrt(v.x * v.x + v.y * v.y);
export const normalize = (v: Vector2): Vector2 => {
  const m = mag(v);
  return m === 0 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
};

export const rotatePoint = (point: Vector2, center: Vector2, angle: number): Vector2 => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
};

export const generatePolygon = (sides: number, radius: number, center: Vector2, rotation: number): Vector2[] => {
  const points: Vector2[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides + rotation;
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }
  return points;
};

export const generateStar = (points: number, outerRadius: number, innerRadius: number, center: Vector2, rotation: number): Vector2[] => {
    const vertices: Vector2[] = [];
    for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points + rotation;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        vertices.push({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
        });
    }
    return vertices;
}

// Distance from point P to line segment AB
export const distPointToSegment = (p: Vector2, a: Vector2, b: Vector2): { dist: number, normal: Vector2, closest: Vector2 } => {
  const ab = sub(b, a);
  const ap = sub(p, a);
  const proj = dot(ap, ab);
  const abLenSq = dot(ab, ab);
  const d = Math.max(0, Math.min(1, proj / abLenSq));

  const closest = add(a, mult(ab, d));
  const distVec = sub(p, closest);
  const distance = mag(distVec);
  
  // Normal pointing from closest point on wall towards the ball
  let normal = normalize(distVec);
  
  // Fallback if ball is exactly on the line
  if (distance === 0) {
      normal = { x: -ab.y, y: ab.x };
      normal = normalize(normal);
  }

  return { dist: distance, normal, closest };
};

export const generateShape = (type: string, vertexCount: number, radius: number, center: Vector2, rotation: number): Vector2[] => {
    // Basic polygons
    if (['triangle', 'square', 'pentagon', 'hexagon', 'octagon'].includes(type)) {
        return generatePolygon(vertexCount || 4, radius, center, rotation);
    }
    if (type === 'star') {
        return generateStar(vertexCount || 5, radius, radius * 0.45, center, rotation);
    }

    let normalizedPoints: Vector2[] = [];

    // Custom Shapes (defined in approx -1 to 1 space)
    switch(type) {
        case 'house':
            normalizedPoints = [
                {x: 0, y: -1},      // Top Peak
                {x: 0.8, y: -0.4},  // Roof Right
                {x: 0.8, y: 1},     // Base Right
                {x: -0.8, y: 1},    // Base Left
                {x: -0.8, y: -0.4}  // Roof Left
            ];
            break;
        case 'skull':
            normalizedPoints = [
                {x: 0, y: -1},       // Top
                {x: 0.7, y: -0.7},   // Top Right
                {x: 0.9, y: 0},      // Cheek Right
                {x: 0.5, y: 0.5},    // Jaw Start Right
                {x: 0.3, y: 1},      // Chin Right
                {x: -0.3, y: 1},     // Chin Left
                {x: -0.5, y: 0.5},   // Jaw Start Left
                {x: -0.9, y: 0},     // Cheek Left
                {x: -0.7, y: -0.7},  // Top Left
            ];
            break;
        case 'candy_cane':
             // A hollow loop isn't supported, so this is a "J" shaped container
            normalizedPoints = [
                {x: -0.5, y: -1}, // Top Left Hook
                {x: 0.5, y: -1},  // Top Right Hook
                {x: 0.5, y: 1},   // Bottom Right
                {x: -0.2, y: 1},  // Bottom Left
                {x: -0.2, y: -0.4}, // Inner crook start
                {x: -0.5, y: -0.4}  // Inner crook end
            ];
            break;
        case 'tree':
            normalizedPoints = [
                {x: 0, y: -1},      // Top
                {x: 0.4, y: -0.4},
                {x: 0.2, y: -0.4},
                {x: 0.6, y: 0.2},
                {x: 0.3, y: 0.2},
                {x: 0.7, y: 1},     // Base R
                {x: -0.7, y: 1},    // Base L
                {x: -0.3, y: 0.2},
                {x: -0.6, y: 0.2},
                {x: -0.2, y: -0.4},
                {x: -0.4, y: -0.4}
            ];
            break;
        case 'ghost':
            normalizedPoints = [
                {x: 0, y: -1},
                {x: 0.8, y: -0.5},
                {x: 0.8, y: 1},
                {x: 0.4, y: 0.8}, // Wavy bottom
                {x: 0, y: 1},
                {x: -0.4, y: 0.8},
                {x: -0.8, y: 1},
                {x: -0.8, y: -0.5}
            ];
            break;
        case 'pumpkin':
            normalizedPoints = [
                {x: 0, y: -0.9}, // Stem base
                {x: 0.1, y: -1.1}, // Stem top R
                {x: -0.1, y: -1.1}, // Stem top L
                {x: 0, y: -0.9}, // Back to base (rough)
                {x: -0.6, y: -0.8},
                {x: -0.9, y: -0.3},
                {x: -0.95, y: 0.3},
                {x: -0.5, y: 0.9},
                {x: 0.5, y: 0.9},
                {x: 0.95, y: 0.3},
                {x: 0.9, y: -0.3},
                {x: 0.6, y: -0.8},
            ];
            break;
        default:
             return generatePolygon(4, radius, center, rotation);
    }

    // Scale and Rotate
    return normalizedPoints.map(p => {
        const scaled = mult(p, radius);
        return rotatePoint(scaled, center, rotation);
    });
};
