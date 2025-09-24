import type { CallData, CallxConfig } from './NativeCallx';
export interface CallEventListeners {
    onIncomingCall?: (data: CallData) => void;
    onCallAnswered?: (data: CallData) => void;
    onCallDeclined?: (data: CallData) => void;
    onCallEnded?: (data: CallData) => void;
    onCallMissed?: (data: CallData) => void;
    onCallAnsweredElsewhere?: (data: CallData) => void;
    onTokenUpdated?: (data: {
        token: string;
    }) => void;
}
/**
 * CallxManager - Main class for managing incoming call functionality
 * Provides a high-level interface for handling call UI, FCM messages, and call events
 */
declare class CallxManager {
    private listeners;
    private subscriptions;
    private nativeEmitter?;
    /**
     * Initialize Callx with configuration only (no event listeners)
     * @param config Configuration object including triggers, fields, and app settings
     * @returns Promise that resolves when initialization is complete
     */
    initialize(config: CallxConfig | (CallxConfig & CallEventListeners)): Promise<void>;
    /**
     * Add event listener (EventEmitter pattern) - supports multiple listeners per event
     * @param event Event name to listen for
     * @param callback Callback function to execute when event occurs
     */
    on(event: keyof CallEventListeners, callback: (data: any) => void): void;
    /**
     * Remove specific event listener (EventEmitter pattern)
     * @param event Event name to remove listener from
     * @param callback Specific callback to remove (optional - removes all if not specified)
     */
    off(event: keyof CallEventListeners, callback?: (data: any) => void): void;
    /**
     * Remove all event listeners
     */
    removeAllListeners(): void;
    /**
     * Get total count of all listeners
     */
    private getTotalListenerCount;
    /**
     * Emit event (for testing or manual event emission)
     * @param event Event name to emit
     * @param data Data to pass to listeners
     */
    emit(event: keyof CallEventListeners, data: any): void;
    /**
     * Set multiple event listeners at once (internal use)
     * @param listeners Object containing multiple event listeners
     */
    private setEventListeners;
    /**
     * Initialize Callx with configuration and event listeners (backward compatibility)
     * @param config Configuration object including triggers, fields, event listeners, and app settings
     * @returns Promise that resolves when initialization is complete
     */
    initializeWithListeners(config: CallxConfig & CallEventListeners): Promise<void>;
    /**
     * Show incoming call screen
     */
    showIncomingCall(callData: CallData): Promise<void>;
    /**
     * End current call
     */
    endCall(callId: string): Promise<void>;
    /**
     * Answer incoming call
     */
    answerCall(callId: string): Promise<void>;
    /**
     * Decline incoming call
     */
    declineCall(callId: string): Promise<void>;
    /**
     * Handle FCM message - using any type for compatibility
     */
    handleFcmMessage(data: any): Promise<void>;
    private cleanupEventListeners;
    private attachNativeEventListeners;
    /**
     * Get current FCM token
     */
    getFCMToken(): Promise<string>;
    /**
     * Get current VoIP token (iOS only)
     */
    getVoIPToken(): Promise<string>;
    /**
     * Set field mapping for FCM data extraction
     */
    setFieldMapping(field: string, path: string, fallback?: string): Promise<void>;
    /**
     * Set trigger configuration
     */
    setTrigger(trigger: string, field: string, value: string): Promise<void>;
    /**
     * Get current active call
     */
    getCurrentCall(): Promise<CallData | null>;
    /**
     * Check if call is currently active
     */
    isCallActive(): Promise<boolean>;
    /**
     * Hide app from lock screen after call ends
     * Removes app from over lock screen and moves to background
     */
    hideFromLockScreen(): Promise<boolean>;
    /**
     * Move app to background (simulate home button press)
     */
    moveAppToBackground(): Promise<boolean>;
    /**
     * Handle token updates from native layer (FCM for Android, VoIP for iOS)
     */
    handleTokenUpdate(token: string): void;
    /**
     * Get current configuration for debugging
     */
    getConfiguration(): Promise<any>;
}
export declare const CallxInstance: CallxManager;
export default CallxInstance;
export declare const initialize: (config: CallxConfig & CallEventListeners) => Promise<void>;
//# sourceMappingURL=index.d.ts.map