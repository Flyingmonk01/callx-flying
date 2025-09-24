import type { TurboModule } from 'react-native';
export interface CallData {
    callId: string;
    callerName: string;
    callerPhone: string;
    callerAvatar?: string;
    hasVideo?: boolean;
    endReason?: string;
    timestamp?: number;
    originalPayload?: Object;
}
export interface TriggerConfigData {
    field: string;
    value: string;
}
export interface FieldConfigData {
    field: string;
    fallback?: string;
}
export interface FieldMappingConfig {
    path: string;
    fallback?: string;
}
export interface TriggerConfigEntry {
    field: string;
    value: string;
}
export interface CallxConfig {
    fieldMapping?: {
        [key: string]: FieldMappingConfig;
    };
    triggers?: {
        [key: string]: TriggerConfigEntry;
    };
}
export interface Spec extends TurboModule {
    initialize(config: CallxConfig): Promise<void>;
    showIncomingCall(callData: CallData): Promise<void>;
    endCall(callId: string): Promise<void>;
    answerCall(callId: string): Promise<void>;
    declineCall(callId: string): Promise<void>;
    getFCMToken(): Promise<string>;
    getVoIPToken(): Promise<string>;
    setFieldMapping(field: string, path: string, fallback?: string): Promise<void>;
    setTrigger(trigger: string, field: string, value: string): Promise<void>;
    getCurrentCall(): Promise<CallData | null>;
    isCallActive(): Promise<boolean>;
    handleFcmMessage(data: {
        [key: string]: string;
    }): Promise<void>;
    hideFromLockScreen(): Promise<boolean>;
    moveAppToBackground(): Promise<boolean>;
    getConfiguration(): Promise<any>;
}
export type CallEventListener = (callData: CallData) => void;
export type TokenEventListener = (tokenData: {
    token: string;
}) => void;
declare const _default: Spec;
export default _default;
//# sourceMappingURL=NativeCallx.d.ts.map