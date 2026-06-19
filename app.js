// app.js
// DecideRight Traveller Decision System - Prototype Business Logic

document.addEventListener("DOMContentLoaded", () => {
  // Main state management
  const state = {
    currentIntent: "generic", // 'generic', 'family', 'romantic', 'lastminute', 'returning'
    appliedFilters: {
      destination: "Mallorca",
      checkin: "2026-07-15",
      checkout: "2026-07-22",
      guests: 2,
      minBedrooms: 0,
      kidFriendlyOnly: false,
      beachfrontOnly: false,
      budgetFilter: false // Segment C past budget match filter
    },
    shortlistOverride: "default", // 'default', 'quieter', 'beach', 'cheaper'
    shortlistOverrideText: "", // Custom reasoning query text
    wishlistedItems: [], // Segment C Compare drawer listings list
    dismissedBanners: new Set(),
    activeListings: [...listingsData]
  };

  // DOM Elements
  const intentSelect = document.getElementById("intent-scenario-select");
  const guestInput = document.getElementById("guest-count");
  const resetBtn = document.getElementById("reset-prototype-btn");
  const searchSummaryDisplay = document.getElementById("search-summary-display");
  const srpMainHeading = document.getElementById("srp-main-heading");
  const resultsCountText = document.getElementById("results-count");
  const listingsGrid = document.getElementById("listings-grid");
  const softSuggestionSection = document.getElementById("soft-suggestion-section");
  const llmPayloadDisplay = document.getElementById("llm-payload-display");
  const activityLog = document.getElementById("activity-log");
  
  // Console Metric Elements
  const conversionLiftValue = document.getElementById("metric-conversion-lift");
  const decisionTimeValue = document.getElementById("metric-decision-time");

  // Initial render
  init();

  function init() {
    setupEventListeners();
    processIntentChange("generic");
  }

  function setupEventListeners() {
    const destInput = document.getElementById("search-destination");
    const checkinInput = document.getElementById("search-checkin");
    const checkoutInput = document.getElementById("search-checkout");

    intentSelect.addEventListener("change", (e) => {
      processIntentChange(e.target.value);
    });

    destInput.addEventListener("input", (e) => {
      state.appliedFilters.destination = e.target.value.trim() || "Mallorca";
      logActivity(`[System] Destination query updated: "${state.appliedFilters.destination}"`, "system");
      
      // Update heading dynamically
      srpMainHeading.textContent = `Holiday Rentals in ${state.appliedFilters.destination}`;
      
      updateSearchSummary();
      evaluateAndRender();
    });

    checkinInput.addEventListener("change", (e) => {
      state.appliedFilters.checkin = e.target.value;
      logActivity(`[System] Check-in date set: ${state.appliedFilters.checkin}`, "system");
      updateSearchSummary();
      evaluateAndRender();
    });

    checkoutInput.addEventListener("change", (e) => {
      state.appliedFilters.checkout = e.target.value;
      logActivity(`[System] Check-out date set: ${state.appliedFilters.checkout}`, "system");
      updateSearchSummary();
      evaluateAndRender();
    });

    guestInput.addEventListener("change", (e) => {
      state.appliedFilters.guests = parseInt(e.target.value) || 2;
      logActivity(`[System] Guest count changed to ${state.appliedFilters.guests}`, "system");
      
      // Auto-demote to generic if user manually overrides guests away from scenario rules
      if (state.currentIntent === "family" && state.appliedFilters.guests !== 4) {
        state.currentIntent = "generic";
        intentSelect.value = "generic";
        srpMainHeading.textContent = `Holiday Rentals in ${state.appliedFilters.destination}`;
        logActivity("[Intent] Manual guest count override: Demoted to Generic Explorer.", "system");
      } else if (state.currentIntent === "romantic" && state.appliedFilters.guests !== 2) {
        state.currentIntent = "generic";
        intentSelect.value = "generic";
        srpMainHeading.textContent = `Holiday Rentals in ${state.appliedFilters.destination}`;
        logActivity("[Intent] Manual guest count override: Demoted to Generic Explorer.", "system");
      }

      updateSearchSummary();
      evaluateAndRender();
    });

    resetBtn.addEventListener("click", () => {
      intentSelect.value = "generic";
      guestInput.value = "2";
      destInput.value = "Mallorca";
      checkinInput.value = "2026-07-15";
      checkoutInput.value = "2026-07-22";
      state.currentIntent = "generic";
      state.appliedFilters = {
        destination: "Mallorca",
        checkin: "2026-07-15",
        checkout: "2026-07-22",
        guests: 2,
        minBedrooms: 0,
        kidFriendlyOnly: false,
        beachfrontOnly: false,
        budgetFilter: false
      };
      state.shortlistOverride = "default";
      state.shortlistOverrideText = "";
      state.wishlistedItems = [];
      state.dismissedBanners.clear();
      srpMainHeading.textContent = "Holiday Rentals in Mallorca";
      updateComparisonDrawer();
      logActivity("[System] Simulation state reset to baseline.", "system");
      processIntentChange("generic");
    });

    // Add click listeners to the capsule fields to focus the inputs (UAT interactive feedback)
    document.addEventListener("click", (e) => {
      const locationField = e.target.closest(".location-field");
      const datesField = e.target.closest(".dates-field");
      const guestsField = e.target.closest(".guests-field");
      const searchBtn = e.target.closest(".search-icon-btn");
      
      if (locationField) {
        logActivity("[System] Search capsule: Focused Destination field.", "system");
        destInput.focus();
        destInput.select();
      } else if (datesField) {
        logActivity("[System] Search capsule: Focused Date Pickers.", "system");
        checkinInput.focus();
      } else if (guestsField) {
        logActivity("[System] Search capsule: Focused Guest Selector.", "system");
        guestInput.focus();
        guestInput.select();
      } else if (searchBtn) {
        // Trigger a 500ms simulated search loading indicator
        logActivity("[System] Initiating search query...", "system");
        searchBtn.classList.add("loading");
        const originalContent = searchBtn.innerHTML;
        searchBtn.innerHTML = `<span style="font-size: 0.8rem; font-weight: bold; display: inline-block; animation: spin 1s infinite linear;">⌛</span>`;
        
        setTimeout(() => {
          searchBtn.classList.remove("loading");
          searchBtn.innerHTML = originalContent;
          logActivity("[System] Search completed successfully.", "system");
          evaluateAndRender();
        }, 500);
      }
    });

    // Bind Planner Workspace drawer modal controls
    const compareModal = document.getElementById("compare-modal");
    const openCompareBtn = document.getElementById("open-compare-btn");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const clearCompareBtn = document.getElementById("clear-compare-btn");

    openCompareBtn.addEventListener("click", () => {
      renderComparisonTable();
      compareModal.classList.remove("hidden");
      logActivity("[Workspace] Opened side-by-side comparison matrix", "system");
    });

    closeModalBtn.addEventListener("click", () => {
      compareModal.classList.add("hidden");
    });

    compareModal.addEventListener("click", (e) => {
      if (e.target === compareModal) {
        compareModal.classList.add("hidden");
      }
    });

    clearCompareBtn.addEventListener("click", () => {
      state.wishlistedItems = [];
      logActivity("[Workspace] Cleared comparison workspace", "system");
      updateComparisonDrawer();
      evaluateAndRender();
    });
  }

  // Handle scenario transitions
  function processIntentChange(scenario) {
    state.currentIntent = scenario;
    state.shortlistOverride = "default"; // reset shortlist refinement
    const destInput = document.getElementById("search-destination");

    logActivity(`[Intent] Inferred traveler profile: ${scenario.toUpperCase()}`, "intent");

    if (scenario === "family") {
      guestInput.value = "4";
      state.appliedFilters.guests = 4;
      srpMainHeading.textContent = `Family-Friendly Fincas in ${state.appliedFilters.destination}`;
      logActivity("[Intent] Triggered high-confidence profile: Family Stay", "intent");
    } else if (scenario === "romantic") {
      guestInput.value = "2";
      state.appliedFilters.guests = 2;
      srpMainHeading.textContent = `Romantic Retreats in ${state.appliedFilters.destination}`;
      logActivity("[Intent] Triggered high-confidence profile: Couple's Escape", "intent");
    } else if (scenario === "lastminute") {
      guestInput.value = "2";
      state.appliedFilters.guests = 2;
      srpMainHeading.textContent = `Available Rentals in ${state.appliedFilters.destination}`;
      logActivity("[Intent] Triggered profile: Last-Minute Booker", "intent");
    } else if (scenario === "returning") {
      guestInput.value = "2";
      state.appliedFilters.guests = 2;
      destInput.value = "Mallorca";
      state.appliedFilters.destination = "Mallorca";
      state.appliedFilters.budgetFilter = false;
      srpMainHeading.textContent = `Holiday Rentals in Mallorca`;
      logActivity("[Intent] Triggered profile: Returning Planner (Past stay: Mallorca 2025)", "intent");
    } else {
      guestInput.value = "2";
      state.appliedFilters.guests = 2;
      srpMainHeading.textContent = `Holiday Rentals in ${state.appliedFilters.destination}`;
    }

    updateSearchSummary();
    evaluateAndRender();
  }

  function formatDateString(str) {
    if (!str) return "Any dates";
    const date = new Date(str);
    if (isNaN(date.getTime())) return str;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }

  function updateSearchSummary() {
    const checkinFormatted = formatDateString(state.appliedFilters.checkin);
    const checkoutFormatted = formatDateString(state.appliedFilters.checkout);
    const dateText = (checkinFormatted !== "Any dates" && checkoutFormatted !== "Any dates")
      ? `${checkinFormatted} - ${checkoutFormatted}`
      : "Any dates";

    searchSummaryDisplay.innerHTML = `
      <div class="search-field location-field" title="Click to edit Destination">
        <span class="search-label">Where</span>
        <strong class="search-value">${state.appliedFilters.destination}</strong>
      </div>
      <div class="search-divider"></div>
      <div class="search-field dates-field" title="Click to edit Dates">
        <span class="search-label">When</span>
        <span class="search-value">${dateText}</span>
      </div>
      <div class="search-divider"></div>
      <div class="search-field guests-field" title="Click to edit Guests">
        <span class="search-label">Who</span>
        <span class="search-value">${state.appliedFilters.guests} guest${state.appliedFilters.guests > 1 ? 's' : ''}</span>
      </div>
      <button class="search-icon-btn" aria-label="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    `;
  }

  // Log activity in the mockup UI log console
  function logActivity(message, type = "system") {
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${message}`;
    activityLog.appendChild(entry);
    activityLog.scrollTop = activityLog.scrollHeight;
  }

  // Primary pipeline: Badges -> Intent Banner -> Re-rank -> Shortlist -> Render
  function evaluateAndRender() {
    // 1. Calculate Badges & Base Ranking
    let listings = [...listingsData];
    
    // Apply search filter by destination (case-insensitive)
    const searchDest = state.appliedFilters.destination.toLowerCase().trim();
    listings = listings.filter(item => item.destination.toLowerCase().includes(searchDest));
    
    // Apply budget filter (Segment C)
    if (state.appliedFilters.budgetFilter) {
      listings = listings.filter(item => item.price >= 135 && item.price <= 190);
    }
    
    // Apply basic search filter by guest capacity
    listings = listings.filter(item => item.maxGuests >= state.appliedFilters.guests);

    // Apply soft filters if user accepted them
    if (state.appliedFilters.minBedrooms > 0) {
      listings = listings.filter(item => item.bedrooms >= state.appliedFilters.minBedrooms);
    }
    if (state.appliedFilters.kidFriendlyOnly) {
      listings = listings.filter(item => item.amenities.includes("Kid-Friendly") || item.amenities.includes("Trampoline"));
    }
    if (state.appliedFilters.beachfrontOnly) {
      listings = listings.filter(item => item.amenities.includes("Beachfront") || item.amenities.includes("Sea View"));
    }

    // 2. Render Soft Suggestion Banner
    renderSoftSuggestionBanner();

    // 3. Re-rank based on Inferred Intent (Phase 2)
    listings = applyIntentReRanking(listings);
    state.activeListings = listings;

    // 4. Update listings count
    resultsCountText.textContent = `${listings.length} propert${listings.length === 1 ? 'y' : 'ies'} found`;

    // 5. Update Metrics (Conversion & Decision Time simulator)
    updateMetrics();

    // 6. Draw Grid
    renderListingsGrid(listings);
  }

  // Soft Suggestion Banner logic (Phase 2)
  function renderSoftSuggestionBanner() {
    // Check if user has already dismissed the banner for this specific intent in the session
    if (state.dismissedBanners.has(state.currentIntent) || state.currentIntent === "generic") {
      softSuggestionSection.innerHTML = "";
      return;
    }

    let bannerHTML = "";

    if (state.currentIntent === "family" && !state.appliedFilters.kidFriendlyOnly) {
      bannerHTML = `
        <div class="soft-suggestion-banner" id="family-suggestion-banner">
          <div class="banner-content">
            <svg class="banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <div class="banner-text">
              <h4>Traveling with family?</h4>
              <p>We've found properties with 2+ bedrooms, private pools, and child-safe features.</p>
            </div>
          </div>
          <div class="banner-actions">
            <button class="btn btn-apply-filters" id="apply-family-filters-btn">Apply family filters</button>
            <button class="btn btn-dismiss-banner" id="dismiss-family-banner-btn">Dismiss</button>
          </div>
        </div>
      `;
    } else if (state.currentIntent === "romantic" && !state.appliedFilters.beachfrontOnly) {
      bannerHTML = `
        <div class="soft-suggestion-banner" id="romantic-suggestion-banner">
          <div class="banner-content">
            <svg class="banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
            </svg>
            <div class="banner-text">
              <h4>Planning a romantic escape?</h4>
              <p>Consider viewing properties with ocean views or cozy terraces.</p>
            </div>
          </div>
          <div class="banner-actions">
            <button class="btn btn-apply-filters" id="apply-romantic-filters-btn">View romantic features</button>
            <button class="btn btn-dismiss-banner" id="dismiss-romantic-banner-btn">Dismiss</button>
          </div>
        </div>
      `;
    } else if (state.currentIntent === "lastminute") {
      bannerHTML = `
        <div class="soft-suggestion-banner" id="lastminute-suggestion-banner">
          <div class="banner-content">
            <svg class="banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <div class="banner-text">
              <h4>Urgent Stay Booking</h4>
              <p>Demand is high for Mallorca this weekend. View listings offering instant confirmation.</p>
            </div>
          </div>
          <div class="banner-actions">
            <button class="btn btn-dismiss-banner" id="dismiss-lastminute-banner-btn" style="border-color: var(--primary); color: var(--primary);">I understand</button>
          </div>
        </div>
      `;
    } else if (state.currentIntent === "returning" && !state.appliedFilters.budgetFilter) {
      bannerHTML = `
        <div class="soft-suggestion-banner" id="returning-suggestion-banner">
          <div class="banner-content">
            <svg class="banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <div class="banner-text">
              <h4>Welcome back, Saurabh!</h4>
              <p>Average prices in Mallorca have increased by <strong>+8%</strong> since your stay in July 2025. We found listings matching your historical budget (€140 - €190/night).</p>
            </div>
          </div>
          <div class="banner-actions">
            <button class="btn btn-apply-filters" id="apply-budget-filter-btn">Apply budget filter</button>
            <button class="btn btn-dismiss-banner" id="dismiss-returning-banner-btn">Dismiss</button>
          </div>
        </div>
      `;
    }

    softSuggestionSection.innerHTML = bannerHTML;

    // Attach button listeners
    const applyFamilyBtn = document.getElementById("apply-family-filters-btn");
    const dismissFamilyBtn = document.getElementById("dismiss-family-banner-btn");
    const applyRomanticBtn = document.getElementById("apply-romantic-filters-btn");
    const dismissRomanticBtn = document.getElementById("dismiss-romantic-banner-btn");
    const dismissLastminuteBtn = document.getElementById("dismiss-lastminute-banner-btn");

    if (applyFamilyBtn) {
      applyFamilyBtn.addEventListener("click", () => {
        state.appliedFilters.minBedrooms = 2;
        state.appliedFilters.kidFriendlyOnly = true;
        logActivity("[System] Applied family filters: Bedrooms >= 2, Kid-Friendly.", "system");
        evaluateAndRender();
      });
    }

    if (dismissFamilyBtn) {
      dismissFamilyBtn.addEventListener("click", () => {
        state.dismissedBanners.add("family");
        logActivity("[System] Family suggestion banner dismissed.", "system");
        evaluateAndRender();
      });
    }

    if (applyRomanticBtn) {
      applyRomanticBtn.addEventListener("click", () => {
        state.appliedFilters.beachfrontOnly = true;
        logActivity("[System] Applied romantic filters: Beachfront / Sea views.", "system");
        evaluateAndRender();
      });
    }

    if (dismissRomanticBtn) {
      dismissRomanticBtn.addEventListener("click", () => {
        state.dismissedBanners.add("romantic");
        logActivity("[System] Romantic suggestion banner dismissed.", "system");
        evaluateAndRender();
      });
    }

    if (dismissLastminuteBtn) {
      dismissLastminuteBtn.addEventListener("click", () => {
        state.dismissedBanners.add("lastminute");
        logActivity("[System] Last-minute suggestion banner dismissed.", "system");
        evaluateAndRender();
      });
    }

    const applyBudgetBtn = document.getElementById("apply-budget-filter-btn");
    const dismissReturningBtn = document.getElementById("dismiss-returning-banner-btn");

    if (applyBudgetBtn) {
      applyBudgetBtn.addEventListener("click", () => {
        state.appliedFilters.budgetFilter = true;
        logActivity("[System] Applied historical budget filter: €135 - €190/night.", "system");
        evaluateAndRender();
      });
    }

    if (dismissReturningBtn) {
      dismissReturningBtn.addEventListener("click", () => {
        state.dismissedBanners.add("returning");
        logActivity("[System] Returning Planner banner dismissed.", "system");
        evaluateAndRender();
      });
    }
  }

  // Dynamic Intent Re-ranking (Phase 2)
  function applyIntentReRanking(listings) {
    const listCopy = [...listings];

    if (state.currentIntent === "family") {
      // Sort by: Kid-Friendly amenities, bedrooms, rating, cleanliness
      return listCopy.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (a.amenities.includes("Kid-Friendly")) scoreA += 50;
        if (b.amenities.includes("Kid-Friendly")) scoreB += 50;
        if (a.amenities.includes("Trampoline")) scoreA += 30;
        if (b.amenities.includes("Trampoline")) scoreB += 30;

        scoreA += a.bedrooms * 10;
        scoreB += b.bedrooms * 10;

        scoreA += a.cleanlinessScore * 5;
        scoreB += b.cleanlinessScore * 5;

        return scoreB - scoreA;
      });
    } else if (state.currentIntent === "romantic") {
      // Sort by: Couples focus (maxGuests <= 2 or 4), scenic views, rating
      return listCopy.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Peak target capacity is 2 guests
        if (a.maxGuests === 2) scoreA += 40;
        if (b.maxGuests === 2) scoreB += 40;

        if (a.amenities.includes("Sea View")) scoreA += 30;
        if (b.amenities.includes("Sea View")) scoreB += 30;
        if (a.amenities.includes("Mountain View")) scoreA += 20;
        if (b.amenities.includes("Mountain View")) scoreB += 20;

        scoreA += a.rating * 20;
        scoreB += b.rating * 20;

        return scoreB - scoreA;
      });
    } else if (state.currentIntent === "lastminute") {
      // Sort by: lower price, higher rating, instant availability indicator (occupancy rate)
      return listCopy.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // In last-minute, we favor pricing and rating highly
        scoreA += (400 - a.price) * 0.5;
        scoreB += (400 - b.price) * 0.5;

        scoreA += a.rating * 10;
        scoreB += b.rating * 10;

        return scoreB - scoreA;
      });
    }

    // Default sorting (original order)
    return listCopy;
  }

  // Calculate Value Badges for each listing (Phase 1)
  function calculateValueBadge(item) {
    // Segment C Personal Badges for Returning Planner
    if (state.currentIntent === "returning") {
      // 1. Cheaper than past stay
      if (item.price < 150 && item.destination === "Mallorca") {
        return {
          type: "best-price", // styled blue
          text: `Cheaper than your 2025 stay (${150 - item.price}€ saved)`,
          tooltip: `Calculated dynamically: This listing is €${150 - item.price} cheaper than your previous €150 booking in Mallorca in July 2025.`,
          logText: `Past stay match: ID ${item.id} is cheaper than past stay.`
        };
      }
      
      // 2. Matches usual budget
      if (item.price >= 135 && item.price <= 190) {
        return {
          type: "rare-find", // styled purple
          text: "Matches your usual budget",
          tooltip: `Calculated dynamically: This listing fits within your €140–€180/night budget based on your booking history.`,
          logText: `Past stay match: ID ${item.id} fits usual budget.`
        };
      }
    }

    // Priority: Best Price Guarantee > Rare Find > Good Deal
 
    // 1. Best Price Guarantee
    if (item.price < item.partnerPriceOnCompetitor) {
      return {
        type: "best-price",
        text: `Best Price Guarantee (${item.partnerPriceOnCompetitor - item.price}€ cheaper)`,
        tooltip: `Calculated dynamically: This listing is €${item.partnerPriceOnCompetitor - item.price} cheaper on HomeToGo than on ${item.partner} directly.`,
        logText: `Best Price: ID ${item.id} is ${item.partnerPriceOnCompetitor - item.price}€ cheaper than competitor`
      };
    }
 
    // 2. Rare Find
    if (item.occupancyRate >= 0.95 && item.rating >= 4.8) {
      return {
        type: "rare-find",
        text: "Rare Find (95%+ booked)",
        tooltip: `Calculated dynamically: This property has a ${Math.round(item.occupancyRate*100)}% occupancy rate and a cleanliness rating of ${item.cleanlinessScore} stars.`,
        logText: `Rare Find: ID ${item.id} has ${Math.round(item.occupancyRate*100)}% occupancy and ${item.rating} rating`
      };
    }
 
    // 3. Good Deal
    const percentBelowAvg = Math.round(((item.averageNeighborhoodPrice - item.price) / item.averageNeighborhoodPrice) * 100);
    if (percentBelowAvg >= 15) {
      return {
        type: "good-deal",
        text: `${percentBelowAvg}% below average`,
        tooltip: `Calculated dynamically: The average price for a ${item.bedrooms}-bedroom property in ${item.neighborhood} is €${item.averageNeighborhoodPrice}/night. This property is €${item.price}/night (${percentBelowAvg}% savings).`,
        logText: `Good Deal: ID ${item.id} is ${percentBelowAvg}% below average for ${item.neighborhood}`
      };
    }
 
    return null;
  }

  // Draw the Grid and inject the AI Shortlist Widget in Slot #2
  function renderListingsGrid(listings) {
    listingsGrid.innerHTML = "";

    if (listings.length === 0) {
      listingsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: span 2; text-align: center; padding: 48px; background: white; border-radius: 12px; border: 1px solid var(--border);">
          <h3>No properties match your current filters</h3>
          <p style="color: var(--text-muted); margin-top: 8px;">Try clearing filters or resetting the simulation state.</p>
        </div>
      `;
      return;
    }

    listings.forEach((item, index) => {
      // In Phase 3: Inject the DecideRight AI Shortlist Widget at Slot #2 (index === 1)
      if (index === 1) {
        const shortlistHTML = generateShortlistWidgetHTML(listings);
        listingsGrid.innerHTML += shortlistHTML;
      }

      // Render standard listing card
      const isWishlisted = state.wishlistedItems.includes(item.id);
      const wishlistClass = isWishlisted ? "active" : "";
      const badge = calculateValueBadge(item);
      const badgeHTML = badge 
        ? `<span class="value-badge ${badge.type}">
            ${badge.type === 'best-price' ? '🏷️' : badge.type === 'rare-find' ? '✨' : '🔥'} ${badge.text}
            <span class="badge-tooltip">${badge.tooltip}</span>
           </span>`
        : "";
 
      const cardHTML = `
        <article class="listing-card" id="listing-card-${item.id}">
          <div class="card-img-wrapper">
            <img src="${item.images[0]}" alt="${item.title}">
            ${badgeHTML}
            <button class="wishlist-btn ${wishlistClass}" data-item-id="${item.id}" aria-label="Add to wishlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <span class="partner-tag">${item.partner}</span>
          </div>
          <div class="card-details">
            <div class="card-location-row">
              <span class="card-neighborhood">${item.neighborhood}</span>
              <div class="rating-pill">
                <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span class="rating-val">${item.rating.toFixed(2)}</span>
              </div>
            </div>
            <h3 class="card-title">${item.title}</h3>
            <div class="card-amenities">
              ${item.amenities.map(a => `<span class="amenity-chip">${a}</span>`).join("")}
            </div>
            <div class="card-footer">
              <div class="price-box">
                <span class="price-value">€${item.price}</span>
                <span class="price-sub">per night</span>
              </div>
              <span class="card-guests-beds">Fits ${item.maxGuests} guests &bull; ${item.bedrooms} bed${item.bedrooms > 1 ? 's' : ''}</span>
            </div>
          </div>
        </article>
      `;

      listingsGrid.innerHTML += cardHTML;
    });

    // Attach listeners for shortlist regeneration buttons
    attachShortlistListeners(listings);
  }

  // Phase 3: AI Shortlist HTML generator (incorporating Partner Tie-Breaker)
  function generateShortlistWidgetHTML(allListings) {
    // 1. Filter out candidate listings matching current filters
    let candidates = [...allListings];

    // Apply Shortlist Refinement filters (cheaper, quieter, beach focus)
    if (state.shortlistOverride === "quieter") {
      candidates.sort((a, b) => {
        const quietA = (a.neighborhood === "Sóller" || a.neighborhood === "Deià") ? 50 : 0;
        const quietB = (b.neighborhood === "Sóller" || b.neighborhood === "Deià") ? 50 : 0;
        return (quietB + b.rating * 10) - (quietA + a.rating * 10);
      });
    } else if (state.shortlistOverride === "beach") {
      candidates.sort((a, b) => {
        const beachA = (a.amenities.includes("Beachfront") || a.amenities.includes("Sea View")) ? 50 : 0;
        const beachB = (b.amenities.includes("Beachfront") || b.amenities.includes("Sea View")) ? 50 : 0;
        return beachB - beachA;
      });
    } else if (state.shortlistOverride === "cheaper") {
      candidates.sort((a, b) => a.price - b.price);
    }

    // 2. Perform Partner Tie-Breaker (Select Top 3 with partner diversity priority)
    const selected = [];
    const usedPartners = new Set();

    // Pass 1: Try to pick highest ranked listings while enforcing partner diversity
    for (let i = 0; i < candidates.length; i++) {
      const item = candidates[i];
      if (!usedPartners.has(item.partner)) {
        selected.push(item);
        usedPartners.add(item.partner);
      }
      if (selected.length === 3) break;
    }

    // Pass 2: If we don't have 3 unique partners, fill in with remaining best listings (soft constraint)
    if (selected.length < 3) {
      for (let i = 0; i < candidates.length; i++) {
        const item = candidates[i];
        if (!selected.includes(item)) {
          selected.push(item);
        }
        if (selected.length === 3) break;
      }
    }

    // 3. Generate Natural Language reasoning statement based on scenario & refinement
    let reasoning = "";
    if (state.shortlistOverrideText) {
      reasoning = `<strong>DecideRight AI Pick:</strong> Showing customized recommendations matching: <em>"${state.shortlistOverrideText}"</em>. We scanned local inventory and selected these top 3 properties matching your criteria, applying partner diversity tie-breakers to ensure checkout security.`;
    } else if (state.currentIntent === "family") {
      reasoning = `<strong>DecideRight AI Pick:</strong> We selected these 3 fincas because they all accommodate at least 6 guests, score above 4.70 for cleanliness, and feature dedicated kids' amenities (like pools and trampolines). We chose listings from multiple partners to guarantee the lowest booking fees.`;
      if (state.shortlistOverride === "quieter") {
        reasoning = `<strong>DecideRight AI Pick:</strong> Refined for quietness. These family properties are situated in peaceful mountainous regions (Sóller/Deià), away from highway corridors, retaining private play gardens.`;
      } else if (state.shortlistOverride === "beach") {
        reasoning = `<strong>DecideRight AI Pick:</strong> Refined for beach proximity. These family properties feature immediate seafront access or unblocked views of the coastline.`;
      } else if (state.shortlistOverride === "cheaper") {
        reasoning = `<strong>DecideRight AI Pick:</strong> Refined for budget. These offer the best value-for-money configuration without compromising our 4.5+ cleanliness threshold for families.`;
      }
    } else if (state.currentIntent === "romantic") {
      reasoning = `<strong>DecideRight AI Pick:</strong> We recommended these secluded rentals because they specialize in couple occupancies (max 2 guests), feature panoramic scenery (sea/mountain), and hold review scores above 4.88.`;
      if (state.shortlistOverride === "quieter") {
        reasoning = `<strong>DecideRight AI Pick:</strong> Secluded romantic spots. Located in rustic olive groves in Deià and Sóller, offering maximum privacy.`;
      } else if (state.shortlistOverride === "beach") {
        reasoning = `<strong>DecideRight AI Pick:</strong> Seaside romantic spots. Features waterfront terraces and private ocean balconies.`;
      } else if (state.shortlistOverride === "cheaper") {
        reasoning = `<strong>DecideRight AI Pick:</strong> Budget couple retreats. Under average neighborhood prices while preserving romantic terrace/fireplace features.`;
      }
    } else {
      // Generic/Last-minute
      reasoning = `<strong>DecideRight AI Pick:</strong> We analyzed Mallorca rentals to identify listing values. These 3 listings feature the highest combination of cleanliness ratings, price value indexes, and reliable partner connections.`;
      if (state.shortlistOverride === "quieter") {
        reasoning = `<strong>DecideRight AI Pick:</strong> Curated for quiet areas, prioritizing Soller valley listings with premium ratings.`;
      } else if (state.shortlistOverride === "beach") {
        reasoning = `<strong>DecideRight AI Pick:</strong> Selected for beach access and ocean views.`;
      } else if (state.shortlistOverride === "cheaper") {
        reasoning = `<strong>DecideRight AI Pick:</strong> Sorted by the absolute lowest night-rates matching your guest configuration.`;
      }
    }

    // 4. Update LLM context payload display (Optimized JSON context)
    updateLLMPayload(selected);

    // 5. Generate items HTML
    const itemsHTML = selected.map(item => {
      return `
        <div class="shortlist-item-card" data-target-id="listing-card-${item.id}">
          <h5>${item.title}</h5>
          <div class="shortlist-item-rating">
            <span style="color: hsl(45, 100%, 45%);">★</span> 
            <span>${item.rating.toFixed(2)} (${item.partner})</span>
          </div>
          <div class="shortlist-item-meta">
            <span style="color: var(--primary);">€${item.price}</span>
            <span style="font-size: 0.7rem; color: var(--text-muted);">${item.neighborhood}</span>
          </div>
        </div>
      `;
    }).join("");

    // Active button classes
    const act = state.shortlistOverride;

    return `
      <div class="decideright-shortlist-widget" id="ai-shortlist-widget">
        <div class="shortlist-header">
          <span class="shortlist-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            DecideRight AI Shortlist
          </span>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">Tailored recommendations</span>
        </div>

        <div class="shortlist-summary">
          ${reasoning}
        </div>

        <div class="shortlist-items">
          ${itemsHTML}
        </div>

        <div class="shortlist-controls">
          <span class="shortlist-controls-title">Refine Shortlist:</span>
          <div class="chips-row">
            <button class="chip-btn ${act === 'default' ? 'active' : ''}" data-refine="default">Default Match</button>
            <button class="chip-btn ${act === 'quieter' ? 'active' : ''}" data-refine="quieter">🤫 Quieter</button>
            <button class="chip-btn ${act === 'beach' ? 'active' : ''}" data-refine="beach">🏖️ Sea View</button>
            <button class="chip-btn ${act === 'cheaper' ? 'active' : ''}" data-refine="cheaper">💶 Lower Price</button>
          </div>
          <div class="custom-regenerate-input-row">
            <input type="text" id="custom-ai-input" placeholder="Or ask AI: e.g. 'Show me something with a mountain view'">
            <button class="btn btn-primary" id="custom-ai-btn" style="padding: 4px 12px; font-size: 0.75rem;">Ask</button>
          </div>
        </div>
      </div>
    `;
  }

  // Listeners for shortlist regeneration inside the widget
  function attachShortlistListeners(listings) {
    // Wishlist click handler
    // Wishlist click handler (FB-001 / Segment C compare drawer)
    const wishlistBtns = document.querySelectorAll(".wishlist-btn");
    wishlistBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const itemId = parseInt(btn.getAttribute("data-item-id"));
        const index = state.wishlistedItems.indexOf(itemId);
        
        if (index === -1) {
          state.wishlistedItems.push(itemId);
          btn.classList.add("active");
          logActivity(`[Wishlist] Saved listing ID ${itemId} to Planner Workspace`, "system");
        } else {
          state.wishlistedItems.splice(index, 1);
          btn.classList.remove("active");
          logActivity(`[Wishlist] Removed listing ID ${itemId} from Planner Workspace`, "system");
        }
        updateComparisonDrawer();
      });
    });

    // Offset scroll click handlers for shortlist items
    const shortlistCards = document.querySelectorAll(".shortlist-item-card");
    shortlistCards.forEach(card => {
      card.addEventListener("click", () => {
        const targetId = card.getAttribute("data-target-id");
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const headerHeight = 150; // accounting for sticky header & panel
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
          
          // Apply visual highlight flash (FB-001 Fix)
          targetElement.classList.add("highlight-flash");
          logActivity(`[Shortlist] Scrolled and highlighted card: ${targetId}`, "shortlist");
          
          // Remove class after animation finishes (2s)
          setTimeout(() => {
            targetElement.classList.remove("highlight-flash");
          }, 2000);
        }
      });
    });

    const chips = document.querySelectorAll(".chip-btn");
    chips.forEach(chip => {
      chip.addEventListener("click", (e) => {
        const refineType = e.target.getAttribute("data-refine");
        state.shortlistOverride = refineType;
        state.shortlistOverrideText = ""; // clear custom input on chip click
        logActivity(`[Shortlist] User refined shortlist: ${refineType.toUpperCase()}`, "shortlist");
        evaluateAndRender();
      });
    });

    const customBtn = document.getElementById("custom-ai-btn");
    const customInput = document.getElementById("custom-ai-input");
    
    if (customBtn && customInput) {
      customBtn.addEventListener("click", () => {
        const query = customInput.value.trim();
        if (!query) return;

        logActivity(`[Shortlist] Custom prompt query: "${query}"`, "shortlist");
        state.shortlistOverrideText = query; // Save custom query text for LLM pick explanation (FB-002 Fix)

        const qLower = query.toLowerCase();
        // Simple prompt parser for prototype demonstration
        if (qLower.includes("quiet") || qLower.includes("peaceful") || qLower.includes("silent")) {
          state.shortlistOverride = "quieter";
        } else if (qLower.includes("sea") || qLower.includes("beach") || qLower.includes("water") || qLower.includes("ocean")) {
          state.shortlistOverride = "beach";
        } else if (qLower.includes("cheap") || qLower.includes("low") || qLower.includes("budget") || qLower.includes("price")) {
          state.shortlistOverride = "cheaper";
        } else {
          // General fallback
          state.shortlistOverride = "default";
        }
        
        customInput.value = "";
        evaluateAndRender();
      });

      // Press Enter to trigger
      customInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          customBtn.click();
        }
      });
    }
  }

  // Update LLM payload in developer console (Phase 3 Optimization Check)
  function updateLLMPayload(selectedListings) {
    const payload = selectedListings.map(item => {
      return {
        id: item.id,
        price: item.price,
        rating: item.rating,
        cleanliness_score: item.cleanlinessScore,
        top_3_amenities: item.amenities.slice(0, 3),
        neighborhood: item.neighborhood,
        partner: item.partner
      };
    });

    llmPayloadDisplay.textContent = JSON.stringify(payload, null, 2);
  }

  // Update sandbox metrics based on prototype state
  function updateMetrics() {
    let lift = 0;
    let time = 4.2; // default average minutes

    // 1. Phase 1 impact: value cards
    lift += 5.2; // Badges loaded adds 5.2% conversion

    // 2. Phase 2 impact: Intent inference
    if (state.currentIntent !== "generic") {
      lift += 3.8; // Intent re-ranking increases relevance
      time -= 0.8;
    }

    // If soft suggestion filters applied
    if (state.appliedFilters.kidFriendlyOnly || state.appliedFilters.beachfrontOnly) {
      lift += 4.5;
      time -= 1.1;
    }

    // 3. Phase 3 impact: Shortlist engagement
    if (state.shortlistOverride !== "default") {
      lift += 5.0; // Refining shortlist demonstrates maximum engagement
      time -= 0.6;
    } else {
      lift += 3.0; // Shortlist visible adds 3% baseline
    }

    conversionLiftValue.textContent = `+${lift.toFixed(1)}%`;
    decisionTimeValue.textContent = `${time.toFixed(1)} min`;

    // 4. AOV Guardrail Metric Calculations
    const totalActivePrice = state.activeListings.reduce((sum, item) => sum + item.price, 0);
    const activeAOV = state.activeListings.length > 0 ? Math.round(totalActivePrice / state.activeListings.length) : 0;
    
    // Baseline AOV is €184 (average of all listings)
    const baselineAOV = 184;
    const aovDeviation = baselineAOV > 0 ? ((activeAOV - baselineAOV) / baselineAOV) * 100 : 0;
    
    const aovDisplay = document.getElementById("metric-active-aov");
    if (aovDisplay) {
      const deviationSign = aovDeviation >= 0 ? "+" : "";
      aovDisplay.innerHTML = `€${activeAOV} <span style="font-size: 0.75rem; color: ${Math.abs(aovDeviation) <= 2 ? 'var(--badge-deal-text)' : 'var(--primary)'}; font-weight: 600;">(${deviationSign}${aovDeviation.toFixed(1)}%)</span>`;
    }
  }

  // Segment C Comparison Workspace Drawing Operations
  function updateComparisonDrawer() {
    const drawer = document.getElementById("comparison-drawer");
    const countDisplay = document.getElementById("compare-count");
    const openBtn = document.getElementById("open-compare-btn");
    const drawerItems = document.getElementById("drawer-items");

    countDisplay.textContent = state.wishlistedItems.length;

    if (state.wishlistedItems.length > 0) {
      drawer.classList.remove("hidden");
    } else {
      drawer.classList.add("hidden");
    }

    if (state.wishlistedItems.length >= 2) {
      openBtn.removeAttribute("disabled");
      openBtn.style.opacity = "1";
    } else {
      openBtn.setAttribute("disabled", "true");
      openBtn.style.opacity = "0.6";
    }

    // Populate thumbnails
    drawerItems.innerHTML = state.wishlistedItems.map(id => {
      const item = listingsData.find(l => l.id === id);
      if (!item) return "";
      return `
        <div class="drawer-item-thumb" id="thumb-${item.id}">
          <img src="${item.images[0]}" alt="${item.title}">
          <button class="remove-thumb-btn" data-remove-id="${item.id}">&times;</button>
        </div>
      `;
    }).join("");

    // Bind click to remove thumb
    const removeBtns = drawerItems.querySelectorAll(".remove-thumb-btn");
    removeBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const removeId = parseInt(btn.getAttribute("data-remove-id"));
        const idx = state.wishlistedItems.indexOf(removeId);
        if (idx !== -1) {
          state.wishlistedItems.splice(idx, 1);
          logActivity(`[Wishlist] Removed property ID ${removeId} from workspace`, "system");
          updateComparisonDrawer();
          evaluateAndRender(); // Re-render grid to update heart visual state
        }
      });
    });
  }

  function renderComparisonTable() {
    const tableWrapper = document.getElementById("compare-table-wrapper");
    const items = state.wishlistedItems.map(id => listingsData.find(l => l.id === id)).filter(Boolean);

    if (items.length === 0) {
      tableWrapper.innerHTML = "<p>No listings selected for comparison.</p>";
      return;
    }

    const minPrice = Math.min(...items.map(i => i.price));
    const maxRating = Math.max(...items.map(i => i.rating));
    const maxCleanliness = Math.max(...items.map(i => i.cleanlinessScore));

    let tableHTML = `
      <table class="compare-table">
        <thead>
          <tr>
            <th>Workspace Criteria</th>
            ${items.map(item => `
              <th>
                <div class="compare-header-cell">
                  <img src="${item.images[0]}" alt="${item.title}">
                  <span>${item.title}</span>
                </div>
              </th>
            `).join("")}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nightly Price</td>
            ${items.map(item => {
              const isBest = item.price === minPrice;
              return `<td class="${isBest ? 'highlight-best' : ''}">€${item.price} ${isBest ? '(Best Rate)' : ''}</td>`;
            }).join("")}
          </tr>
          <tr>
            <td>Review Rating</td>
            ${items.map(item => {
              const isBest = item.rating === maxRating;
              return `<td class="${isBest ? 'highlight-best' : ''}">★ ${item.rating.toFixed(2)} ${isBest ? '(Top Rated)' : ''}</td>`;
            }).join("")}
          </tr>
          <tr>
            <td>Cleanliness Score</td>
            ${items.map(item => {
              const isBest = item.cleanlinessScore === maxCleanliness;
              return `<td class="${isBest ? 'highlight-best' : ''}">${item.cleanlinessScore.toFixed(2)} / 5.0 ${isBest ? '(Cleanest)' : ''}</td>`;
            }).join("")}
          </tr>
          <tr>
            <td>Booking Partner</td>
            ${items.map(item => {
              // Highlight if matches preferred past stays partner Booking.com
              const isPreferred = item.partner === "Booking.com";
              return `<td class="${isPreferred ? 'highlight-preferred' : ''}">
                ${item.partner} ${isPreferred ? '<br><span style="font-size: 0.65rem; font-weight:700;">(Preferred Past Match)</span>' : ''}
              </td>`;
            }).join("")}
          </tr>
          <tr>
            <td>Value Badge Info</td>
            ${items.map(item => {
              const badge = calculateValueBadge(item);
              return `<td>${badge ? `<span class="value-badge ${badge.type}">${badge.text}</span>` : 'Standard Rate'}</td>`;
            }).join("")}
          </tr>
          <tr>
            <td>Key Amenities</td>
            ${items.map(item => `
              <td>
                <div style="display:flex; flex-wrap:wrap; gap:4px; justify-content:center;">
                  ${item.amenities.slice(0,3).map(a => `<span class="amenity-chip" style="font-size: 0.7rem; padding: 2px 6px;">${a}</span>`).join("")}
                </div>
              </td>
            `).join("")}
          </tr>
          <tr>
            <td>Select Option</td>
            ${items.map(item => `
              <td>
                <button class="btn btn-primary" onclick="alert('Proceeding to checkout via ${item.partner}!');">Book via ${item.partner}</button>
              </td>
            `).join("")}
          </tr>
        </tbody>
      </table>
    `;

    tableWrapper.innerHTML = tableHTML;
  }
});
