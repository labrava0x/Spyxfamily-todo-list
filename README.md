# CLASSIFIED X DOSSIERS

> *"A spy must become anyone, yet remain no one."* — **Twilight / Loid Forger**

## 1. Synopsis

I had a grand vision for my first ever real to-do list, however I felt that I was not yet prepared for such a mission. I was naive for thinking that starting with something else would be simpler. This project is the one that has been stuck with me the longest, so now it is bittersweet seeing it finished. It feels as though this was my child that has grown, and is ready to be deployed into the world, yet I know I must let it be deployed, even if I want to keep holding it back. Will it be good enough?

This to-do list for The Odin Project submission follows the theme of *Spy x Family*—an anime/manga that I love. Please, for all stated purposes, consider this project as it is: a form of fanart. *Spy x Family* is created by Tatsuya Endo, and all rights to the original series and characters belong to the author and publisher.

A modular, *Spy x Family*-inspired mission and operation management web application built with vanilla JavaScript, Webpack, `date-fns`, and `localStorage` persistence.

What began as a project-based todo list evolved into a multi-page espionage workspace spanning **WISE HQ**, **SSS Bureau**, and **Comms Hub**, complete with voice dictation, scoped agency styling, and character-inspired UI accents.

## 2. Features

- **Operations & Mission Management:** Create and switch between operations/projects (with default support), dispatch missions with title, description, deadline, priority/threat level, field notes, attachments, and evidence images, inspect/edit details, toggle completion, filter by status, and delete missions.
- **Multi-Agency Workspace:** Dedicated views and styling across **WISE HQ**, **SSS Bureau**, and **Comms Hub** (including Board, Calendar, Prepare, Insights, Table Log, Dev, and Comms Relays views).
- **Voice Dictation:** Hands-free input support for mission form fields via the browser's `SpeechRecognition` API.
- **Local Persistence & Backups:** Automatic `localStorage` saving and loading with defensive fallbacks when storage is empty, plus JSON backup export and restore.
- **Signature Visual Identity:** Manila dossier cards, agency-scoped stylesheets, and a Yor Forger-inspired crimson headband, ribbon tails, and diagonal stiletto accent on the active agent banner.

## 3. Project Architecture

Application state and storage are separated from DOM rendering and event wiring:

- **Entry & Cover Flow (`src/index/index.js`, `src/cover.js`):** Boots the cover overlay, initializes layout and event listeners, and coordinates top-level rendering and backup actions.
- **State & Persistence (`src/storage.js`):** Manages operations/projects, missions, categories, automations, and comms configuration in `localStorage` with safe defaults when data is missing.
- **Layout & View Routing (`src/dom.controllers/layout.js`, `src/dom.controllers/dom.controller.js`):** Builds page shells, renders the agent codename badge and theme controls, and routes between active views.
- **Renderers & Event Listeners (`src/dom.controllers/board.renderer.js`, `src/views/*.js`, `src/dom.controllers/dossier.listeners.js`, `src/dom.controllers/global.listeners.js`):** Handles UI rendering, deadline formatting with `date-fns`, form/filter interactions, and voice dictation.
- **Scoped Stylesheets (`src/styles/style.css`, `src/styles/sss.css`, `src/styles/commhub.css`):** Keeps core dossier styles, SSS overrides, and Comms Hub styles isolated so view themes do not collide.

## 4.Tech Stack

- **Bundler:** Webpack
- **Language:** JavaScript (ES Modules)
- **Date Utilities:** `date-fns`
- **Browser APIs:** Web Storage (`localStorage`), Web Speech API (`SpeechRecognition`), `MutationObserver`

Until next x mission!