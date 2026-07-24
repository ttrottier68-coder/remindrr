// Tiny inline icons used by SettingsPage and its sub-components.
// Centralized here so they can be shared cleanly across the split pages.

import React from 'react';

const baseProps = { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 } as const;

export const BackIcon = () => <svg className="w-4 h-4" {...baseProps}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
export const SaveIcon = () => <svg className="w-4 h-4" {...baseProps}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
export const CheckIcon = () => <svg className="w-4 h-4" {...{ ...baseProps, strokeWidth: 2.5 }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
export const AlertIcon = () => <svg className="w-4 h-4" {...baseProps}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
export const ChevronIcon = ({ open }: { open: boolean }) => <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} {...baseProps}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
