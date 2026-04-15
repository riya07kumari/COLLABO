# Collabo

A simple web-based real-time collaborative code editor where users can join as **editor** or **viewer**, using a shared session.

---

## Live Demo

Try it here: https://collabo-pjlq.onrender.com/

---

## Features

- Create a **new session**, generating a *Session ID* and *Password*.
- Join an existing session as an **Editor** (can edit code) or **Viewer** (read-only).
- Real-time sync: all participants see updates instantly.
- Lightweight, minimal UI with immediate usability.

---

## Project Structure

- `index.html` — Core interface for session creation and joining.
- `index.js` — Frontend logic for handling session creation, joining, and real-time updates.
- `worker.js` — Handles synchronization (e.g., via Web Workers or messaging).
- `package.json` / `package-lock.json` — Project metadata and dependencies.

---
