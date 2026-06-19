# DecideRight: Traveller Decision System

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JS](https://img.shields.io/badge/ES6-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**DecideRight** is an AI-native decision engine designed for the **HomeToGo Search Results Page (SRP)** to mitigate traveler choice paralysis and increase confident conversions. By replacing overwhelming flat catalogs with context-aware badging, soft intent suggestions, interactive comparison workspaces, and inline AI shortlists, the system guides travelers from 4,000+ listings to a confident booking.

---

## 👥 User Personas & Activity Segments

Instead of generic demographic brackets, the system optimizes for three travel planning activities:
1. **The Multi-Guest Family Coordinator (Primary Target)**: Focuses on complex bedroom/bed configurations and family-friendly amenities (pool, garden). Highly prone to decision fatigue and "tab overload" while browsing 20+ properties.
2. **The Flex-Date Digital Nomad / Remote Professional**: Looks for mid-to-long term budget fits, local price indices, and workspace amenities.
3. **The High-Urgency Weekend Getaway Booker**: Relies on rapid value validation badges (e.g. "Rare Find", "Good Deal") to make immediate bookings within 48-72 hours of travel.

---

## 🚀 Key Features & Product Phases

### Phase 1: Value Signal Cards & Tooltips
Surfaces contextual, high-trust value badges (computed against neighborhood averages and past stays) with a strict UI rule of **maximum one badge** per card.
* **Best Price Guarantee**: Underpriced compared to direct competitor partner rates.
* **Rare Find**: High review score (>4.80) coupled with historically high occupancy rate (>95%).
* **Good Deal**: Pricing is at least 15% below neighborhood average.
* **Hover Tooltips**: Transparent, hover-triggered overlays displaying the exact mathematical calculations behind the value badges to build traveler trust.
* **Past Budget Badges**: Displays *"Cheaper than your 2025 stay"* or *"Matches your usual budget"* for returning planners.

### Phase 2: Intent-Aware Soft Suggestions
Infers traveler intent (Family, Romantic, Last-Minute, Returning) based on URL parameters, dates, and guest choices.
* **No Silent Filters**: Prompts the user with dismissible banners to apply intent-specific filters, preserving user control.
* **Asynchronous Re-ranking**: Adjusts listing weights dynamically (e.g. boosting properties with large gardens/pools for families or beachfronts for couples) client-side to maintain a 200ms page load SLA.
* **Personal Price Index**: Banners notify returning users of market changes since their last visit, offering a one-click past-budget filter.
* **Safety Switch**: Manual guest changes instantly demote inferred intent to prevent filter desynchronization.

### Phase 3: Planner Workspace Comparison Drawer
Provides an interactive comparison workspace for planners to eliminate tab overload.
* **Comparison Drawer**: Wishlisted properties accumulate in a sticky tray at the bottom of the screen.
* **Side-by-Side Matrix Modal**: Compares saved listings in a detailed table, green-highlighting the best metrics (Lowest Price, Highest Rating, Cleanest Score) and purple-highlighting preferred booking channels from their history.

### Phase 4: DecideRight AI Shortlist (Moonshot)
Surfaces a custom top-3 tray inline at **Slot #2** of the results grid, explaining its picks in natural language.
* **Partner Tie-Breaker**: Soft constraint blending that balances partner diversity with customer utility.
* **LLM Input Payload Optimization**: Strictly limits context tokens to a clean JSON structure containing only essential metadata, preventing API latency.
* **Custom Search Override**: Allows natural language queries (e.g. "quiet place with fireplace") that dynamically re-sort the shortlist and update the AI reason explanation.

---

## 📁 Repository Structure

```
├── index.html          # Main SRP layout, search capsule, simulation panel, and drawer/modal HTML
├── style.css           # Premium vanilla CSS styling, transitions, tooltips, and comparison drawer
├── app.js              # Business logic: re-ranking, tooltips, comparison modal, and search selectors
├── listings_data.js    # Mock inventory including prices, ratings, and partner comparisons
├── README.md           # Repository overview (This file)
└── USER_GUIDE.md       # Step-by-step simulator instructions
```

---

## ⚙️ Quick Start (Running Locally)

DecideRight is built purely with native web technology (HTML5, Vanilla CSS3, and ES6 JavaScript) and requires **no external compilers or build systems** to run.

### Option 1: Direct File Launch
Double-click `index.html` or drag it into any modern web browser (Chrome, Safari, Firefox, Edge).

### Option 2: Local HTTP Server (Recommended)
To run in a structured local development environment, launch a simple HTTP server in the repository root:

* **Using Node.js (npx)**:
  ```bash
  npx serve
  ```
* **Using Python**:
  ```bash
  python -m http.server 8000
  ```
Access the application at `http://localhost:8000` (or the port specified by the tool).

---

## 🧪 Simulation Framework
The repository features a **Prototype Simulator Control Panel** stuck to the top of the viewport. Use this panel to toggle traveler intents (Family, Romantic, Last-Minute, Returning) and watch the DecideRight engine recalculate badges, re-rank cards, update the AI Shortlist, display the optimized JSON context payload sent to the LLM, and log system activity.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
