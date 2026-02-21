/**
 * CHESS AD MANAGER - MAXIMUM REVENUE ADSTERRA INTEGRATION
 * Updated with real Adsterra keys and optimized refresh strategy
 */
(function() {
  'use strict';

  const AD_CONFIG = {
    enabled: true,

    // Social Bar (320x50 iframe format) - used for banners too
    socialBar: {
      key: '3c9f055fd8046f845bed29ef6eafcc5f',
      format: 'iframe',
      height: 50,
      width: 320,
      invokeUrl: 'https://closefracture.com/3c9f055fd8046f845bed29ef6eafcc5f/invoke.js'
    },

    // Popunder - high CPM, once per 24h
    popunder: {
      enabled: true,
      scriptUrl: 'https://closefracture.com/48/6e/a2/486ea29a9d33e6723ee0ce1d6e5ace21.js'
    },

    // Banner configs for footer/sidebar slots
    banner: {
      desktop: { key: '3c9f055fd8046f845bed29ef6eafcc5f', width: 320, height: 50 },
      mobile: { key: '3c9f055fd8046f845bed29ef6eafcc5f', width: 320, height: 50 },
      sidebar: { key: '3c9f055fd8046f845bed29ef6eafcc5f', width: 320, height: 50 }
    },

    // Interstitial
    interstitial: {
      key: '3c9f055fd8046f845bed29ef6eafcc5f',
      scriptUrl: 'https://closefracture.com/3c9f055fd8046f845bed29ef6eafcc5f/invoke.js'
    },

    // Rewarded
    rewarded: {
      key: '3c9f055fd8046f845bed29ef6eafcc5f',
      scriptUrl: 'https://closefracture.com/3c9f055fd8046f845bed29ef6eafcc5f/invoke.js'
    }
  };

  const POLICY_RULES = {
    SESSION_WARMUP_MS: 15 * 1000,
    BANNER_DELAY_MS: 10 * 1000,
    BANNER_REFRESH_INTERVAL_MS: 45 * 1000,     // Refresh every 45 seconds for more impressions
    SOCIAL_BAR_DELAY_MS: 20 * 1000,             // Social bar after 20s
    SOCIAL_BAR_REFRESH_MS: 60 * 1000,           // Refresh social bar every 60s

    GAMES_BEFORE_INTERSTITIAL: 2,
    MIN_INTERSTITIAL_INTERVAL_MS: 3 * 60 * 1000,

    INACTIVITY_TIMEOUT_MS: 120 * 1000,
    MAX_BANNER_REFRESHES_PER_SESSION: 100,
    MAX_INTERSTITIALS_PER_SESSION: 8,
    MAX_REWARDED_PER_SESSION: 15,

    POPUNDER_COOLDOWN_MS: 24 * 60 * 60 * 1000,
  };

  const sessionState = {
    id: 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9),
    startTime: Date.now(),
    lastActivityTime: Date.now(),
    isTabVisible: !document.hidden,
    isGameplayActive: false,

    bannerRefreshCount: 0,
    interstitialCount: 0,
    rewardedAdCount: 0,
    completedGames: 0,
    gamesSinceLastInterstitial: 0,

    lastInterstitialTime: 0,
    lastBannerRefreshTime: 0,
    bannerVisible: false,
    popunderShown: false,
    socialBarShown: false,

    bannerRefreshTimer: null,
    bannerDelayTimer: null,
    socialBarRefreshTimer: null,

    pendingReward: null,
    rewardedAdActive: false,
  };

  // Utility
  function getSessionAgeMs() { return Date.now() - sessionState.startTime; }
  function isSessionWarmedUp() { return getSessionAgeMs() >= POLICY_RULES.SESSION_WARMUP_MS; }
  function canShowBanner() { return getSessionAgeMs() >= POLICY_RULES.BANNER_DELAY_MS; }
  function isUserActive() { return (Date.now() - sessionState.lastActivityTime) < POLICY_RULES.INACTIVITY_TIMEOUT_MS; }
  function isMobile() { return window.innerWidth < 768; }
  function log(msg, data) { if (typeof console !== 'undefined') { data !== undefined ? console.log('[ChessAds]', msg, data) : console.log('[ChessAds]', msg); } }

  function getLastPopunderTime() { try { return parseInt(localStorage.getItem('chess_popunder_time') || '0'); } catch(e) { return 0; } }
  function setLastPopunderTime() { try { localStorage.setItem('chess_popunder_time', Date.now().toString()); } catch(e) {} }

  // Policy gates
  function canShowAds() {
    if (!AD_CONFIG.enabled) return false;
    if (!sessionState.isTabVisible) return false;
    if (sessionState.isGameplayActive) return false;
    if (!isSessionWarmedUp()) return false;
    return true;
  }

  function canRefreshBanner() {
    if (!canShowAds()) return false;
    if (!canShowBanner()) return false;
    if (!isUserActive()) return false;
    if (sessionState.bannerRefreshCount >= POLICY_RULES.MAX_BANNER_REFRESHES_PER_SESSION) return false;
    var timeSince = Date.now() - sessionState.lastBannerRefreshTime;
    if (timeSince < POLICY_RULES.BANNER_REFRESH_INTERVAL_MS * 0.9) return false;
    return true;
  }

  function canShowInterstitial() {
    if (!canShowAds()) return false;
    if (sessionState.interstitialCount >= POLICY_RULES.MAX_INTERSTITIALS_PER_SESSION) return false;
    var timeSince = Date.now() - sessionState.lastInterstitialTime;
    if (timeSince < POLICY_RULES.MIN_INTERSTITIAL_INTERVAL_MS) return false;
    return true;
  }

  function canShowRewarded() {
    if (!AD_CONFIG.enabled) return false;
    if (!sessionState.isTabVisible) return false;
    if (sessionState.rewardedAdActive) return false;
    if (sessionState.rewardedAdCount >= POLICY_RULES.MAX_REWARDED_PER_SESSION) return false;
    return true;
  }

  function canShowPopunder() {
    if (!AD_CONFIG.popunder.enabled) return false;
    if (sessionState.popunderShown) return false;
    var lastTime = getLastPopunderTime();
    if (Date.now() - lastTime < POLICY_RULES.POPUNDER_COOLDOWN_MS) return false;
    return true;
  }

  // Activity & Visibility
  function initActivityTracking() {
    ['mousemove','mousedown','keydown','touchstart','scroll','click'].forEach(function(ev) {
      document.addEventListener(ev, function() { sessionState.lastActivityTime = Date.now(); }, { passive: true });
    });
  }

  function initVisibilityTracking() {
    document.addEventListener('visibilitychange', function() {
      sessionState.isTabVisible = !document.hidden;
      if (document.hidden) { pauseAdTimers(); } else { resumeAdTimers(); }
    });
  }

  function pauseAdTimers() {
    if (sessionState.bannerRefreshTimer) { clearTimeout(sessionState.bannerRefreshTimer); sessionState.bannerRefreshTimer = null; }
    if (sessionState.socialBarRefreshTimer) { clearTimeout(sessionState.socialBarRefreshTimer); sessionState.socialBarRefreshTimer = null; }
  }

  function resumeAdTimers() {
    if (canShowBanner() && sessionState.bannerVisible) { scheduleBannerRefresh(); }
    if (sessionState.socialBarShown) { scheduleSocialBarRefresh(); }
  }

  // Banner Ad rendering via iframe
  function renderBannerAd(slotElement, config) {
    if (!slotElement || !config) return false;
    try {
      slotElement.innerHTML = '';
      var iframe = document.createElement('iframe');
      iframe.width = String(config.width);
      iframe.height = String(config.height);
      iframe.title = 'Advertisement';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('scrolling', 'no');
      iframe.style.cssText = 'border:0;display:block;overflow:hidden;max-width:100%';

      var atOpts = { key: config.key, format: 'iframe', height: config.height, width: config.width, params: {} };
      var invokeUrl = 'https://closefracture.com/' + config.key + '/invoke.js';

      iframe.srcdoc = '<!doctype html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;overflow:hidden;"><script>var atOptions=' + JSON.stringify(atOpts) + ';<\/script><script src="' + invokeUrl + '"><\/script></body></html>';
      slotElement.appendChild(iframe);
      return true;
    } catch(e) { log('Banner render error:', e); return false; }
  }

  function showBannerAds() {
    if (!canShowBanner()) return;
    var config = isMobile() ? AD_CONFIG.banner.mobile : AD_CONFIG.banner.desktop;
    var desktopSlot = document.getElementById('ad-slot-footer-desktop');
    var mobileSlot = document.getElementById('ad-slot-footer-mobile');
    var sidebarSlot = document.getElementById('ad-slot-sidebar');

    if (isMobile() && mobileSlot) {
      renderBannerAd(mobileSlot, config);
      mobileSlot.style.display = 'flex';
      if (desktopSlot) desktopSlot.style.display = 'none';
    } else if (desktopSlot) {
      renderBannerAd(desktopSlot, config);
      desktopSlot.style.display = 'flex';
      if (mobileSlot) mobileSlot.style.display = 'none';
    }

    if (sidebarSlot && !isMobile()) {
      renderBannerAd(sidebarSlot, AD_CONFIG.banner.sidebar);
      sidebarSlot.style.display = 'flex';
    }

    // Also render in any page-level ad slots
    document.querySelectorAll('[data-ad-slot]').forEach(function(slot) {
      if (!slot.dataset.adRendered) {
        renderBannerAd(slot, config);
        slot.dataset.adRendered = 'true';
      }
    });

    sessionState.bannerVisible = true;
    sessionState.bannerRefreshCount++;
    sessionState.lastBannerRefreshTime = Date.now();
    log('Banner displayed (refresh #' + sessionState.bannerRefreshCount + ')');
    scheduleBannerRefresh();
  }

  function refreshBannerAds() {
    // Reset rendered flags so slots get refreshed
    document.querySelectorAll('[data-ad-slot]').forEach(function(slot) {
      slot.dataset.adRendered = '';
    });
    if (!canRefreshBanner()) { scheduleBannerRefresh(); return; }
    showBannerAds();
  }

  function scheduleBannerRefresh() {
    if (sessionState.bannerRefreshTimer) clearTimeout(sessionState.bannerRefreshTimer);
    var variance = POLICY_RULES.BANNER_REFRESH_INTERVAL_MS * 0.1;
    var interval = POLICY_RULES.BANNER_REFRESH_INTERVAL_MS + (Math.random() * variance * 2 - variance);
    sessionState.bannerRefreshTimer = setTimeout(refreshBannerAds, interval);
  }

  function initBannerAds() {
    var delay = POLICY_RULES.BANNER_DELAY_MS - getSessionAgeMs();
    if (delay <= 0) { showBannerAds(); } else { sessionState.bannerDelayTimer = setTimeout(showBannerAds, delay); }
  }

  // Social Bar - auto refresh
  function initSocialBar() {
    if (!AD_CONFIG.enabled || !AD_CONFIG.socialBar.key) return;
    var delay = Math.max(0, POLICY_RULES.SOCIAL_BAR_DELAY_MS - getSessionAgeMs());
    setTimeout(function() { renderSocialBar(); }, delay);
  }

  function renderSocialBar() {
    if (sessionState.socialBarShown && !isUserActive()) return;
    try {
      // Create/refresh social bar container
      var container = document.getElementById('social-bar-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'social-bar-container';
        container.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9998;display:flex;justify-content:center;pointer-events:auto;';
        document.body.appendChild(container);
      }

      // Render via iframe for clean refresh
      container.innerHTML = '';
      var iframe = document.createElement('iframe');
      iframe.width = '320';
      iframe.height = '50';
      iframe.style.cssText = 'border:0;max-width:100%;display:block;';
      iframe.title = 'Social Bar Ad';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('scrolling', 'no');

      var atOpts = { key: AD_CONFIG.socialBar.key, format: 'iframe', height: 50, width: 320, params: {} };
      iframe.srcdoc = '<!doctype html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;overflow:hidden;"><script>var atOptions=' + JSON.stringify(atOpts) + ';<\/script><script src="' + AD_CONFIG.socialBar.invokeUrl + '"><\/script></body></html>';
      container.appendChild(iframe);

      sessionState.socialBarShown = true;
      log('Social bar rendered/refreshed');
      scheduleSocialBarRefresh();
    } catch(e) { log('Social bar error:', e); }
  }

  function scheduleSocialBarRefresh() {
    if (sessionState.socialBarRefreshTimer) clearTimeout(sessionState.socialBarRefreshTimer);
    sessionState.socialBarRefreshTimer = setTimeout(function() {
      if (sessionState.isTabVisible && isUserActive() && !sessionState.isGameplayActive) {
        renderSocialBar();
      } else {
        scheduleSocialBarRefresh();
      }
    }, POLICY_RULES.SOCIAL_BAR_REFRESH_MS);
  }

  // Popunder - once per 24h on first interaction
  function initPopunder() {
    if (!canShowPopunder()) return;
    var handleFirst = function(e) {
      if (sessionState.popunderShown) return;
      document.removeEventListener('click', handleFirst);
      document.removeEventListener('touchstart', handleFirst);
      try {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = AD_CONFIG.popunder.scriptUrl;
        document.head.appendChild(script);
        sessionState.popunderShown = true;
        setLastPopunderTime();
        log('Popunder triggered (immediate on interaction)');
      } catch(e) { log('Popunder error:', e); }
    };
    document.addEventListener('click', handleFirst);
    document.addEventListener('touchstart', handleFirst);
  }

  // Interstitial
  function showInterstitial() {
    if (!canShowInterstitial()) return false;
    try {
      window.dispatchEvent(new CustomEvent('chess:showInterstitial', {
        detail: { adKey: AD_CONFIG.interstitial.key, scriptUrl: AD_CONFIG.interstitial.scriptUrl }
      }));
      sessionState.interstitialCount++;
      sessionState.lastInterstitialTime = Date.now();
      sessionState.gamesSinceLastInterstitial = 0;
      log('Interstitial displayed (#' + sessionState.interstitialCount + ')');
      return true;
    } catch(e) { log('Interstitial error:', e); return false; }
  }

  // Rewarded
  function showRewardedAd(rewardType, callback) {
    if (!canShowRewarded()) { if (callback) callback(false); return false; }
    sessionState.rewardedAdActive = true;
    sessionState.pendingReward = { type: rewardType, callback: callback };
    try {
      window.dispatchEvent(new CustomEvent('chess:showRewardedAd', {
        detail: { rewardType: rewardType, adKey: AD_CONFIG.rewarded.key, scriptUrl: AD_CONFIG.rewarded.scriptUrl }
      }));
      log('Rewarded ad initiated for: ' + rewardType);
      return true;
    } catch(e) {
      sessionState.rewardedAdActive = false;
      sessionState.pendingReward = null;
      if (callback) callback(false);
      return false;
    }
  }

  function onRewardedAdComplete(success) {
    var pending = sessionState.pendingReward;
    sessionState.rewardedAdActive = false;
    sessionState.pendingReward = null;
    if (success) sessionState.rewardedAdCount++;
    if (pending && pending.callback) pending.callback(success);
    window.dispatchEvent(new CustomEvent('chess:rewardedAdResult', {
      detail: { success: success, rewardType: pending ? pending.type : null }
    }));
  }

  // Game tracking
  function onGameComplete() {
    sessionState.completedGames++;
    sessionState.gamesSinceLastInterstitial++;
    log('Game completed (' + sessionState.completedGames + ' total)');
    if (sessionState.gamesSinceLastInterstitial >= POLICY_RULES.GAMES_BEFORE_INTERSTITIAL) {
      setTimeout(showInterstitial, 1500);
    }
  }

  function setGameplayActive(active) {
    var wasActive = sessionState.isGameplayActive;
    sessionState.isGameplayActive = active;
    if (active && !wasActive) { pauseAdTimers(); log('Gameplay started - ads paused'); }
    else if (!active && wasActive) { resumeAdTimers(); log('Gameplay ended - ads resumed'); }
  }

  // Time-spent monetization: trigger extra ad impressions based on time
  function initTimeSpentMonetization() {
    // Every 2 minutes of active use, refresh all ads for extra impressions
    setInterval(function() {
      if (sessionState.isTabVisible && isUserActive() && !sessionState.isGameplayActive) {
        log('Time-spent refresh triggered');
        refreshBannerAds();
      }
    }, 120 * 1000);
  }

  // Init
  function initSession() {
    log('Initializing ad session');
    initActivityTracking();
    initVisibilityTracking();
    initBannerAds();
    initSocialBar();
    initPopunder();
    initTimeSpentMonetization();
    window.addEventListener('chess:gameComplete', onGameComplete);
  }

  function cleanup() {
    pauseAdTimers();
    if (sessionState.bannerDelayTimer) clearTimeout(sessionState.bannerDelayTimer);
  }

  // Public API
  window.ChessAdManager = {
    init: initSession,
    cleanup: cleanup,
    setGameplayActive: setGameplayActive,
    onGameComplete: onGameComplete,
    showRewardedAd: showRewardedAd,
    onRewardedAdComplete: onRewardedAdComplete,
    showInterstitial: showInterstitial,
    refreshBannerAds: refreshBannerAds,
    isReady: function() { return isSessionWarmedUp(); },
    canShowRewarded: canShowRewarded,
    canShowAds: function() { return canShowAds(); },
    getSessionState: function() {
      return {
        ageSeconds: Math.round(getSessionAgeMs() / 1000),
        bannerRefreshes: sessionState.bannerRefreshCount,
        interstitials: sessionState.interstitialCount,
        gamesPlayed: sessionState.completedGames
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSession);
  } else {
    setTimeout(initSession, 100);
  }
})();
