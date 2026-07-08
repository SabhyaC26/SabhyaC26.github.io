import { useCallback, useEffect, useRef, useState } from "react";

const GRID_SIZE = 15;
const INITIAL_SPEED = 150;

interface Point {
  x: number;
  y: number;
}

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([
    { x: 7, y: 7 },
    { x: 7, y: 8 },
    { x: 7, y: 9 },
  ]);
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [food, setFood] = useState<Point>({ x: 4, y: 4 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem("tp:snake-highscore");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [isFocused, setIsFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<Point>(direction);
  directionRef.current = direction;

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    while (true) {
      const newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!onSnake) return newFood;
    }
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [
      { x: 7, y: 7 },
      { x: 7, y: 8 },
      { x: 7, y: 9 },
    ];
    setSnake(initialSnake);
    setDirection({ x: 0, y: -1 });
    setFood(generateFood(initialSnake));
    setGameOver(false);
    setScore(0);
  }, [generateFood]);

  // Game loop
  useEffect(() => {
    if (!isFocused || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const dir = directionRef.current;
        const newHead = {
          x: (head.x + dir.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + dir.y + GRID_SIZE) % GRID_SIZE,
        };

        // Self collision check
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Food collision check
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => {
            const nextScore = s + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              try {
                localStorage.setItem("tp:snake-highscore", String(nextScore));
              } catch {
                /* ignore */
              }
            }
            return nextScore;
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, INITIAL_SPEED);

    return () => clearInterval(interval);
  }, [isFocused, gameOver, food, highScore, generateFood]);

  // Key handlers
  useEffect(() => {
    if (!isFocused) return;

    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      const dir = directionRef.current;
      let nextDir: Point | null = null;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (dir.y === 0) nextDir = { x: 0, y: -1 };
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (dir.y === 0) nextDir = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (dir.x === 0) nextDir = { x: -1, y: 0 };
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (dir.x === 0) nextDir = { x: 1, y: 0 };
          break;
        case "Enter":
        case " ":
          if (gameOver) {
            e.preventDefault();
            resetGame();
          }
          break;
      }

      if (nextDir) {
        e.preventDefault();
        setDirection(nextDir);
      } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        // Prevent scrolling/history when focused
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isFocused, gameOver, resetGame]);

  return (
    <div
      ref={containerRef}
      className={`snake-container ${isFocused ? "focused" : ""}`}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        outline: "none",
        margin: "12px 0",
        maxWidth: "340px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          marginBottom: "6px",
          color: "var(--fg-muted)",
        }}
      >
        <span>SCORE: <span className="accent bold">{score}</span></span>
        <span>HIGH SCORE: <span className="green bold">{highScore}</span></span>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1/1",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isBody = !isHead && snake.some((segment) => segment.x === x && segment.y === segment.y && segment.x === x && segment.y === y);
          const isFood = food.x === x && food.y === y;

          let cellColor = "transparent";
          let borderRadius = "0px";

          if (isHead) {
            cellColor = "var(--accent)";
            borderRadius = "4px";
          } else if (isBody) {
            cellColor = "color-mix(in srgb, var(--accent) 60%, transparent)";
            borderRadius = "2px";
          } else if (isFood) {
            cellColor = "var(--green)";
            borderRadius = "50%";
          }

          return (
            <div
              key={i}
              style={{
                background: cellColor,
                borderRadius,
                margin: "1px",
                transition: "background 0.05s ease",
              }}
            />
          );
        })}

        {!isFocused && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--fg)",
              fontSize: "13px",
              textAlign: "center",
              padding: "20px",
              cursor: "pointer",
            }}
            onClick={() => containerRef.current?.focus()}
          >
            <p className="accent bold" style={{ margin: "0 0 6px" }}>
              🐍 RETRO SNAKE
            </p>
            <p className="faint" style={{ margin: 0, fontSize: "11px" }}>
              Click to focus & play
            </p>
            <p className="faint" style={{ margin: "4px 0 0", fontSize: "10px" }}>
              Use Arrow keys or WASD
            </p>
          </div>
        )}

        {isFocused && gameOver && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--fg)",
              fontSize: "13px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <p className="red bold" style={{ margin: "0 0 6px", fontSize: "16px" }}>
              GAME OVER
            </p>
            <p className="muted" style={{ margin: "0 0 12px" }}>
              Final Score: <span className="accent bold">{score}</span>
            </p>
            <button
              onClick={resetGame}
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
                border: "none",
                borderRadius: "4px",
                padding: "6px 12px",
                fontSize: "11px",
                fontFamily: "inherit",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Play Again
            </button>
            <p className="faint" style={{ margin: "6px 0 0", fontSize: "9px" }}>
              or press Space/Enter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
