import React from "react";

const SOUP_EMOJIS = {
  egusi: "🟡",
  efo_riro: "🥬",
  ogbono: "🟤",
  ewedu: "🌿",
  gbegiri: "🫘",
  afang: "🍃",
  edikang_ikong: "🥗",
  banga: "🌴",
  oha: "🍀",
  bitter_leaf: "🌱",
};

export default function SoupCard({ soup, selected, onToggle }) {
  const emoji = SOUP_EMOJIS[soup.id] || "🍲";

  return (
    <div
      className={`soup-card ${selected ? "selected" : ""}`}
      onClick={() => onToggle(soup.id)}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onKeyDown={(e) => e.key === "Enter" && onToggle(soup.id)}
    >
      <div className="soup-card-emoji">{emoji}</div>
      <h3 className="soup-card-name">{soup.name}</h3>
      <p className="soup-card-desc">{soup.description}</p>
      <div className="soup-card-footer">
        <span className="soup-card-price">₦{soup.price.toLocaleString()}</span>
        {selected && <span className="soup-card-check">✓</span>}
      </div>
      <div className="soup-card-tags">
        {soup.tags.map((tag) => (
          <span key={tag} className="soup-tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
