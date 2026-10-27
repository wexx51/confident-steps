'use strict';
/* Realistic phone frames (iPhone / Android) for the practice screens. */
(() => {
  /* Icons come from icons.js: Material Symbols (Android) and Ionicons (iOS), both open-licensed. */
  const api = { os: 'android' };
  const ic = (name, size = 24, os = api.os) => {
    const set = (window.CSIcons && window.CSIcons[os]) || {};
    const entry = set[name] || (window.CSIcons && window.CSIcons.android[name]);
    if (!entry) return '';
    return `<svg viewBox="${entry[0]}" width="${size}" height="${size}" fill="currentColor" aria-hidden="true" focusable="false">${entry[1]}</svg>`;
  };
  const sig = '<svg viewBox="0 0 18 12" width="17" height="11" aria-hidden="true"><g fill="currentColor"><rect y="8" width="3" height="4" rx=".8"/><rect x="5" y="5.4" width="3" height="6.6" rx=".8"/><rect x="10" y="2.8" width="3" height="9.2" rx=".8"/><rect x="15" width="3" height="12" rx=".8"/></g></svg>';
  const batt = '<svg viewBox="0 0 27 13" width="25" height="12" aria-hidden="true"><rect x=".5" y=".5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="19" height="9" rx="2.2" fill="currentColor"/><path d="M24 4.5v4c.9-.3 1.6-1.2 1.6-2s-.7-1.7-1.6-2z" fill="currentColor" opacity=".5"/></svg>';

  function frame(os, inner, o = {}) {
    const ios = os === 'ios';
    api.os = os;
    const status = `<span class="st-time">9:41</span><span class="st-icons">${ios ? sig + ic('wifi', 15, 'ios') : ic('wifi', 14, 'android') + sig}${batt}</span>`;
    return `<div class="phone-frame os-${os}" data-testid="phone-frame"><i class="hw hw1"></i><i class="hw hw2"></i><i class="hw hw3"></i><div class="phone-body"><i class="${ios ? 'ph-island' : 'ph-punch'}" aria-hidden="true"></i><div class="ph-status${o.dark ? ' dark' : ''}" aria-hidden="true">${status}</div><div class="ph-screen${o.home ? ' ph-home' : ''}">${inner}</div><i class="ph-pill${o.dark ? ' dark' : ''}" aria-hidden="true"></i></div></div>`;
  }
  function appBar(os, title, o = {}) {
    if (os === 'ios') return `<div class="nav nav-ios" aria-hidden="true"><span class="nb-back">${o.back === false ? '' : ic('back', 20)}<em>${o.back || ''}</em></span><strong>${title}</strong><span></span></div>`;
    return `<div class="nav nav-and"><span class="nb-back" aria-hidden="true">${o.back === false ? '' : ic('back', 24)}</span><strong>${title}</strong></div>`;
  }
  api.ic = ic; api.frame = frame; api.appBar = appBar;
  window.CSPhone = api;
})();
