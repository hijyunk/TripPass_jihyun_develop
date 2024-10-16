import React, { useEffect } from 'react';

const LottieAnimation = ({ isVisible }) => {
  useEffect(() => {
    if (!document.querySelector('script[src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const lottieStyle = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    player: {
      width: '2em'
    }
  };

  return (
    isVisible && (
      <div style={lottieStyle.container}>
        <lottie-player
          src="https://lottie.host/b965004f-dadf-40d1-9649-1cddad743ff0/lJP6n6ZEoh.json"
          background="transparent"
          speed="1"
          style={lottieStyle.player}
          loop
          autoplay
        ></lottie-player>
      </div>
    )
  );
};

export default LottieAnimation;