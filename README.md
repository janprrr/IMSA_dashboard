
<div align="center">

# 🏁 IMSA Strategy Dashboard

### *Endurance racing data, reimagined as a clean and visual web experience.*

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js">
  <img src="https://img.shields.io/badge/Papa_Parse-2E7D32?style=for-the-badge" alt="Papa Parse">
</p>

<p align="center">
<img src="./tracker/img/hero-bg.jpg" alt="IMSA Strategy Dashboard hero image">
</p>

</div>

---

## Overview

**IMSA Strategy Dashboard** is a front-end application built to turn raw IMSA timing data into a cleaner, more readable and visually structured race analysis experience.

The project combines **season browsing**, **event selection**, **lap-based performance analysis**, **interactive charts**, and **circuit-specific presentation** into a single interface designed around the logic and identity of endurance racing.

This is not intended to feel like a spreadsheet viewer or a generic stats panel.  
The app is designed to feel closer to a **race-oriented analysis interface** built around event identity, clarity and visual structure.

---

## Why this project exists

IMSA race data is rich, detailed and technically useful — but in its raw form it is often difficult to explore comfortably.

This project was created to answer a simple question:

> **What would IMSA race data feel like if it were presented as a focused, visual, event-driven web application?**

The result is a dashboard that emphasizes:
- clean navigation
- race context
- strong visual hierarchy
- data readability
- motorsport-inspired UI decisions

---

## Main Experience

The application is split into two core views:

### Season Browser
The main page acts as a season-based race hub, allowing users to browse configured IMSA events through a visual card layout.

### Race Dashboard
Once a race is selected, the dashboard loads a dedicated event view with:
- race identity
- circuit visuals
- race summary data
- per-car performance blocks
- lap evolution charting
- structured event information

---

## What the application focuses on

- Multi-season IMSA race navigation
- Event-specific dashboards
- Best-lap analysis per car
- Lap-time evolution charts
- Race summary metrics
- Circuit information and branding
- Lightweight, fully static front-end architecture

---

## Design Direction

The visual identity of the project is intentionally built around a few core ideas:

- **Dark UI** inspired by motorsport broadcast and race telemetry tools
- **Compact information blocks** with high data density
- **Event-specific visuals** through logos and track layouts
- **Minimal but expressive accents** for classes and categories
- **Structured navigation** between season overview and race detail

The goal is to make the application feel **purpose-built for race exploration**, not like a generic admin dashboard with racing data inserted into it.

---

## Core Stack

This project is intentionally kept lightweight and transparent:

- **HTML5**
- **CSS3**
- **Vanilla JavaScript**
- **Papa Parse** for CSV parsing
- **Chart.js** for lap-time visualization

No framework is required, and no backend is necessary.

---

## Project Structure

```text
tracker/
├── index.html
├── dashboard.html
├── README.md
│
├── css/
│   ├── index.css
│   └── styles.css
│
├── js/
│   ├── index.js
│   └── dashboard.js
│
├── img/
│   ├── hero-bg.jpg
│   ├── layouts/
│   └── logo/
│
└── data/
