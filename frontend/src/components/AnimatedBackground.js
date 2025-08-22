import React from 'react';
import styled, { keyframes, css } from 'styled-components';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(-20px) rotate(240deg); }
`;

const float2 = keyframes`
  0%, 100% { transform: translateY(0px) rotate(360deg); }
  33% { transform: translateY(-40px) rotate(240deg); }
  66% { transform: translateY(-10px) rotate(120deg); }
`;

const float3 = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-25px) rotate(180deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  background: linear-gradient(
    -45deg,
    #667eea,
    #764ba2,
    #f093fb,
    #f5576c,
    #4facfe,
    #00f2fe
  );
  background-size: 400% 400%;
  animation: ${gradientShift} 15s ease infinite;
`;

const getAnimationForType = (animationType, duration) => {
  switch(animationType) {
    case 'float2': 
      return css`${float2} ${duration || '20s'} ease-in-out infinite`;
    case 'float3': 
      return css`${float3} ${duration || '25s'} ease-in-out infinite`;
    case 'pulse': 
      return css`${pulse} ${duration || '4s'} ease-in-out infinite`;
    default: 
      return css`${float} ${duration || '15s'} ease-in-out infinite`;
  }
};

const FloatingShape = styled.div`
  position: absolute;
  border-radius: 50%;
  background: ${props => props.gradient || 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3))'};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${props => getAnimationForType(props.animation, props.duration)};
  animation-delay: ${props => props.delay || '0s'};
`;

const ParticleContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const Particle = styled.div`
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: ${props => css`${float} ${props.duration || '10s'} linear infinite`};
  animation-delay: ${props => props.delay || '0s'};
`;

const GlowOrb = styled.div`
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, ${props => props.color || 'rgba(255, 255, 255, 0.1)'} 0%, transparent 70%);
  filter: blur(20px);
  animation: ${props => css`${pulse} ${props.duration || '8s'} ease-in-out infinite`};
  animation-delay: ${props => props.delay || '0s'};
`;

function AnimatedBackground() {
  // Generate random particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${8 + Math.random() * 12}s`
  }));

  return (
    <BackgroundContainer>
      {/* Large floating shapes */}
      <FloatingShape
        style={{
          width: '300px',
          height: '300px',
          top: '10%',
          left: '10%',
        }}
        gradient="linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(30, 144, 255, 0.15))"
        animation="float"
        duration="20s"
        delay="0s"
      />
      
      <FloatingShape
        style={{
          width: '200px',
          height: '200px',
          top: '60%',
          right: '15%',
        }}
        gradient="linear-gradient(135deg, rgba(255, 20, 147, 0.1), rgba(255, 165, 0, 0.15))"
        animation="float2"
        duration="25s"
        delay="5s"
      />

      <FloatingShape
        style={{
          width: '150px',
          height: '150px',
          top: '20%',
          right: '25%',
        }}
        gradient="linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.15))"
        animation="float3"
        duration="18s"
        delay="8s"
      />

      <FloatingShape
        style={{
          width: '250px',
          height: '250px',
          bottom: '10%',
          left: '20%',
        }}
        gradient="linear-gradient(135deg, rgba(50, 205, 50, 0.1), rgba(70, 130, 180, 0.15))"
        animation="pulse"
        duration="15s"
        delay="3s"
      />

      {/* Glowing orbs */}
      <GlowOrb
        style={{
          width: '400px',
          height: '400px',
          top: '30%',
          left: '40%',
        }}
        color="rgba(138, 43, 226, 0.05)"
        duration="12s"
        delay="0s"
      />

      <GlowOrb
        style={{
          width: '300px',
          height: '300px',
          bottom: '20%',
          right: '30%',
        }}
        color="rgba(255, 20, 147, 0.05)"
        duration="16s"
        delay="6s"
      />

      {/* Floating particles */}
      <ParticleContainer>
        {particles.map(particle => (
          <Particle
            key={particle.id}
            style={{
              left: particle.left,
              top: particle.top,
            }}
            delay={particle.delay}
            duration={particle.duration}
          />
        ))}
      </ParticleContainer>
    </BackgroundContainer>
  );
}

export default AnimatedBackground;