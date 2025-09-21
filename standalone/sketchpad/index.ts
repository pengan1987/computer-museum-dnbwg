import { Controller } from "../src/controller";
import { Display, DisplayFile } from "../src/display";
import { Universe } from "../src/document";

let canvas = document.getElementById("sketchpad-canvas") as HTMLCanvasElement;
if (!canvas) throw new Error("Can't find canvas");

let u = new Universe();
u.runConstraints = true;

// line with arrowheads
let arrowPic = u.currentPicture;
u.addPointInLineSegment([0, 100]);
let p1 = u.addPointInLineSegment([-20, 80]);
u.addPointInLineSegment([0, 100]);
let p2 = u.addPointInLineSegment([20, 80]);
u.addPointInLineSegment([0, 100]);
u.addPointInLineSegment([0, -100]);
let p3 = u.addPointInLineSegment([-20, -80]);
u.addPointInLineSegment([0, -100]);
let p4 = u.addPointInLineSegment([20, -80]);

arrowPic.addSameYConstraint(p1, p2);
arrowPic.addSameXConstraint(p1, p3);
arrowPic.addSameXConstraint(p2, p4);
arrowPic.addSameYConstraint(p3, p4);

// Cool figure from repeated arrowheads
let flowerPic = u.addPicture();
flowerPic.addInstance(arrowPic, 0, 0, 1, 0);
flowerPic.addInstance(arrowPic, 0, 0, 1, Math.PI / 6);
flowerPic.addInstance(arrowPic, 0, 0, 1, Math.PI / 3);
flowerPic.addInstance(arrowPic, 0, 0, 1, (3 * Math.PI) / 6);
flowerPic.addInstance(arrowPic, 0, 0, 1, (2 * Math.PI) / 3);
flowerPic.addInstance(arrowPic, 0, 0, 1, (5 * Math.PI) / 6);

// Rivet example
let rivetPic = u.addPicture();
let topLeft = rivetPic.addPoint([-90, 100]);
let topRight = rivetPic.addPoint([100, 90]);
let bottomLeft = rivetPic.addPoint([-100, -110]);
let bottomRight = rivetPic.addPoint([200, -150]);
let center = rivetPic.addPoint([0, 0]);
let cStart = rivetPic.addPoint([250, 100]);
let cEnd = rivetPic.addPoint([-250, 100]);

rivetPic.addPointOnLineConstraint(center, topLeft, bottomRight);
rivetPic.addPointOnLineConstraint(center, topRight, bottomLeft);
rivetPic.addPointOnLineConstraint(topLeft, cStart, cEnd);
rivetPic.addPointOnLineConstraint(topRight, cStart, cEnd);
rivetPic.addPerpendicularConstraint(
  topLeft,
  bottomLeft,
  bottomLeft,
  bottomRight
);
rivetPic.addPerpendicularConstraint(
  bottomLeft,
  bottomRight,
  bottomRight,
  topRight
);
rivetPic.addParallelConstraint(bottomLeft, bottomRight, cStart, cEnd);
rivetPic.addLine(topLeft, bottomLeft);
rivetPic.addLine(bottomLeft, bottomRight);
rivetPic.addLine(bottomRight, topRight);
rivetPic.addLine(bottomLeft, topRight);
rivetPic.addLine(cStart, cEnd);
rivetPic.addArc(center, cStart, cEnd);

// Regular hexagon
let hexagonPic = u.addPicture();

let c = hexagonPic.addPoint([0, 0]);
let start = hexagonPic.addPoint([200, 0]);
hexagonPic.addArc(c, start, start);

let h1 = hexagonPic.addPoint([200, 0]);
let h2 = hexagonPic.addPoint([80, -160]);
hexagonPic.addLine(h1, h2);
let h3 = hexagonPic.addPoint([-60, -160]);
hexagonPic.addLine(h2, h3);
let h4 = hexagonPic.addPoint([-190, 10]);
hexagonPic.addLine(h3, h4);
let h5 = hexagonPic.addPoint([-70, 140]);
hexagonPic.addLine(h4, h5);
let h6 = hexagonPic.addPoint([70, 150]);
hexagonPic.addLine(h5, h6);
hexagonPic.addLine(h6, h1);
hexagonPic.addPointOnArcConstraint(h1, c, start, start);
hexagonPic.addPointOnArcConstraint(h2, c, start, start);
hexagonPic.addPointOnArcConstraint(h3, c, start, start);
hexagonPic.addPointOnArcConstraint(h4, c, start, start);
hexagonPic.addPointOnArcConstraint(h5, c, start, start);
hexagonPic.addPointOnArcConstraint(h6, c, start, start);
hexagonPic.addSameDistanceConstraint(h1, h2, h2, h3);
hexagonPic.addSameDistanceConstraint(h2, h3, h3, h4);
hexagonPic.addSameDistanceConstraint(h3, h4, h5, h6);
hexagonPic.addSameDistanceConstraint(h4, h5, h6, h1);

// Constraining arc to lie on circle
let arcConstraintPic = u.addPicture();
{
  let p1 = arcConstraintPic.addPoint([100, 0]);
  let p2 = arcConstraintPic.addPoint([-100, 0]);
  let p3 = arcConstraintPic.addPoint([50, -50]);
  let l1 = arcConstraintPic.addLine(p1, p2);
  let l2 = arcConstraintPic.addLine(p1, p3);
  let l3 = arcConstraintPic.addLine(p3, p2);

  let arc = arcConstraintPic.addArc(p3, p1, p2);
}

// Full picture with lots of instances
let combinedPic = u.addPicture();
combinedPic.addCopy(rivetPic, -400, -400, 1.3, Math.PI / 2);
combinedPic.addCopy(hexagonPic, 0, 0, 1, 0);
combinedPic.addInstance(flowerPic, 400, 400, 0.8, 0);
combinedPic.addCopy(arcConstraintPic, -500, 300, 1, 0);

// let freshPic = u.addPicture();

let df = new DisplayFile();
df.zoom = 0.75;

let loop = () => {
  df.clear();
  u.display(df, df.displayTransform());
  requestAnimationFrame(loop);
};
loop();

let d = new Display(df, canvas, u);

let cEl = document.getElementById("controller");
if (cEl) {
  let c = new Controller(cEl, canvas, u, df);
} else {
  console.error("No controller element");
}
