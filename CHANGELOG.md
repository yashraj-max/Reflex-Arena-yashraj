# Changelog

All notable changes to this project. Versions follow [semantic versioning](docs/09-maintenance.md#drill-2-ship-a-versioned-update-10-min).
Add your own entries at the top when you ship!

## [1.0.0] - workshop release
### Added
- Simon Says reflex game: 15 rounds, 3 lives, traps, streak multipliers, rank titles
- Express + MongoDB backend that acts as referee (judging, scoring, anti-cheat timing checks)
- React + Vite frontend with mock mode, sounds, animations, keyboard support
- Theme system with 6 presets: classic, kitchen, space, cricket, hacker, my-theme
- Per-site leaderboards ("arenas") so many frontends can share one backend
- Optional stretch commands (hold, DON'T tap) behind `ENABLE_STRETCH`
- Handbook in `docs/`, referee unit tests, load-test script
