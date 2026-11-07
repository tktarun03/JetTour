/* Line icons (24px grid, stroke = currentColor). */
const Icon = (() => {
  const s = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;
  return {
    arrow: s('<path d="M7 17L17 7M9 7h8v8"/>'),
    back: s('<path d="M15 5l-7 7 7 7"/>'),
    prev: s('<path d="M14 6l-6 6 6 6"/>'),
    next: s('<path d="M10 6l6 6-6 6"/>'),
    plane: s('<path d="M21 15.5v-1.6l-8-4.9V4.2a1.4 1.4 0 0 0-2.8 0V9l-8 4.9v1.6l8-2.5v4.6l-2 1.5V21l3.4-1 3.4 1v-1.9l-2-1.5V13z"/>'),
    heart: s('<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/>'),
    heartFill: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/></svg>',
    compare: s('<path d="M5 20V10M12 20V4M19 20v-7"/>'),
    seat: s('<path d="M7 4c2 0 3 1 3.3 3l1 7H17a2 2 0 0 1 2 2v1H9.5a2 2 0 0 1-2-1.7L6 6.2C5.8 5 6.2 4 7 4zM9 17v3M17 17v3"/>'),
    grid: s('<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>'),
    floor: s('<rect x="4" y="3" width="16" height="18" rx="4"/><path d="M4 9h16M4 15h16M12 3v18"/>'),
    more: s('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    bag: s('<rect x="5" y="8" width="14" height="12" rx="2.5"/><path d="M9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8M9 12v4M15 12v4"/>'),
    users: s('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M16 5.2a3 3 0 0 1 0 5.6M17.5 14c1.7.6 2.7 2.3 3 5"/>'),
    sofa: s('<path d="M4 11V8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V11M3 12.5A1.5 1.5 0 0 1 6 12.5V15h12v-2.5a1.5 1.5 0 0 1 3 0V18H3zM5 18v2M19 18v2"/>'),
    check: s('<path d="M5 12.5l4.5 4.5L19 7.5"/>', ' stroke-width="3"'),
    menu: s('<path d="M5 8h14M5 12h14M5 16h9"/>'),
    trash: s('<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>'),
  };
})();
