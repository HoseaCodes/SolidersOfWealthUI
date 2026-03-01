// src/components/GameEmbed.jsx
export default function GameEmbed() {
  return (
    <iframe
      src="/game/index.html"
      width="960"
      height="540"
      scrolling="no"
      style={{
        border: "none",
        outline: "none",
        display: "block",
        margin: "0 auto",
        overflow: "hidden",
      }}
      allowFullScreen
      title="Soldiers of Wealth"
    />
  );
}