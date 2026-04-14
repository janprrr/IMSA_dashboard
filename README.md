# IMSA Strategy Dashboard

A lightweight, interactive web dashboard for exploring **IMSA WeatherTech SportsCar Championship** race data, including **season navigation**, **race selection**, **lap-time analysis**, **category-based filtering**, and **race-level statistics**.

This project currently supports multiple IMSA events across the **2025** and **2026** seasons, using official-style race lap and results data loaded from external CSV files.

---

## Overview

**IMSA Strategy Dashboard** is a front-end web application designed to make endurance racing data easier to browse and analyze.

The application provides:

- A **main season browser** with race cards grouped by year
- A **race dashboard** for individual events
- Per-car performance summaries based on lap timing data
- Dynamic class filtering depending on the categories present in each race
- Interactive lap-time charts
- Circuit information, race details, and local visual assets (logos and track layouts)

The project is built with **HTML, CSS, and vanilla JavaScript**, with no backend required.

---

## Key Features

### Season and Race Navigation
- Browse races by season
- Switch between **2025** and **2026**
- Preserve the selected season when navigating between the main page and the dashboard

### Race Dashboard
- Load race data dynamically using URL parameters
- Display the selected race title, circuit information, logo, and layout
- Show all participating cars with their best lap time

### Category-Based Filtering
- Filter entries by IMSA classes such as:
  - `GTP`
  - `LMP2`
  - `GTDPRO`
  - `GTD`
- Automatically hide unavailable class filters when a race does not include cars from that category

### Performance Insights
- Best lap per car
- Total number of cars
- Total number of laps
- Best lap of the race
- Car count per category

### Interactive Charts
- Open a lap-time evolution chart for any car
- Visualize lap consistency across the race
- Display charts using **Chart.js**

### Flexible Data Sources
- Race lap data and result data are loaded from remote CSV files
- Compatible with data hosted in external repositories
- Designed around IMSA race exports from CSV sources

### Local Visual Assets
- Circuit logos
- Track layout images
- Hero/background artwork
- Organized locally under the project’s `img/` directory

---

## Screens and Flow

### 1. Main Page
The home page acts as a **season and race selector**.

It includes:
- Season buttons
- Race cards
- “Coming soon” handling for races without configured CSV data
- Navigation to the detailed dashboard for each available race

### 2. Race Dashboard
Each race page is opened through query parameters and displays:
- Race title
- Circuit and event information
- Race statistics
- Class distribution
- Per-car cards
- Lap-time charts

---

## Tech Stack

- **HTML5**
- **CSS3**
- **Vanilla JavaScript**
- **[Papa Parse](https://www.papaparse.com/)** — CSV parsing
- **[Chart.js](https://www.chartjs.org/)** — lap-time visualization

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
│   │   └── png files of the track
│   │
│   └── logo/
│       └── png images of the race "logo"
│
└── data/
