# DecideRight: Traveller Decision System
## Product Requirements Document (FINAL_PRD.md)

**Product**: HomeToGo Search Results Page (SRP) Decision Layer  

**Framework**: STEP (Situation · Target · Explore · Plan)

**Author**: Saurabh Chawda

**Status**: APPROVED & VERIFIED 

---

## 1️⃣ Clarifying Questions
Before scoping features, we clarify the corporate context and engineering/design constraints:
* **Are there any time/resources constraints?**  
  * **Timeline constraint**: A horizon of **2 quarters** to design, implement, and run user acceptance testing.
  * **Engineering/Performance constraint**: Page p99 latency must remain strictly **< 200ms**. The DecideRight UI components (like the AI Shortlist and badges) must load asynchronously and compile client-side using night-batch aggregates rather than real-time heavy database calls.
  * **Stack constraint**: The prototype must run purely on standard vanilla web technologies (HTML5, Vanilla CSS3, ES6 JavaScript) without external npm packages, compilers, or heavy server dependencies to ensure zero-setup portability.
* **Are we a startup or a large tech company (e.g. Google)?**  
  * **Context**: We are **HomeToGo**, a well-known, high-traffic marketplace aggregator for holiday rentals (behaving like a large tech company with mature search and inventory aggregation infrastructure). We do not own the rental inventory directly (aggregator model) but we control the search, ranking, badging, and trust layers.

---

## 2️⃣ Set a GOAL
We are improving a well-known, high-traffic marketplace product. Therefore, our target is not cold customer acquisition, but optimizing user session conversion on the Search Results Page (SRP).
* **Primary Goal**: **Increase SRP-to-booking conversions by +18%** within 2 quarters.
* **Secondary Goal**: **Increase user booking sessions** and prevent traveler bounce during search by reducing average time-to-shortlist by **25%** (down to ~3 minutes).
* **Goal Source**: Company strategy focusing on marketplace health and maximizing revenue margins from the existing traffic baseline.

---

## 3️⃣ Define Users
User segments are defined by travel planning activity and intent behavior, not by demographics or age ranges:
* **Segment A — The Multi-Guest Family Coordinator (Primary Focus & Target)**:  
  Stay-at-home parents or designated family group organizers coordinating multi-guest requirements, bed counts, and amenities like swimming pools or gardens. They browse 20+ listings, keep 5+ browser tabs open, and are highly prone to decision fatigue and abandonment. Targeting this segment yields the highest conversion lift.
* **Segment B — The Flex-Date Digital Nomad / Remote Professional**:  
  Young professionals booking mid-to-long term stays (e.g., "beach house with desk in July"). They rely on local price average indices, stable WiFi amenities, and look for off-peak "good deal" listings.
* **Segment C — The High-Urgency Weekend Getaway Booker**:  
  Travelers booking within 48–72 hours of check-in. They need instant booking confirmation and clear value badges (e.g., "Rare Find" or "Good Deal") to make rapid checkout decisions without detailed multi-property comparisons.

---

## 4️⃣ User Pain Points
Focusing on the primary target segment (**The Multi-Guest Family Coordinator**), we prioritize three key pain points:
* **Pain Point 1 — Choice Overload and "Tab Clutter"**:  
  Having to open 5+ different listing details in separate browser tabs to cross-reference prices, ratings, cleaning fees, and booking partners. This causes cognitive fatigue and high abandonment rates.
* **Pain Point 2 — Opaque Pricing and Lack of Value Validation**:  
  Prices are displayed as flat nightly rates with no context. Users cannot tell if a €149/night rate is a genuine deal or overpriced compared to the neighborhood average or historical stays, leading them to leave to check competitor sites.
* **Pain Point 3 — Intent Alignment & Search Capsule Friction**:  
  Standard search capsules (Where, When, Who) do not align listing displays with the group's intent without manual, tedious filter configuration. If dates or guest parameters change, the intent state gets out of sync.

---

## 5️⃣ Solutions
To solve the pain points of the Multi-Guest Family Coordinator, we implement the following three key solutions (two reasonable, one moonshot):

### Solution 1: Value Signal Badging with Math Tooltips (Reasonable - Solves Pain Point 2)
Surfaces a single high-trust contextual badge on listing cards based on nightly neighborhood averages and past stays:
* *Badges*: `Best Price Guarantee`, `Rare Find`, or `Good Deal`.
* *Hover Tooltips*: Hovering over a badge displays the exact math behind the value calculation (e.g., *"Average price for a 3-bedroom in Cala d'Or is €170/night. This listing is €135/night (20% savings)"*).
* *Returning Planner Integration*: If the traveler is a returning user, the badge highlights budget alignment (e.g., *"Cheaper than your 2025 stay"* or *"Matches your usual budget"*).

### Solution 2: Planner Workspace Comparison Drawer & Matrix (Reasonable - Solves Pain Point 1)
Eliminates tab overload by providing a persistent, interactive workspace:
* *Bottom Comparison Drawer*: Activating the wishlist heart icon on listing cards adds the property to a bottom comparison tray.
* *Side-by-Side Comparison Modal*: Displays wishlisted properties in a comparative table. It green-highlights the best metrics (`Best Rate`, `Top Rated`, `Cleanest`) and purple-highlights their preferred past booking channel (e.g., `Booking.com`), enabling an instant checkout decision.

### Solution 3: DecideRight AI Shortlist Widget (Moonshot - Solves Pain Point 1 & 3)
An inline assistant positioned at **Slot #2** of the results grid:
* *Top 3 Curated Matches*: Presents natural language reasoning explaining why these three fincas match the user's intent.
* *Custom Search Override*: An input box allows the traveler to type queries (e.g., *"Show me something quiet with a pool"*) to dynamically re-sort the shortlist and update the AI explanation.
* *Partner Tie-Breaker*: Softly blends listings from multiple partners (Vrbo, Booking.com, Tripadvisor) to maintain marketplace fairness while delivering guest value.

---

## 6️⃣ Prioritize Features
We prioritize features based on the **Impact (towards Goal) / Effort (Dev time) / Urgency (Time to market)** framework:

| Feature | Impact (Goal) | Effort (Dev) | Urgency (Market) | Priority |
| :--- | :---: | :---: | :---: | :---: |
| **Value Signal Badging (P1)** | High | Med | High | **P1** |
| **Planner Workspace Drawer (P2)** | High | Med | High | **P1** |
| **DecideRight AI Shortlist (P3)** | High | High | Med | **P2** |
| **Intent-Aware Banners (P4)** | Med | Med | Med | **P2** |

*Rationale*: Value Signal Badges (P1) and the Planner Workspace Drawer (P2) use existing pricing and wishlist events, delivering immediate conversion lift with minimal ML dependency. The DecideRight AI Shortlist (P3) acts as the moonshot differentiator for custom query refinement.

---

## 7️⃣ Measure Success
Metrics are divided into three distinct tiers to monitor execution and guard against regression:

### North Star Metric (The Goal)
* **SRP-to-booking conversion rate**: Target **+18%** lift in conversion within 2 quarters.

### Signposts (Engagement Indicators)
* **Decision Time**: Reduce average time-to-shortlist by **25%** (down to ~3 minutes).
* **Workspace Click-Through**: Percentage of users saving $\ge$ 2 properties and launching the side-by-side comparison modal.
* **Custom AI Queries**: Volume and repeat rate of custom searches within the AI Shortlist widget.

### "Do No Harm" Metrics (Marketplace Guardrails)
* **AOV Baseline Stability**: Active average order value (AOV) must remain within **+/- 2%** of the €184 baseline.
* **SLA Page Latency**: Page p99 latency must remain **< 200ms**. The AI Shortlist widget loads asynchronously in Slot #2 to prevent rendering blocks.
* **Partner Listing Share**: The shortlist tie-breaker applies soft constraints to blend listings across partners.
