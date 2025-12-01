"use client";

import { useEffect, useRef } from "react";
import Header from "../../components/Header";
import { init, GameLoop, Sprite } from "kontra";

interface Ball {
  sprite: any;
  id: number;
}

interface TailSegment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  level: number; // 0 = blue, 1 = green (100 blues), 2 = yellow (100 greens)
}

export default function Snake() {
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

    const BASE_PLAYER_SIZE = 20;
    const BASE_BALL_RADIUS = 8;
    const BASE_TAIL_SIZE = 16;

    let PLAYER_SIZE = BASE_PLAYER_SIZE;
    let BALL_RADIUS = BASE_BALL_RADIUS;
    let TAIL_SIZE = BASE_TAIL_SIZE;

    // Player square
    const player = Sprite({
      x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
      y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      color: "#2d3436",
    });

    // Mouse position
    const mouse = {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
    };

    // Game state
    const balls: Ball[] = [];
    const tail: TailSegment[] = [];
    let ballIdCounter = 0;
    let score = 0;
    let isMuted = false;

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

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        // Entering fullscreen - fill entire screen
        GAME_WIDTH = window.innerWidth;
        GAME_HEIGHT = window.innerHeight;

        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;

        // Calculate scale factor
        const scaleX = GAME_WIDTH / ORIGINAL_WIDTH;
        const scaleY = GAME_HEIGHT / ORIGINAL_HEIGHT;
        scaleFactor = Math.min(scaleX, scaleY);

        // Update sizes
        PLAYER_SIZE = BASE_PLAYER_SIZE * scaleFactor;
        BALL_RADIUS = BASE_BALL_RADIUS * scaleFactor;
        TAIL_SIZE = BASE_TAIL_SIZE * scaleFactor;

        // Scale player
        player.width = PLAYER_SIZE;
        player.height = PLAYER_SIZE;
        player.x *= scaleFactor;
        player.y *= scaleFactor;

        // Scale all balls
        balls.forEach((ball) => {
          ball.sprite.x *= scaleFactor;
          ball.sprite.y *= scaleFactor;
          ball.sprite.radius = BALL_RADIUS;
        });

        // Scale all tail segments
        tail.forEach((segment) => {
          segment.x *= scaleFactor;
          segment.y *= scaleFactor;
        });
      } else {
        // Exiting fullscreen - restore original size
        const oldScaleFactor = scaleFactor;
        scaleFactor = 1;
        GAME_WIDTH = ORIGINAL_WIDTH;
        GAME_HEIGHT = ORIGINAL_HEIGHT;

        canvas.width = ORIGINAL_WIDTH;
        canvas.height = ORIGINAL_HEIGHT;

        // Restore sizes
        PLAYER_SIZE = BASE_PLAYER_SIZE;
        BALL_RADIUS = BASE_BALL_RADIUS;
        TAIL_SIZE = BASE_TAIL_SIZE;

        // Restore player
        player.width = PLAYER_SIZE;
        player.height = PLAYER_SIZE;
        player.x /= oldScaleFactor;
        player.y /= oldScaleFactor;

        // Restore all balls
        balls.forEach((ball) => {
          ball.sprite.x /= oldScaleFactor;
          ball.sprite.y /= oldScaleFactor;
          ball.sprite.radius = BALL_RADIUS;
        });

        // Restore all tail segments
        tail.forEach((segment) => {
          segment.x /= oldScaleFactor;
          segment.y /= oldScaleFactor;
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Play eat sound
    const playEatSound = () => {
      if (isMuted) return;

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.frequency.value = 440; // A4 note
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    };

    // Play sound when blue squares compress to green
    const playGreenCompressionSound = () => {
      if (isMuted) return;

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Rising tone from 523Hz (C5) to 659Hz (E5)
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(659, audioContext.currentTime + 0.3);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };

    // Play sound when green squares compress to yellow
    const playYellowCompressionSound = () => {
      if (isMuted) return;

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Rising tone from 659Hz (E5) to 880Hz (A5) - higher pitched
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(880, audioContext.currentTime + 0.4);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    };

    // Update mouse position
    const updateMousePosition = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;
      mouse.x = (canvasX / rect.width) * GAME_WIDTH;
      mouse.y = (canvasY / rect.height) * GAME_HEIGHT;
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateMousePosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
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
        const touch = e.changedTouches[0] || e.touches[0];
        if (!touch) return;
        clientX = touch.clientX;
        clientY = touch.clientY;
      }

      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;
      const x = (canvasX / rect.width) * GAME_WIDTH;
      const y = (canvasY / rect.height) * GAME_HEIGHT;

      // Check if click is on mute icon (top right corner)
      const iconX = GAME_WIDTH - 30;
      const iconY = 10;
      const iconSize = 20;

      if (x >= iconX && x <= iconX + iconSize && y >= iconY && y <= iconY + iconSize) {
        isMuted = !isMuted;
      }
    };

    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("touchend", handleCanvasClick);

    // Spawn a ball at random position
    const spawnBall = () => {
      const margin = 50;
      const x = margin + Math.random() * (GAME_WIDTH - margin * 2);
      const y = margin + Math.random() * (GAME_HEIGHT - margin * 2);

      const sprite = Sprite({
        x,
        y,
        radius: BALL_RADIUS,
        color: "#e74c3c",
      });

      balls.push({
        sprite,
        id: ballIdCounter++,
      });
    };

    // Check collision between player (head only) and ball
    const checkCollision = (ball: Ball) => {
      // Check head collision
      const playerCenterX = player.x + PLAYER_SIZE / 2;
      const playerCenterY = player.y + PLAYER_SIZE / 2;
      const headDx = ball.sprite.x - playerCenterX;
      const headDy = ball.sprite.y - playerCenterY;
      const headDistance = Math.sqrt(headDx * headDx + headDy * headDy);
      if (headDistance < (PLAYER_SIZE / 2 + BALL_RADIUS)) {
        return true;
      }

      return false;
    };

    // Add ball to tail
    const eatBall = (ballIndex: number) => {
      balls.splice(ballIndex, 1);
      tail.push({ x: player.x, y: player.y, vx: 0, vy: 0, level: 0 });
      score++;

      // Play eat sound
      playEatSound();

      // Check if we need to compress blue segments (100 blue -> 1 green)
      const blueSegments = tail.filter(seg => seg.level === 0);
      if (blueSegments.length === 100) {
        // Keep all higher level segments
        const higherLevelSegments = tail.filter(seg => seg.level > 0);

        // Get the position of the last blue segment
        const lastBlueSegment = blueSegments[blueSegments.length - 1];

        // Replace tail with higher level segments plus one new green segment
        tail.length = 0;
        tail.push(...higherLevelSegments);
        tail.push({
          x: lastBlueSegment.x,
          y: lastBlueSegment.y,
          vx: lastBlueSegment.vx,
          vy: lastBlueSegment.vy,
          level: 1
        });

        // Play green compression sound
        playGreenCompressionSound();
      }

      // Check if we need to compress green segments (100 green -> 1 yellow)
      const greenSegments = tail.filter(seg => seg.level === 1);
      if (greenSegments.length === 100) {
        // Keep all other level segments
        const otherSegments = tail.filter(seg => seg.level !== 1);

        // Get the position of the last green segment
        const lastGreenSegment = greenSegments[greenSegments.length - 1];

        // Replace tail with other segments plus one new yellow segment
        tail.length = 0;
        tail.push(...otherSegments);
        tail.push({
          x: lastGreenSegment.x,
          y: lastGreenSegment.y,
          vx: lastGreenSegment.vx,
          vy: lastGreenSegment.vy,
          level: 2
        });

        // Play yellow compression sound
        playYellowCompressionSound();
      }

      // Spawn a new ball to replace the one that was eaten
      spawnBall();
    };

    // Spawn initial ball
    spawnBall();

    // Game loop
    const loop = GameLoop({
      update: () => {
        // Player is the cursor - no delay
        player.x = mouse.x - PLAYER_SIZE / 2;
        player.y = mouse.y - PLAYER_SIZE / 2;

        // Keep player in bounds
        player.x = Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, player.x));
        player.y = Math.max(0, Math.min(GAME_HEIGHT - PLAYER_SIZE, player.y));

        // Update tail with physics-based whipping motion
        const BASE_TAIL_DISTANCE = 16; // Base distance between segments
        const SPRING_STRENGTH = 0.12; // How strongly segments pull toward their target
        const DAMPING = 0.68; // Velocity damping (friction)

        for (let i = 0; i < tail.length; i++) {
          const segment = tail[i];

          // Determine what this segment should follow
          let targetX, targetY;
          if (i === 0) {
            // First segment follows player
            targetX = player.x + PLAYER_SIZE / 2;
            targetY = player.y + PLAYER_SIZE / 2;
          } else {
            // Other segments follow the previous segment
            targetX = tail[i - 1].x + TAIL_SIZE / 2;
            targetY = tail[i - 1].y + TAIL_SIZE / 2;
          }

          // Calculate current center
          const segmentCenterX = segment.x + TAIL_SIZE / 2;
          const segmentCenterY = segment.y + TAIL_SIZE / 2;

          // Calculate direction and distance to target
          const dx = targetX - segmentCenterX;
          const dy = targetY - segmentCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Calculate curve compression - segments move inward on curves
          let tailDistance = BASE_TAIL_DISTANCE;
          if (i > 0) {
            // Get direction vectors
            const prevDx = targetX - segmentCenterX;
            const prevDy = targetY - segmentCenterY;

            // Look ahead to next segment to detect curves
            let nextTargetX, nextTargetY;
            if (i === 1) {
              nextTargetX = player.x + PLAYER_SIZE / 2;
              nextTargetY = player.y + PLAYER_SIZE / 2;
            } else {
              nextTargetX = tail[i - 2].x + TAIL_SIZE / 2;
              nextTargetY = tail[i - 2].y + TAIL_SIZE / 2;
            }

            const nextDx = nextTargetX - targetX;
            const nextDy = nextTargetY - targetY;

            // Calculate angle between segments (dot product)
            const prevLen = Math.sqrt(prevDx * prevDx + prevDy * prevDy);
            const nextLen = Math.sqrt(nextDx * nextDx + nextDy * nextDy);

            if (prevLen > 0 && nextLen > 0) {
              const dot = (prevDx * nextDx + prevDy * nextDy) / (prevLen * nextLen);
              // dot = 1 means straight line, dot = -1 means sharp turn
              // Reduce distance on curves (when dot < 1)
              const curveFactor = Math.max(0.7, dot); // Compress up to 30% on sharp turns
              tailDistance = BASE_TAIL_DISTANCE * curveFactor;
            }
          }

          // Apply spring force toward target, but maintain distance
          if (distance > 0) {
            const force = (distance - tailDistance) * SPRING_STRENGTH;
            const forceX = (dx / distance) * force;
            const forceY = (dy / distance) * force;

            // Update velocity
            segment.vx += forceX;
            segment.vy += forceY;
          }

          // Apply damping
          segment.vx *= DAMPING;
          segment.vy *= DAMPING;

          // Update position
          segment.x += segment.vx;
          segment.y += segment.vy;
        }

        // Check collisions
        for (let i = balls.length - 1; i >= 0; i--) {
          if (checkCollision(balls[i])) {
            eatBall(i);
          }
        }
      },
      render: () => {
        // Clear canvas
        context.fillStyle = "#ecf0f1";
        context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Draw grid
        context.strokeStyle = "#bdc3c7";
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
        context.lineWidth = 3;
        context.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Render tail segments
        tail.forEach((segment, index) => {
          // Color based on compression level
          if (segment.level === 0) {
            // Blue - regular segments
            context.fillStyle = "#3498db";
            context.strokeStyle = "#2980b9";
          } else if (segment.level === 1) {
            // Green - 100 blue segments
            context.fillStyle = "#27ae60";
            context.strokeStyle = "#229954";
          } else if (segment.level === 2) {
            // Yellow - 100 green segments (10,000 blues)
            context.fillStyle = "#f1c40f";
            context.strokeStyle = "#f39c12";
          }

          context.fillRect(segment.x, segment.y, TAIL_SIZE, TAIL_SIZE);

          // Draw outline
          context.lineWidth = 2;
          context.strokeRect(segment.x, segment.y, TAIL_SIZE, TAIL_SIZE);
        });

        // Render player
        player.render();

        // Draw player outline
        context.strokeStyle = "#000";
        context.lineWidth = 2;
        context.strokeRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

        // Render balls
        balls.forEach((ball) => {
          context.fillStyle = ball.sprite.color;
          context.beginPath();
          context.arc(ball.sprite.x, ball.sprite.y, ball.sprite.radius, 0, Math.PI * 2);
          context.fill();

          // Draw ball outline
          context.strokeStyle = "#c0392b";
          context.lineWidth = 2;
          context.stroke();
        });

        // Draw score
        context.fillStyle = "#2d3436";
        context.font = "16px Arial";
        context.fillText(`Score: ${score}`, 10, 25);
        context.fillText(`Length: ${tail.length}`, 10, 45);

        // Draw mute icon in top right corner
        const iconX = GAME_WIDTH - 30;
        const iconY = 10;
        const iconSize = 20;

        context.globalAlpha = 0.4;
        context.fillStyle = "#888";
        context.strokeStyle = "#888";
        context.lineWidth = 1.5;

        // Draw speaker
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
          // Draw sound waves
          context.beginPath();
          context.arc(iconX + 14, iconY + 10, 3, -Math.PI / 4, Math.PI / 4);
          context.stroke();
          context.beginPath();
          context.arc(iconX + 14, iconY + 10, 5, -Math.PI / 4, Math.PI / 4);
          context.stroke();
        } else {
          // Draw X over speaker
          context.lineWidth = 2;
          context.strokeStyle = "#c0392b";
          context.beginPath();
          context.moveTo(iconX + 1, iconY + 2);
          context.lineTo(iconX + iconSize - 2, iconY + iconSize - 2);
          context.moveTo(iconX + iconSize - 2, iconY + 2);
          context.lineTo(iconX + 1, iconY + iconSize - 2);
          context.stroke();
        }

        context.globalAlpha = 1.0;
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
      <Header forceReload={true} />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Snake
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Move your mouse to control the square and eat the red balls!
          </p>
        </div>

        <div ref={containerRef} className="flex flex-col items-center justify-center gap-4">
          <style jsx>{`
            canvas {
              touch-action: none;
            }
            div:fullscreen {
              width: 100vw;
              height: 100vh;
              padding: 0;
              margin: 0;
              background: #ecf0f1;
            }
            div:fullscreen canvas {
              width: 100vw !important;
              height: 100vh !important;
              border: none !important;
              border-radius: 0 !important;
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
