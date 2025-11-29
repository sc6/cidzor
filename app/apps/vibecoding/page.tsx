"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { init, GameLoop, Sprite } from "kontra";

// Ball level configuration (10 levels)
const BALL_LEVELS = [
  { radius: 10, color: "#ff6b6b" },   // Level 0 - Red
  { radius: 15, color: "#4ecdc4" },   // Level 1 - Teal
  { radius: 20, color: "#45b7d1" },   // Level 2 - Blue
  { radius: 25, color: "#96ceb4" },   // Level 3 - Green
  { radius: 30, color: "#ffeaa7" },   // Level 4 - Yellow
  { radius: 35, color: "#dfe6e9" },   // Level 5 - Gray
  { radius: 40, color: "#a29bfe" },   // Level 6 - Purple
  { radius: 45, color: "#fd79a8" },   // Level 7 - Pink
  { radius: 50, color: "#fdcb6e" },   // Level 8 - Orange
  { radius: 60, color: "#6c5ce7" },   // Level 9 - Deep Purple
];

interface Ball {
  sprite: any;
  level: number;
  velocityX: number;
  velocityY: number;
  rotation: number; // For rolling effect
}

export default function VibecodingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const { canvas, context } = init(canvasRef.current);

    const GAME_WIDTH = canvas.width;
    const GAME_HEIGHT = canvas.height;

    const PLAYER_ACCELERATION = 1.2;
    const PLAYER_MAX_SPEED = 8;
    const PLAYER_FRICTION = 0.85;
    const FRICTION = 0.95;

    // Player square (top-down view)
    const player = Sprite({
      x: GAME_WIDTH / 2 - 15,
      y: GAME_HEIGHT / 2 - 15,
      width: 30,
      height: 30,
      color: "#2d3436",
      dx: 0,
      dy: 0,
    });

    const balls: Ball[] = [];
    let lastSpawnTime = Date.now();
    const SPAWN_INTERVAL = 2000; // 2 seconds

    // Mouse controls
    const mouse = {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    // Spawn a ball at random position within visible area
    const spawnBall = () => {
      const level = Math.floor(Math.random() * 3); // Start with levels 0-2
      const config = BALL_LEVELS[level];

      // Ensure balls spawn fully within visible canvas
      // Use safe margins from edges
      const margin = 80; // Extra margin to ensure visibility
      const minX = margin;
      const maxX = GAME_WIDTH - margin;
      const minY = margin;
      const maxY = GAME_HEIGHT - margin;

      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);

      const sprite = Sprite({
        x,
        y,
        radius: config.radius,
        color: config.color,
        rotation: 0,
      });

      const ball: Ball = {
        sprite,
        level,
        velocityX: 0,
        velocityY: 0,
        rotation: 0,
      };

      balls.push(ball);
    };

    // Spawn initial balls
    spawnBall();
    spawnBall();
    spawnBall();

    // Check collision between two circles
    const checkBallCollision = (ball1: Ball, ball2: Ball) => {
      const dx = ball1.sprite.x - ball2.sprite.x;
      const dy = ball1.sprite.y - ball2.sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = ball1.sprite.radius + ball2.sprite.radius;

      return distance < minDistance;
    };

    // Check collision between player (square) and ball (circle)
    const checkPlayerBallCollision = (ball: Ball) => {
      // Find closest point on square to circle
      const closestX = Math.max(player.x, Math.min(ball.sprite.x, player.x + player.width));
      const closestY = Math.max(player.y, Math.min(ball.sprite.y, player.y + player.height));

      const dx = ball.sprite.x - closestX;
      const dy = ball.sprite.y - closestY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance < ball.sprite.radius;
    };

    // Merge two balls
    const mergeBalls = (ball1: Ball, ball2: Ball, index1: number, index2: number) => {
      if (ball1.level !== ball2.level || ball1.level >= BALL_LEVELS.length - 1) {
        return false;
      }

      // Create new merged ball
      const newLevel = ball1.level + 1;
      const config = BALL_LEVELS[newLevel];

      const newSprite = Sprite({
        x: (ball1.sprite.x + ball2.sprite.x) / 2,
        y: (ball1.sprite.y + ball2.sprite.y) / 2,
        radius: config.radius,
        color: config.color,
        rotation: 0,
      });

      const newBall: Ball = {
        sprite: newSprite,
        level: newLevel,
        velocityX: 0,
        velocityY: 0,
        rotation: 0,
      };

      // Remove old balls and add new one
      balls.splice(Math.max(index1, index2), 1);
      balls.splice(Math.min(index1, index2), 1);
      balls.push(newBall);

      return true;
    };

    // Game loop
    const loop = GameLoop({
      update: () => {
        // Player follows mouse cursor
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;

        // Calculate direction to mouse
        const dx = mouse.x - playerCenterX;
        const dy = mouse.y - playerCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Move towards mouse with acceleration
        if (distance > 5) { // Dead zone to prevent jittering
          const dirX = dx / distance;
          const dirY = dy / distance;

          // Apply acceleration towards mouse
          player.dx += dirX * PLAYER_ACCELERATION;
          player.dy += dirY * PLAYER_ACCELERATION;
        } else {
          // Apply strong friction when near target
          player.dx *= 0.7;
          player.dy *= 0.7;
        }

        // Apply friction
        player.dx *= PLAYER_FRICTION;
        player.dy *= PLAYER_FRICTION;

        // Cap max speed
        const currentSpeed = Math.sqrt(player.dx * player.dx + player.dy * player.dy);
        if (currentSpeed > PLAYER_MAX_SPEED) {
          player.dx = (player.dx / currentSpeed) * PLAYER_MAX_SPEED;
          player.dy = (player.dy / currentSpeed) * PLAYER_MAX_SPEED;
        }

        // Stop very slow movement
        if (Math.abs(player.dx) < 0.1) player.dx = 0;
        if (Math.abs(player.dy) < 0.1) player.dy = 0;

        player.update();

        // Keep player in bounds
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > GAME_WIDTH) {
          player.x = GAME_WIDTH - player.width;
        }
        if (player.y < 0) player.y = 0;
        if (player.y + player.height > GAME_HEIGHT) {
          player.y = GAME_HEIGHT - player.height;
        }

        // Spawn balls
        const currentTime = Date.now();
        if (currentTime - lastSpawnTime > SPAWN_INTERVAL) {
          spawnBall();
          lastSpawnTime = currentTime;
        }

        // Update balls
        balls.forEach((ball) => {
          // Update position
          ball.sprite.x += ball.velocityX;
          ball.sprite.y += ball.velocityY;

          // Update rotation based on movement (rolling effect)
          const speed = Math.sqrt(ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY);
          if (speed > 0.1) {
            // Rotate based on how far the ball moved
            ball.rotation += speed / ball.sprite.radius;
            ball.sprite.rotation = ball.rotation;
          }

          // Apply friction
          ball.velocityX *= FRICTION;
          ball.velocityY *= FRICTION;

          // Stop very slow movement (prevent endless drift)
          if (Math.abs(ball.velocityX) < 0.01) ball.velocityX = 0;
          if (Math.abs(ball.velocityY) < 0.01) ball.velocityY = 0;

          // Keep balls in bounds with bounce
          if (ball.sprite.x - ball.sprite.radius < 0) {
            ball.sprite.x = ball.sprite.radius;
            ball.velocityX = Math.abs(ball.velocityX) * 0.5; // Bounce with energy loss
          }
          if (ball.sprite.x + ball.sprite.radius > GAME_WIDTH) {
            ball.sprite.x = GAME_WIDTH - ball.sprite.radius;
            ball.velocityX = -Math.abs(ball.velocityX) * 0.5;
          }
          if (ball.sprite.y - ball.sprite.radius < 0) {
            ball.sprite.y = ball.sprite.radius;
            ball.velocityY = Math.abs(ball.velocityY) * 0.5;
          }
          if (ball.sprite.y + ball.sprite.radius > GAME_HEIGHT) {
            ball.sprite.y = GAME_HEIGHT - ball.sprite.radius;
            ball.velocityY = -Math.abs(ball.velocityY) * 0.5;
          }
        });

        // Check player-ball collisions (player pushes balls)
        balls.forEach((ball) => {
          if (checkPlayerBallCollision(ball)) {
            // Find the closest point on the square to the ball center
            const closestX = Math.max(player.x, Math.min(ball.sprite.x, player.x + player.width));
            const closestY = Math.max(player.y, Math.min(ball.sprite.y, player.y + player.height));

            // Calculate push direction from closest point to ball center
            const dx = ball.sprite.x - closestX;
            const dy = ball.sprite.y - closestY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
              // Normalize direction
              const nx = dx / distance;
              const ny = dy / distance;

              // Calculate overlap - how much the ball is intersecting
              const overlap = ball.sprite.radius - distance;

              // Always push ball completely out of the player
              if (overlap > 0) {
                // Add extra separation to ensure ball is pushed out
                const separationDistance = overlap + 1;
                ball.sprite.x += nx * separationDistance;
                ball.sprite.y += ny * separationDistance;
              }

              // Transfer player's momentum to the ball (realistic pushing)
              const momentumTransfer = 0.8;
              ball.velocityX += player.dx * momentumTransfer;
              ball.velocityY += player.dy * momentumTransfer;

              // Push in direction away from collision point
              const pushForce = 2.0;
              ball.velocityX += nx * pushForce;
              ball.velocityY += ny * pushForce;
            }
          }
        });

        // Check ball-to-ball collisions and merging
        for (let i = 0; i < balls.length; i++) {
          for (let j = i + 1; j < balls.length; j++) {
            if (checkBallCollision(balls[i], balls[j])) {
              // Try to merge if same level
              if (mergeBalls(balls[i], balls[j], i, j)) {
                break; // Exit inner loop as balls array changed
              } else {
                // Push balls apart
                const ball1 = balls[i];
                const ball2 = balls[j];

                const dx = ball2.sprite.x - ball1.sprite.x;
                const dy = ball2.sprite.y - ball1.sprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance === 0) continue;

                // Normalize
                const nx = dx / distance;
                const ny = dy / distance;

                // Separate balls
                const overlap = (ball1.sprite.radius + ball2.sprite.radius) - distance;
                ball1.sprite.x -= nx * overlap / 2;
                ball1.sprite.y -= ny * overlap / 2;
                ball2.sprite.x += nx * overlap / 2;
                ball2.sprite.y += ny * overlap / 2;

                // Apply slight bounce
                const relativeVelocityX = ball2.velocityX - ball1.velocityX;
                const relativeVelocityY = ball2.velocityY - ball1.velocityY;
                const impulse = (relativeVelocityX * nx + relativeVelocityY * ny) * 0.3;

                ball1.velocityX += impulse * nx;
                ball1.velocityY += impulse * ny;
                ball2.velocityX -= impulse * nx;
                ball2.velocityY -= impulse * ny;
              }
            }
          }
        }
      },
      render: () => {
        // Clear canvas
        context.fillStyle = "#f0f0f0";
        context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Draw grid (top-down view)
        context.strokeStyle = "#e0e0e0";
        context.lineWidth = 1;
        for (let i = 0; i <= GAME_WIDTH; i += 50) {
          context.beginPath();
          context.moveTo(i, 0);
          context.lineTo(i, GAME_HEIGHT);
          context.stroke();
        }
        for (let i = 0; i <= GAME_HEIGHT; i += 50) {
          context.beginPath();
          context.moveTo(0, i);
          context.lineTo(GAME_WIDTH, i);
          context.stroke();
        }

        // Draw border
        context.strokeStyle = "#2d3436";
        context.lineWidth = 2;
        context.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Render balls
        balls.forEach((ball) => {
          // Draw the ball
          context.fillStyle = ball.sprite.color;
          context.beginPath();
          context.arc(ball.sprite.x, ball.sprite.y, ball.sprite.radius, 0, Math.PI * 2);
          context.fill();

          // Draw rolling indicator (a line from center to edge)
          context.save();
          context.translate(ball.sprite.x, ball.sprite.y);
          context.rotate(ball.sprite.rotation || 0);
          context.strokeStyle = "rgba(0, 0, 0, 0.3)";
          context.lineWidth = 2;
          context.beginPath();
          context.moveTo(0, 0);
          context.lineTo(ball.sprite.radius * 0.7, 0);
          context.stroke();

          // Draw a dot to make rotation more visible
          context.fillStyle = "rgba(0, 0, 0, 0.3)";
          context.beginPath();
          context.arc(ball.sprite.radius * 0.5, 0, ball.sprite.radius * 0.15, 0, Math.PI * 2);
          context.fill();
          context.restore();
        });

        // Render player
        player.render();

        // Draw instructions
        context.fillStyle = "#2d3436";
        context.font = "14px Arial";
        context.fillText("Move your mouse to control the square", 10, 20);
        context.fillText(`Balls: ${balls.length}`, 10, 40);
      },
    });

    loop.start();

    return () => {
      loop.stop();
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Vibecoding Game Experiment
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Move the square and push balls together to merge them!
          </p>
        </div>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="border-4 border-slate-300 dark:border-slate-700 rounded-lg shadow-xl"
          />
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-center text-slate-600 dark:text-slate-400">
            Built with Next.js, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
