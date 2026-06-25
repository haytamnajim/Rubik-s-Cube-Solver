// Icônes SVG réutilisables (stroke = currentColor).
const S = (props) => ({ viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props });

export const IconCube = () => (
  <svg {...S({ fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinejoin: "round" })}>
    <path d="M12 2 21 7v10l-9 5-9-5V7z" /><path d="M12 2v20M3 7l9 5 9-5" />
  </svg>
);
export const IconCamera = () => (
  <svg {...S({ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinejoin: "round" })}>
    <path d="M3 7h3l2-2h8l2 2h3v12H3z" /><circle cx="12" cy="13" r="3.5" />
  </svg>
);
export const IconPencil = () => (
  <svg {...S({ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" })}>
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);
export const IconShuffle = () => (
  <svg {...S({ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" })}>
    <path d="M16 3h5v5M21 3 4 20M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </svg>
);
export const IconWand = () => (
  <svg {...S({ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" })}>
    <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" />
  </svg>
);
export const IconPlay = () => (<svg {...S({ fill: "currentColor" })}><path d="M8 5v14l10-7z" /></svg>);
export const IconPause = () => (<svg {...S({ fill: "currentColor" })}><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>);
export const IconPrev = () => (<svg {...S({ fill: "currentColor" })}><path d="M16 5v14l-10-7z" /></svg>);
export const IconNext = () => (<svg {...S({ fill: "currentColor" })}><path d="M8 5v14l10-7z" /></svg>);
export const IconRestart = () => (<svg {...S({ fill: "currentColor" })}><rect x="5" y="5" width="2.6" height="14" rx="1" /><path d="M20 5v14l-11-7z" /></svg>);
export const IconTrophy = () => (
  <svg {...S({ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" })}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 4H4v2a3 3 0 0 0 3 3M17 4h3v2a3 3 0 0 1-3 3" />
  </svg>
);
export const IconCheck = () => (<svg {...S({ fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" })}><path d="M20 6 9 17l-5-5" /></svg>);
export const IconAlert = () => (
  <svg {...S({ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" })}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" />
  </svg>
);
export const IconInfo = () => (<svg {...S({ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" })}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5h.01" /></svg>);
export const IconSpinner = () => (<svg className="spin" {...S({ fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round" })}><path d="M21 12a9 9 0 1 1-6.2-8.6" /></svg>);
export const IconFullscreen = () => (
  <svg {...S({ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" })}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);
export const IconGithub = () => (
  <svg {...S({ fill: "currentColor" })}>
    <path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1.8 1.8 2.6 1.3.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.3 18 4.6 18 4.6c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5A11.5 11.5 0 0 0 23.5 12C23.5 5.6 18.4.5 12 .5z" />
  </svg>
);
