import "./style.css";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

type IPlayer = "red" | "green";
let currentPlayer: IPlayer = "red";

const columns = 5;
const padding = 24;

let cellSize: number;

let mouseX = 0;
let mouseY = 0;

interface IPoint {
  x: number;
  y: number;
}
interface IPointWithDistance extends IPoint {
  distance: number;
}

let startingPoint: IPoint | undefined;

interface ILine {
  start: IPoint;
  end: IPoint;
  player: IPlayer;
}

const lines: ILine[] = [];

let closest: IPointWithDistance | undefined;

const getAngle = (p1: IPoint, p2: IPoint): number =>
  Math.atan((p2.y - p1.y) / (p2.x - p1.x));

const getDistance = (p1: IPoint, p2: IPoint): number =>
  Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

const draw = () => {
  requestAnimationFrame(draw);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  cellSize = Math.floor((canvas.width - padding * 2) / columns);

  closest = undefined;

  for (let { end, start, player } of lines) {
    ctx.beginPath();
    ctx.strokeStyle = player;
    ctx.lineWidth = 4;

    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  if (startingPoint) {
    ctx.beginPath();
    const distance = Math.floor(
      Math.sqrt(
        Math.pow(mouseX - startingPoint.x, 2) +
          Math.pow(mouseY - startingPoint.y, 2)
      )
    );
    if (distance <= cellSize) {
      ctx.strokeStyle = "grey";
    } else {
      ctx.strokeStyle = "red";
    }

    ctx.moveTo(startingPoint.x, startingPoint.y);
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
  }

  for (let row = 0; row < columns + 2; row++) {
    for (let col = 0; col < columns + 2; col++) {
      const x = col * cellSize + padding;
      const y = row * cellSize + padding;

      const distance = Math.sqrt(
        Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2)
      );
      if (!closest || (closest && closest.distance > distance)) {
        if (distance < cellSize / 3)
          closest = {
            distance,
            x,
            y,
          };
      }

      ctx.beginPath();
      ctx.fillStyle = "pink";
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (closest) {
    // console.debug(closest)
    const { x, y } = closest;
    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);
  ctx.fill();
};

const handleMouseMove = (ev: MouseEvent) => {
  mouseX = ev.clientX;
  mouseY = ev.clientY;
};

const handleMouseDown = (ev: MouseEvent) => {
  if (closest) startingPoint = closest;
};

const handleMouseUp = (ev: MouseEvent) => {
  if (startingPoint && closest) {
    if (cellSize) {
      const distanceBetweenPoints = Math.sqrt(
        Math.pow(startingPoint.x - closest.x, 2) +
          Math.pow(startingPoint.y - closest.y, 2)
      );
      if (Math.floor(distanceBetweenPoints) <= cellSize) {
        lines.push({
          start: startingPoint,
          end: closest,
          player: currentPlayer,
        });
        currentPlayer = currentPlayer === "red" ? "green" : "red";

        const angle = Math.floor(Math.abs(getAngle(startingPoint, closest)));
        if (angle > 0) {
          console.debug("vertical line");
        } else {
          console.debug("horizontal line");
        }
      }
    }
    startingPoint = undefined;
  }
};

const setup = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  canvas.onmousemove = handleMouseMove;
  canvas.onmousedown = handleMouseDown;
  canvas.onmouseup = handleMouseUp;

  draw();
};

setup();
