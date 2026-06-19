# DecideRight: User & Simulation Guide

This guide walks you through using, testing, and simulating the **DecideRight Traveller Decision System** prototype. 

---

## 🛠️ Step 1: Open the Prototype
1. Open the repository folder on your local machine.
2. Locate the [index.html](file:///c:/Users/saura/OneDrive/Desktop/LIVE%20PROTOTYPES/HomeToGo/index.html) file.
3. Open it in any modern web browser (e.g., Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari) by double-clicking it.

---

## ⚙️ Step 2: Understand the Interface
The prototype is divided into five key areas:
1. **Prototype Control Panel (Top Sticky Bar)**: Allows you to switch search scenarios/personas (Generic, Family, Romantic, Last-Minute, Returning), type custom destinations, select dates, and adjust guests.
2. **Search Capsule Header**: Styled like the official `hometogo.com` header. Clickable segments let you focus corresponding input fields. Features a simulated search action icon button.
3. **Search Results Page (Left Column)**: Renders the listing cards, value badges with hover tooltips, soft suggestion banners, and the inline AI Shortlist widget.
4. **DecideRight Sandbox Console (Right Column)**: Displays active metrics (Conversion Lift, Decision Time, and Active Average Order Value), the optimized LLM payload, and system log streams.
5. **Planner Workspace (Bottom Bar & Overlay Modal)**: Sticky comparison drawer that slides up when listings are wishlisted, opening a side-by-side comparison matrix.

---

## 🧪 Step 3: Run the Simulation Scenarios

### Scenario A: Search Capsule Interactivity (Where, When, Who)
1. Double-click the **Where** segment inside the Search Capsule header.
   * *Observe*: The console logs the focus action, and the browser automatically focuses and highlights the **Destination** text input in the control panel.
2. Type `Tuscany` in the Destination input.
   * *Observe*: The listings grid immediately filters to show only properties in Tuscany. The page heading updates to *"Holiday Rentals in Tuscany"*.
3. Click the **When** segment inside the Search Capsule.
   * *Observe*: The Date Inputs are focused. Change Check-in date to `2026-07-10` and Check-out to `2026-07-17`.
   * *Observe*: The Search Capsule updates its text to `"Jul 10 - Jul 17"`.
4. Click the **Who** segment inside the Search Capsule.
   * *Observe*: Guest count input is focused. Change value to `2` and select **Reset Simulation State** to return to default Mallorca search parameters.
5. Click the circular magnifying glass icon button on the right of the Search Capsule.
   * *Observe*: The button enters a 500ms spinning loading state `⌛`, runs a search query log, and refreshes search results.

---

### Scenario B: The Returning Planner / Flex-Date Nomad (Workspace Drawer)
1. In the control panel dropdown, select **Returning Planner (Past Stay: Mallorca 2025, €150/night)**.
2. Observe the following changes:
   * Parameter values load: Mallorca, 2 Guests, Check-in: `2026-07-15`, Checkout: `2026-07-22`.
   * A **Personal Price Index Banner** slides in: *"Welcome back, Saurabh! Average prices have increased by +8% since your stay in July 2025..."*
3. **Test the Personal Budget Filter**:
   * Click **Apply budget filter** on the banner.
   * *Observe*: The listings re-filter to show only properties within your historical budget (€135–€190), and the banner dismisses.
4. **Test Past Stay Badges**:
   * Look at **Villa Vista Mar**. It displays a blue badge: **Cheaper than your 2025 stay (15€ saved)**. Hover to read the comparison explanation tooltips.
   * Look at **Romantic Olive Grove Cottage**. It displays a purple badge: **Matches your usual budget**.
5. **Test 'Planner Workspace' Drawer (Side-by-Side Comparison)**:
   * Click the **Wishlist Heart Icon** on **Villa Vista Mar** and **Chic Marina Penthouse**.
   * *Observe*: The hearts turn solid pink. A bottom tray slides up: *"Planner Workspace (2 saved)"* showing thumbnails of the properties.
   * Click **Compare Side-by-Side** (enabled since $\ge$ 2 properties are saved).
   * *Observe*: A modal comparison matrix overlay opens comparing Price, Rating, Cleanliness, Partner, Amenities, and Badges.
   * *Observe*: The lowest price row is green-highlighted as `(Best Rate)`. Booking.com is highlighted in purple as `(Preferred Past Match)` since the user booked through them in 2025.
   * Click **Book via Booking.com** to simulate booking checkout, or click the **&times;** button to close the modal.
6. **Test Workspace Clearing**:
   * Click **Clear All** on the bottom drawer to clear all wishlisted properties, sliding the drawer back down.

---

### Scenario C: The Multi-Guest Family Coordinator (AI Shortlist)
1. In the dropdown, switch the scenario to **Family Vacation (4 Guests, Kid-Friendly, 2+ Beds)**.
2. Click **Apply family filters** on the banner.
3. Observe the inline **DecideRight AI Shortlist** widget appear at Slot #2 of the results grid, explaining why these 3 fincas are recommended.
4. Click on the first recommendation (**Villa Vista Mar**).
   * *Observe*: The page automatically scrolls to the listing card, avoiding header blockage, and the card border flashes in a coral-purple gradient for 2 seconds.
5. In the input box at the bottom of the widget, type `Show me something quiet near the beach` and press Enter.
   * *Observe*: The shortlist updates, and the pick reasoning text updates dynamically to show: *"Showing customized recommendations matching: "Show me something quiet near the beach"..."*.

---

## 📈 Metric & Guardrail Verification
Use the Sandbox Console to monitor:
* **Active AOV**: Baseline is **€184**. Applying filters shifts AOV. If AOV deviates beyond **+/- 2%** of the baseline (e.g. if the user only looks at cheap properties), the indicator turns orange/red, signaling potential marketplace cannibalization risk.
* **LLM Context Payload**: Shows the minimized JSON object sent to the LLM (containing only ID, price, ratings, amenities, partner) verifying latency is kept low.
