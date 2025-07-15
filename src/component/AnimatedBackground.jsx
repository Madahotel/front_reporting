import React from 'react';

const AnimatedBackground = ({ particles }) => {
  return (
    <>
      {/* Animated particles background */}
      {particles.map((particle) => {
        const IconComponent = particle.icon;
        return (
          <div
            key={particle.id}
            className="absolute animate-float opacity-10"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          >
            <IconComponent size={particle.size * 4} className="text-purple-400" />
          </div>
        );
      })}

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 via-violet-200/20 to-pink-200/20 animate-gradient-shift"></div>
    </>
  );
};

export default AnimatedBackground;