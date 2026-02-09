/**
 * Vite plugin: serve city manifests at /manifests/city-:slug.json in development.
 * Matches Vercel rewrite so the same path works in dev and prod; avoids manifest
 * "Syntax Error" when the dev server would otherwise return HTML (SPA fallback).
 */
import type { Plugin } from 'vite';
export declare function manifestDevPlugin(): Plugin;
