/**
 * Wonder Bread Animation Component
 * Animated background showing ingredients transforming into bread
 */

import React from 'react';
import './BreadAnimation.css';

const BreadAnimation = () => {
  return (
    <div className="bread-animation-container">
      {/* Stage 1: Flour particles */}
      <div className="animation-stage stage-1">
        <div className="flour-particle flour-1"></div>
        <div className="flour-particle flour-2"></div>
        <div className="flour-particle flour-3"></div>
        <div className="flour-particle flour-4"></div>
        <div className="flour-particle flour-5"></div>
      </div>

      {/* Stage 2: Water drops */}
      <div className="animation-stage stage-2">
        <div className="water-drop drop-1"></div>
        <div className="water-drop drop-2"></div>
        <div className="water-drop drop-3"></div>
      </div>

      {/* Stage 3: Yeast bubbles */}
      <div className="animation-stage stage-3">
        <div className="yeast-bubble bubble-1"></div>
        <div className="yeast-bubble bubble-2"></div>
        <div className="yeast-bubble bubble-3"></div>
        <div className="yeast-bubble bubble-4"></div>
        <div className="yeast-bubble bubble-5"></div>
        <div className="yeast-bubble bubble-6"></div>
      </div>

      {/* Stage 4: Dough forming */}
      <div className="animation-stage stage-4">
        <div className="dough-blob"></div>
      </div>

      {/* Stage 5: Kneading motion */}
      <div className="animation-stage stage-5">
        <div className="kneading-dough"></div>
      </div>

      {/* Stage 6: Rising dough */}
      <div className="animation-stage stage-6">
        <div className="rising-dough"></div>
      </div>

      {/* Stage 7: Oven glow */}
      <div className="animation-stage stage-7">
        <div className="oven-glow"></div>
        <div className="baking-loaf"></div>
      </div>

      {/* Stage 8: Final bread with steam */}
      <div className="animation-stage stage-8">
        <div className="final-bread">🍞</div>
        <div className="steam steam-1"></div>
        <div className="steam steam-2"></div>
        <div className="steam steam-3"></div>
      </div>
    </div>
  );
};

export default BreadAnimation;
