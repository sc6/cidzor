"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { init, GameLoop, Sprite } from "kontra";

// Ball level configuration (20 levels)
const BALL_LEVELS = [
  { radius: 15, color: "#ff6b6b" },   // Level 0 - Red
  { radius: 22, color: "#4ecdc4" },   // Level 1 - Teal
  { radius: 28, color: "#45b7d1" },   // Level 2 - Blue
  { radius: 34, color: "#96ceb4" },   // Level 3 - Green
  { radius: 40, color: "#ffeaa7" },   // Level 4 - Yellow
  { radius: 46, color: "#dfe6e9" },   // Level 5 - Gray
  { radius: 52, color: "#a29bfe" },   // Level 6 - Purple
  { radius: 58, color: "#fd79a8" },   // Level 7 - Pink
  { radius: 64, color: "#fdcb6e" },   // Level 8 - Orange
  { radius: 70, color: "#6c5ce7" },   // Level 9 - Deep Purple
  { radius: 76, color: "#e17055" },   // Level 10 - Coral
  { radius: 82, color: "#00b894" },   // Level 11 - Mint
  { radius: 88, color: "#0984e3" },   // Level 12 - Sky Blue
  { radius: 94, color: "#fdcb6e" },   // Level 13 - Gold
  { radius: 100, color: "#d63031" },  // Level 14 - Dark Red
  { radius: 106, color: "#00cec9" },  // Level 15 - Cyan
  { radius: 112, color: "#6c5ce7" },  // Level 16 - Indigo
  { radius: 118, color: "#ff7675" },  // Level 17 - Light Red
  { radius: 124, color: "#74b9ff" },  // Level 18 - Baby Blue
  { radius: 135, color: "#a29bfe" },  // Level 19 - Lavender
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
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const { canvas, context } = init(canvasRef.current);

    const ORIGINAL_WIDTH = 500;
    const ORIGINAL_HEIGHT = 500;
    let GAME_WIDTH = ORIGINAL_WIDTH;
    let GAME_HEIGHT = ORIGINAL_HEIGHT;
    let scaleFactor = 1;

    const PLAYER_ACCELERATION = 1.2;
    const PLAYER_MAX_SPEED = 8;
    const PLAYER_FRICTION = 0.85;
    const FRICTION = 0.95;

    // Detect device type for exit instructions
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    const getExitInstruction = () => {
      if (isIOS) return "Exit: Swipe from top edge";
      if (isAndroid) return "Exit: Swipe from top or use back button";
      if (isTouchDevice) return "Exit: Swipe from edge";
      return "Exit: Press Esc";
    };

    // Audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Resume audio context on first user interaction (required by browsers)
    const enableAudio = () => {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    };

    canvas.addEventListener('click', enableAudio, { once: true });
    canvas.addEventListener('touchstart', enableAudio, { once: true });

    // Play merge sound based on level
    const playMergeSound = (level: number) => {
      // Don't play if muted
      if (isMuted) return;

      // Ensure audio context is running
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create oscillator for tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Frequency increases with level (200Hz to 1000Hz)
      const baseFrequency = 200;
      const frequency = baseFrequency + (level * 40);
      oscillator.frequency.value = frequency;

      // Use sine wave for smooth tone
      oscillator.type = 'sine';

      // Volume envelope - quick attack and decay
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Play sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    };

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
    let isMuted = false;

    // Mouse/Touch controls
    const mouse = {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
    };

    const updateMousePosition = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;
      // Scale mouse coordinates based on canvas display size vs actual size
      mouse.x = (canvasX / rect.width) * GAME_WIDTH;
      mouse.y = (canvasY / rect.height) * GAME_HEIGHT;
    };

    // Prevent touch events on container from triggering default behaviors
    const preventContainerTouch = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        // Entering fullscreen - fill entire screen
        GAME_WIDTH = window.innerWidth;
        GAME_HEIGHT = window.innerHeight;

        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;

        // Calculate scale factor (use average of both dimensions)
        const scaleX = GAME_WIDTH / ORIGINAL_WIDTH;
        const scaleY = GAME_HEIGHT / ORIGINAL_HEIGHT;
        scaleFactor = Math.min(scaleX, scaleY);

        // Scale player size
        player.width = 30 * scaleFactor;
        player.height = 30 * scaleFactor;

        // Scale all existing balls
        balls.forEach((ball) => {
          ball.sprite.x *= scaleFactor;
          ball.sprite.y *= scaleFactor;
          ball.sprite.radius = BALL_LEVELS[ball.level].radius * scaleFactor;
        });

        // Scale player position
        player.x *= scaleFactor;
        player.y *= scaleFactor;

        // Add touch event listeners to container to prevent iOS swipe gestures
        if (containerRef.current) {
          containerRef.current.addEventListener("touchstart", preventContainerTouch, { passive: false });
          containerRef.current.addEventListener("touchmove", preventContainerTouch, { passive: false });
          containerRef.current.addEventListener("touchend", preventContainerTouch, { passive: false });
        }
      } else {
        // Exiting fullscreen - restore original size
        const oldScaleFactor = scaleFactor;
        scaleFactor = 1;
        GAME_WIDTH = ORIGINAL_WIDTH;
        GAME_HEIGHT = ORIGINAL_HEIGHT;

        canvas.width = ORIGINAL_WIDTH;
        canvas.height = ORIGINAL_HEIGHT;

        // Restore player size
        player.width = 30;
        player.height = 30;

        // Restore all ball sizes and positions
        balls.forEach((ball) => {
          ball.sprite.x /= oldScaleFactor;
          ball.sprite.y /= oldScaleFactor;
          ball.sprite.radius = BALL_LEVELS[ball.level].radius;
        });

        // Restore player position
        player.x /= oldScaleFactor;
        player.y /= oldScaleFactor;

        // Remove touch event listeners from container
        if (containerRef.current) {
          containerRef.current.removeEventListener("touchstart", preventContainerTouch);
          containerRef.current.removeEventListener("touchmove", preventContainerTouch);
          containerRef.current.removeEventListener("touchend", preventContainerTouch);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const handleMouseMove = (e: MouseEvent) => {
      updateMousePosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent page scrolling
      if (e.touches.length > 0) {
        updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Prevent page scrolling
      if (e.touches.length > 0) {
        updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });

    // Handle canvas clicks (mute icon)
    const handleCanvasClick = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;

      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;
      const x = (canvasX / rect.width) * GAME_WIDTH;
      const y = (canvasY / rect.height) * GAME_HEIGHT;

      // Check if click is on mute icon (top right corner)
      const iconX = GAME_WIDTH - 30 * scaleFactor;
      const iconY = 10 * scaleFactor;
      const iconSize = 20 * scaleFactor;

      if (x >= iconX && x <= iconX + iconSize && y >= iconY && y <= iconY + iconSize) {
        isMuted = !isMuted;
      }
    };

    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("touchend", handleCanvasClick);

    // Spawn a ball at random position within visible area
    const spawnBall = () => {
      const level = 0; // Only spawn red balls (level 0)
      const config = BALL_LEVELS[level];

      // Ensure balls spawn fully within visible canvas
      // Use safe margins from edges (scaled)
      const margin = 80 * scaleFactor;
      const minX = margin;
      const maxX = GAME_WIDTH - margin;
      const minY = margin;
      const maxY = GAME_HEIGHT - margin;

      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);

      const sprite = Sprite({
        x,
        y,
        radius: config.radius * scaleFactor,
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
        radius: config.radius * scaleFactor,
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

      // Play merge sound
      playMergeSound(newLevel);

      return true;
    };

    // Game loop
    const loop = GameLoop({
      update: () => {
        // Player follows mouse cursor instantly
        // Center the player on the mouse cursor
        const newX = mouse.x - player.width / 2;
        const newY = mouse.y - player.height / 2;

        // Calculate velocity based on position change (for ball pushing physics)
        player.dx = newX - player.x;
        player.dy = newY - player.y;

        // Update position
        player.x = newX;
        player.y = newY;

        // Keep player in bounds
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > GAME_WIDTH) {
          player.x = GAME_WIDTH - player.width;
        }
        if (player.y < 0) player.y = 0;
        if (player.y + player.height > GAME_HEIGHT) {
          player.y = GAME_HEIGHT - player.height;
        }

        // Spawn balls at rate based on highest level
        const currentTime = Date.now();
        const highestLevel = balls.length > 0 ? Math.max(...balls.map(b => b.level)) : 0;

        // Only spawn if there are fewer than 45 balls
        if (balls.length < 45) {
          // Calculate spawn interval based on level
          // Level 0-1: 2000ms, Level 19: 250ms
          let spawnInterval;
          if (highestLevel <= 1) {
            spawnInterval = 2000;
          } else {
            // Linear interpolation from level 1 (2000ms) to level 19 (250ms)
            const progress = (highestLevel - 1) / (19 - 1); // 0 to 1
            spawnInterval = 2000 - progress * (2000 - 250);
          }

          if (currentTime - lastSpawnTime > spawnInterval) {
            spawnBall();
            lastSpawnTime = currentTime;
          }
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

        // In fullscreen mode, center text at the top
        if (document.fullscreenElement) {
          context.textAlign = "center";
          const centerX = GAME_WIDTH / 2;

          context.fillText("Move your mouse to control the square", centerX, 30);

          // Display level
          const highestLevel = balls.length > 0 ? Math.max(...balls.map(b => b.level)) : 0;
          context.fillText(`Level: ${highestLevel}`, centerX, 55);

          // Show exit fullscreen instructions
          context.fillText(getExitInstruction(), centerX, 80);

          context.textAlign = "left"; // Reset alignment
        } else {
          // Normal mode: top left positioning
          context.fillText("Move your mouse to control the square", 10, 20);

          // Display level
          const highestLevel = balls.length > 0 ? Math.max(...balls.map(b => b.level)) : 0;
          context.fillText(`Level: ${highestLevel}`, 10, 40);
        }

        // Draw mute icon in top right corner (discreet)
        const iconX = GAME_WIDTH - 30;
        const iconY = 10;
        const iconSize = 20;

        context.globalAlpha = 0.4; // Make it semi-transparent
        context.fillStyle = "#888";
        context.strokeStyle = "#888";
        context.lineWidth = 1.5;

        // Draw small speaker
        context.beginPath();
        context.moveTo(iconX + 3, iconY + 6);
        context.lineTo(iconX + 3, iconY + 14);
        context.lineTo(iconX + 8, iconY + 14);
        context.lineTo(iconX + 14, iconY + 17);
        context.lineTo(iconX + 14, iconY + 3);
        context.lineTo(iconX + 8, iconY + 6);
        context.closePath();
        context.fill();

        if (!isMuted) {
          // Draw small sound waves
          context.beginPath();
          context.arc(iconX + 14, iconY + 10, 3, -Math.PI / 4, Math.PI / 4);
          context.stroke();
          context.beginPath();
          context.arc(iconX + 14, iconY + 10, 5, -Math.PI / 4, Math.PI / 4);
          context.stroke();
        } else {
          // Draw small X over speaker
          context.lineWidth = 2;
          context.strokeStyle = "#c0392b";
          context.beginPath();
          context.moveTo(iconX + 1, iconY + 2);
          context.lineTo(iconX + iconSize - 2, iconY + iconSize - 2);
          context.moveTo(iconX + iconSize - 2, iconY + 2);
          context.lineTo(iconX + 1, iconY + iconSize - 2);
          context.stroke();
        }

        context.globalAlpha = 1.0; // Reset alpha
      },
    });

    loop.start();

    return () => {
      loop.stop();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("touchend", handleCanvasClick);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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

        <div ref={containerRef} className="flex flex-col items-center justify-center gap-4 bg-slate-100 dark:bg-slate-900">
          <style jsx>{`
            canvas {
              touch-action: none;
              -webkit-user-select: none;
              user-select: none;
            }
            div:fullscreen {
              width: 100vw;
              height: 100vh;
              padding: 0;
              margin: 0;
            }
            div:fullscreen canvas {
              width: 100vw !important;
              height: 100vh !important;
              border: none !important;
              border-radius: 0 !important;
              touch-action: none !important;
            }
            div:fullscreen button {
              display: none;
            }
          `}</style>
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="border-4 border-slate-300 dark:border-slate-700 rounded-lg shadow-xl"
          />
          <button
            onClick={toggleFullscreen}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            Toggle Fullscreen
          </button>
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
