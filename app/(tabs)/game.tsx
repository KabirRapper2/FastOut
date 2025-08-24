import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Play, Pause, RotateCcw, Crown, Zap } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';

const { width: screenWidth } = Dimensions.get('window');
const GAME_WIDTH = screenWidth - 48;
const PADDLE_WIDTH = 80;
const BALL_SIZE = 16;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function GameScreen() {
  const { gameStats, updateGameStats, activateTemporaryPremium, isUserPremium } = useUserStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [paddleX, setPaddleX] = useState((GAME_WIDTH - PADDLE_WIDTH) / 2);
  const [ball, setBall] = useState<Ball>({
    x: GAME_WIDTH / 2,
    y: 300,
    vx: 3,
    vy: -3,
  });
  const [gameOver, setGameOver] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout>();
  const paddleOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(updateGame, 16);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver]);

  const updateGame = () => {
    setBall(prevBall => {
      let newBall = { ...prevBall };
      
      // Update position
      newBall.x += newBall.vx;
      newBall.y += newBall.vy;

      // Wall collisions
      if (newBall.x <= 0 || newBall.x >= GAME_WIDTH - BALL_SIZE) {
        newBall.vx = -newBall.vx;
      }
      if (newBall.y <= 0) {
        newBall.vy = -newBall.vy;
      }

      // Paddle collision
      if (
        newBall.y >= 400 - 20 &&
        newBall.y <= 400 &&
        newBall.x >= paddleX - BALL_SIZE &&
        newBall.x <= paddleX + PADDLE_WIDTH
      ) {
        newBall.vy = -Math.abs(newBall.vy);
        setScore(prev => prev + 10);
        
        // Add some randomness to make it more interesting
        const hitPosition = (newBall.x - paddleX) / PADDLE_WIDTH;
        newBall.vx = (hitPosition - 0.5) * 6;

        // Animate paddle hit
        Animated.sequence([
          Animated.timing(paddleOpacity, { toValue: 0.5, duration: 50, useNativeDriver: true }),
          Animated.timing(paddleOpacity, { toValue: 1, duration: 50, useNativeDriver: true }),
        ]).start();
      }

      // Game over condition
      if (newBall.y > 450) {
        setGameOver(true);
        setIsPlaying(false);
        endGame();
      }

      return newBall;
    });
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setPaddleX((GAME_WIDTH - PADDLE_WIDTH) / 2);
    setBall({
      x: GAME_WIDTH / 2,
      y: 300,
      vx: 3,
      vy: -3,
    });
  };

  const pauseGame = () => {
    setIsPlaying(false);
  };

  const resumeGame = () => {
    if (!gameOver) {
      setIsPlaying(true);
    }
  };

  const endGame = () => {
    updateGameStats(score);
    
    // Check for premium unlock (score >= 200)
    if (score >= 200 && !isUserPremium()) {
      activateTemporaryPremium(24); // 24 hours of premium access
      Alert.alert(
        '🎉 Premium Unlocked!',
        `Amazing score of ${score}! You've unlocked 24 hours of premium access. Enjoy all premium fasting protocols and workout types!`,
        [{ text: 'Awesome!' }]
      );
    } else if (score >= 100) {
      Alert.alert(
        '🏆 Great Score!',
        `Fantastic! You scored ${score} points. Reach 200+ to unlock temporary premium access!`,
        [{ text: 'Keep Playing!' }]
      );
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setScore(0);
    setPaddleX((GAME_WIDTH - PADDLE_WIDTH) / 2);
    setBall({
      x: GAME_WIDTH / 2,
      y: 300,
      vx: 3,
      vy: -3,
    });
  };

  const movePaddle = (direction: 'left' | 'right') => {
    setPaddleX(prev => {
      const newX = direction === 'left' ? prev - 20 : prev + 20;
      return Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, newX));
    });
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#111827']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Fitness Breakout</Text>
        <Text style={styles.subtitle}>Score 200+ to unlock premium features!</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Trophy size={20} color="#F59E0B" />
          <Text style={styles.statValue}>{score}</Text>
          <Text style={styles.statLabel}>Current Score</Text>
        </View>
        <View style={styles.statCard}>
          <Crown size={20} color="#8B5CF6" />
          <Text style={styles.statValue}>{gameStats.highScore}</Text>
          <Text style={styles.statLabel}>High Score</Text>
        </View>
        <View style={styles.statCard}>
          <Zap size={20} color="#10B981" />
          <Text style={styles.statValue}>{gameStats.premiumUnlocks}</Text>
          <Text style={styles.statLabel}>Premium Unlocks</Text>
        </View>
      </View>

      <View style={styles.gameContainer}>
        <View style={[styles.gameArea, { width: GAME_WIDTH }]}>
          {/* Ball */}
          <View
            style={[
              styles.ball,
              {
                left: ball.x,
                top: ball.y,
              },
            ]}
          />
          
          {/* Paddle */}
          <Animated.View
            style={[
              styles.paddle,
              {
                left: paddleX,
                opacity: paddleOpacity,
              },
            ]}
          />

          {/* Score display in game */}
          <Text style={styles.gameScore}>{score}</Text>

          {gameOver && (
            <View style={styles.gameOverOverlay}>
              <Text style={styles.gameOverText}>Game Over</Text>
              <Text style={styles.finalScore}>Final Score: {score}</Text>
              {score >= 200 && !isUserPremium() && (
                <Text style={styles.premiumUnlock}>🎉 Premium Unlocked!</Text>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => movePaddle('left')}
          disabled={!isPlaying}
        >
          <Text style={styles.controlButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.gameControls}>
          {!isPlaying && !gameOver && (
            <TouchableOpacity style={styles.playButton} onPress={startGame}>
              <Play size={24} color="white" />
            </TouchableOpacity>
          )}
          {!isPlaying && gameOver && (
            <TouchableOpacity style={styles.playButton} onPress={resetGame}>
              <RotateCcw size={24} color="white" />
            </TouchableOpacity>
          )}
          {isPlaying && (
            <TouchableOpacity style={styles.pauseButton} onPress={pauseGame}>
              <Pause size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => movePaddle('right')}
          disabled={!isPlaying}
        >
          <Text style={styles.controlButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to Unlock Premium</Text>
          <Text style={styles.infoText}>
            • Score 200+ points to unlock 24 hours of premium access{'\n'}
            • Premium includes advanced fasting protocols and workout types{'\n'}
            • Play multiple times to extend your premium access
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  gameContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  gameArea: {
    height: 450,
    backgroundColor: '#374151',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    backgroundColor: '#8B5CF6',
    borderRadius: BALL_SIZE / 2,
  },
  paddle: {
    position: 'absolute',
    bottom: 20,
    width: PADDLE_WIDTH,
    height: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  gameScore: {
    position: 'absolute',
    top: 20,
    left: 20,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  premiumUnlock: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  controlButton: {
    backgroundColor: '#374151',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  gameControls: {
    flexDirection: 'row',
    gap: 16,
  },
  playButton: {
    backgroundColor: '#10B981',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    paddingHorizontal: 24,
  },
  infoCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    lineHeight: 20,
  },
});