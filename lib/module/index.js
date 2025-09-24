"use strict";

import Callx from "./NativeCallx.js";
import { Platform, NativeEventEmitter, NativeModules, DeviceEventEmitter } from 'react-native';
/**
 * CallxManager - Main class for managing incoming call functionality
 * Provides a high-level interface for handling call UI, FCM messages, and call events
 */
class CallxManager {
  listeners = {
    onIncomingCall: [],
    onCallAnswered: [],
    onCallDeclined: [],
    onCallEnded: [],
    onCallMissed: [],
    onCallAnsweredElsewhere: [],
    onTokenUpdated: []
  };
  subscriptions = [];
  /**
   * Initialize Callx with configuration only (no event listeners)
   * @param config Configuration object including triggers, fields, and app settings
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(config) {
    // Initialize native module with configuration
    await Callx.initialize(config);
    // If listener callbacks are present, wire them (back-compat convenience)
    const cfg = config;
    if (cfg.onIncomingCall || cfg.onCallAnswered || cfg.onCallDeclined || cfg.onCallEnded || cfg.onCallMissed || cfg.onCallAnsweredElsewhere || cfg.onTokenUpdated) {
      const listeners = {};
      if (cfg.onIncomingCall) listeners.onIncomingCall = cfg.onIncomingCall;
      if (cfg.onCallAnswered) listeners.onCallAnswered = cfg.onCallAnswered;
      if (cfg.onCallDeclined) listeners.onCallDeclined = cfg.onCallDeclined;
      if (cfg.onCallEnded) listeners.onCallEnded = cfg.onCallEnded;
      if (cfg.onCallMissed) listeners.onCallMissed = cfg.onCallMissed;
      if (cfg.onCallAnsweredElsewhere) listeners.onCallAnsweredElsewhere = cfg.onCallAnsweredElsewhere;
      if (cfg.onTokenUpdated) listeners.onTokenUpdated = cfg.onTokenUpdated;
      this.setEventListeners(listeners);
    }
  }

  /**
   * Add event listener (EventEmitter pattern) - supports multiple listeners per event
   * @param event Event name to listen for
   * @param callback Callback function to execute when event occurs
   */
  on(event, callback) {
    // Ensure the array exists
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    // Add the listener to the array
    this.listeners[event].push(callback);

    // Wire native events -> JS listeners if not already done
    if (this.subscriptions.length === 0) {
      this.attachNativeEventListeners();
    }
  }

  /**
   * Remove specific event listener (EventEmitter pattern)
   * @param event Event name to remove listener from
   * @param callback Specific callback to remove (optional - removes all if not specified)
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    if (callback) {
      // Remove specific callback
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    } else {
      // Remove all listeners for this event
      this.listeners[event] = [];
    }

    // Clean up subscriptions if no listeners remain
    if (this.getTotalListenerCount() === 0) {
      this.cleanupEventListeners();
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    Object.keys(this.listeners).forEach(event => {
      this.listeners[event] = [];
    });
    this.cleanupEventListeners();
  }

  /**
   * Get total count of all listeners
   */
  getTotalListenerCount() {
    return Object.values(this.listeners).reduce((total, callbacks) => {
      return total + (callbacks ? callbacks.length : 0);
    }, 0);
  }

  /**
   * Emit event (for testing or manual event emission)
   * @param event Event name to emit
   * @param data Data to pass to listeners
   */
  emit(event, data) {
    const callbacks = this.listeners[event];
    if (!callbacks) return;
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Set multiple event listeners at once (internal use)
   * @param listeners Object containing multiple event listeners
   */
  setEventListeners(listeners) {
    // Clear existing listeners first
    Object.keys(this.listeners).forEach(event => {
      this.listeners[event] = [];
    });

    // Add new listeners
    if (listeners.onIncomingCall) {
      if (!this.listeners.onIncomingCall) this.listeners.onIncomingCall = [];
      this.listeners.onIncomingCall.push(listeners.onIncomingCall);
    }
    if (listeners.onCallAnswered) {
      if (!this.listeners.onCallAnswered) this.listeners.onCallAnswered = [];
      this.listeners.onCallAnswered.push(listeners.onCallAnswered);
    }
    if (listeners.onCallDeclined) {
      if (!this.listeners.onCallDeclined) this.listeners.onCallDeclined = [];
      this.listeners.onCallDeclined.push(listeners.onCallDeclined);
    }
    if (listeners.onCallEnded) {
      if (!this.listeners.onCallEnded) this.listeners.onCallEnded = [];
      this.listeners.onCallEnded.push(listeners.onCallEnded);
    }
    if (listeners.onCallMissed) {
      if (!this.listeners.onCallMissed) this.listeners.onCallMissed = [];
      this.listeners.onCallMissed.push(listeners.onCallMissed);
    }
    if (listeners.onCallAnsweredElsewhere) {
      if (!this.listeners.onCallAnsweredElsewhere) this.listeners.onCallAnsweredElsewhere = [];
      this.listeners.onCallAnsweredElsewhere.push(listeners.onCallAnsweredElsewhere);
    }
    if (listeners.onTokenUpdated) {
      if (!this.listeners.onTokenUpdated) this.listeners.onTokenUpdated = [];
      this.listeners.onTokenUpdated.push(listeners.onTokenUpdated);
    }

    // Wire native events -> JS listeners
    this.attachNativeEventListeners();
  }

  /**
   * Initialize Callx with configuration and event listeners (backward compatibility)
   * @param config Configuration object including triggers, fields, event listeners, and app settings
   * @returns Promise that resolves when initialization is complete
   */
  async initializeWithListeners(config) {
    // Initialize native module first
    await this.initialize(config);

    // Then set event listeners if provided
    if (config.onIncomingCall || config.onCallAnswered || config.onCallDeclined || config.onCallEnded || config.onCallMissed || config.onCallAnsweredElsewhere || config.onTokenUpdated) {
      const listeners = {};
      if (config.onIncomingCall) listeners.onIncomingCall = config.onIncomingCall;
      if (config.onCallAnswered) listeners.onCallAnswered = config.onCallAnswered;
      if (config.onCallDeclined) listeners.onCallDeclined = config.onCallDeclined;
      if (config.onCallEnded) listeners.onCallEnded = config.onCallEnded;
      if (config.onCallMissed) listeners.onCallMissed = config.onCallMissed;
      if (config.onCallAnsweredElsewhere) listeners.onCallAnsweredElsewhere = config.onCallAnsweredElsewhere;
      if (config.onTokenUpdated) listeners.onTokenUpdated = config.onTokenUpdated;
      this.setEventListeners(listeners);
    }
  }

  /**
   * Show incoming call screen
   */
  async showIncomingCall(callData) {
    await Callx.showIncomingCall(callData);
    this.emit('onIncomingCall', callData);
  }

  /**
   * End current call
   */
  async endCall(callId) {
    await Callx.endCall(callId);
  }

  /**
   * Answer incoming call
   */
  async answerCall(callId) {
    await Callx.answerCall(callId);
  }

  /**
   * Decline incoming call
   */
  async declineCall(callId) {
    await Callx.declineCall(callId);
  }

  /**
   * Handle FCM message - using any type for compatibility
   */
  async handleFcmMessage(data) {
    await Callx.handleFcmMessage(data);
  }
  cleanupEventListeners() {
    // Clean up old subs
    this.subscriptions.forEach(s => s.remove());
    this.subscriptions = [];
  }
  attachNativeEventListeners() {
    // Clean up old subs first
    this.cleanupEventListeners();

    // iOS uses NativeEventEmitter; Android uses DeviceEventEmitter
    if (Platform.OS === 'ios') {
      const nativeCallxModule = NativeModules?.Callx;
      this.nativeEmitter = nativeCallxModule ? new NativeEventEmitter(nativeCallxModule) : undefined;
    } else {
      this.nativeEmitter = undefined;
    }
    const add = (event, handler) => {
      if (Platform.OS === 'ios' && this.nativeEmitter) {
        this.subscriptions.push(this.nativeEmitter.addListener(event, handler));
      } else {
        // Android
        // @ts-ignore React Native typing
        this.subscriptions.push(DeviceEventEmitter.addListener(event, handler));
      }
    };

    // Only add listeners for events that have callbacks
    if (this.listeners.onIncomingCall.length > 0) {
      add('onIncomingCall', d => this.emit('onIncomingCall', d));
    }
    if (this.listeners.onCallAnswered.length > 0) {
      add('onCallAnswered', d => this.emit('onCallAnswered', d));
    }
    if (this.listeners.onCallDeclined.length > 0) {
      add('onCallDeclined', d => this.emit('onCallDeclined', d));
    }
    if (this.listeners.onCallEnded.length > 0) {
      add('onCallEnded', d => this.emit('onCallEnded', d));
    }
    if (this.listeners.onCallMissed.length > 0) {
      add('onCallMissed', d => this.emit('onCallMissed', d));
    }
    if (this.listeners.onCallAnsweredElsewhere.length > 0) {
      add('onCallAnsweredElsewhere', d => this.emit('onCallAnsweredElsewhere', d));
    }
    if (this.listeners.onTokenUpdated.length > 0) {
      add('onTokenUpdated', d => this.emit('onTokenUpdated', d));
    }
  }

  /**
   * Get current FCM token
   */
  async getFCMToken() {
    return await Callx.getFCMToken();
  }

  /**
   * Get current VoIP token (iOS only)
   */
  async getVoIPToken() {
    return await Callx.getVoIPToken();
  }

  /**
   * Set field mapping for FCM data extraction
   */
  async setFieldMapping(field, path, fallback) {
    await Callx.setFieldMapping(field, path, fallback);
  }

  /**
   * Set trigger configuration
   */
  async setTrigger(trigger, field, value) {
    await Callx.setTrigger(trigger, field, value);
  }

  /**
   * Get current active call
   */
  async getCurrentCall() {
    return await Callx.getCurrentCall();
  }

  /**
   * Check if call is currently active
   */
  async isCallActive() {
    return await Callx.isCallActive();
  }

  /**
   * Hide app from lock screen after call ends
   * Removes app from over lock screen and moves to background
   */
  async hideFromLockScreen() {
    return await Callx.hideFromLockScreen();
  }

  /**
   * Move app to background (simulate home button press)
   */
  async moveAppToBackground() {
    return await Callx.moveAppToBackground();
  }

  /**
   * Handle token updates from native layer (FCM for Android, VoIP for iOS)
   */
  handleTokenUpdate(token) {
    this.emit('onTokenUpdated', {
      token
    });
  }

  /**
   * Get current configuration for debugging
   */
  async getConfiguration() {
    return await Callx.getConfiguration();
  }
}

// Export singleton instance
export const CallxInstance = new CallxManager();

// Default export
export default CallxInstance;

// Backward compatibility: alias the old initialize method
export const initialize = CallxInstance.initializeWithListeners.bind(CallxInstance);
//# sourceMappingURL=index.js.map