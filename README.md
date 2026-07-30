# 🎾 RC Tennis Tournament

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

A modern, mobile-responsive web application designed for social tennis clubs and tournament management. Easily generate balanced singles or rotating doubles fixtures, track individual player standings, and export high-resolution, Grand Slam-themed leaderboards as PNG graphics.

---

## ✨ Features

* **🎾 Flexible Match Formats:** Switch seamlessly between **Singles** and **Social Rotating Doubles** modes.
* **🔀 Smart Social Pairing:** Automatically generates fair, randomized doubles matches that rotate partners and balance court time across all players equally.
* **🔢 Custom Match Count:** Specify the exact number of matches you want to generate while ensuring balanced player distribution.
* **📊 Individual Leaderboards:** Tracks Played (P), Wins (W), Losses (L), and Win Percentage (Win %) per individual player.
* **🎨 Grand Slam Poster Export:**
  * **3 Iconic Themes:** Roland Garros (Clay), Wimbledon (Grass), and US Open (Hard Court).
  * **Customizable Graphics:** Edit tournament titles, date text, and upload custom club/tournament logos.
  * **Clean Layout:** Vertical stacked match cards prevent text truncation on any screen size.
  * **High-Res Export:** One-click 2x high-resolution PNG downloads powered by `html-to-image`.
* **💾 State Management & Persistence:**
  * **Auto-Save:** Automatic progress saving via `localStorage`.
  * **JSON Export/Import:** Save entire tournament states as downloadable `.json` files to resume on any device.

---

## 🛠️ Tech Stack

* **Frontend:** ReactJS (via Vite)
* **Styling:** Tailwind CSS (Modern pastel theme design system)
* **Icons:** [lucide-react](https://lucide.dev/)
* **PNG Generation:** [html-to-image](https://github.com/bubkoo/html-to-image)
* **Deployment:** Vercel

---

## 🚀 Quickstart Guide

### Prerequisites

Make sure you have **Node.js** (v18 or higher) installed on your machine.

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/reihandio/RC-Tennis-Tournament.git](https://github.com/reihandio/RC-Tennis-Tournament.git)
   cd RC-Tennis-Tournament
