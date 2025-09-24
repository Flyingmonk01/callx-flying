package com.callx

import android.app.NotificationManager
import android.content.Context
import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject
import android.content.Intent
import java.util.UUID

/**
 * Native Firebase Messaging Service
 * Handles FCM messages directly in native code without JS bundle
 */
class CallxFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "CallxFCMService"
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
                Log.d(TAG, "FCM message received in native service")
        Log.d(TAG, "From: ${remoteMessage.from}")
        
        try {
            // Convert FCM data to JSON
            val fcmData = JSONObject()
            for ((key, value) in remoteMessage.data) {
                fcmData.put(key, value)
            }
            
            // Load configuration from persisted SharedPreferences (set by JS initialize)
            val config = loadConfigurationFromPrefs()
            if (config != null) {
                processFcmMessage(fcmData, config)
            } else {
                Log.w(TAG, "No configuration available, skipping FCM processing")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Error processing FCM message", e)
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "📱 New FCM token: $token")
        
        // Send token to JS layer through CallxModule if available
        try {
            val callxModule = CallxModule.getInstance()
            if (callxModule != null) {
                // CallxModule will handle sending to JS layer
                Log.d(TAG, "📱 FCM token will be available through CallxModule")
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to send FCM token to JS layer: ${e.message}")
        }
    }

    private fun loadConfigurationFromPrefs(): CallxConfiguration? {
        return try {
            val json = CallxStorage.getConfiguration(applicationContext)
            if (json == null) {
                Log.w(TAG, "No persisted configuration found; using defaults")
                CallxConfiguration()
            } else {
                val app = json.optJSONObject("app")
                val appConfig = AppConfig(
                    showOverLockscreen = app?.optBoolean("showOverLockscreen", true) ?: true,
                    requireUnlock = app?.optBoolean("requireUnlock", false) ?: false,
                    supportsVideo = app?.optBoolean("supportsVideo", false) ?: false,
                    enabledLogPhoneCall = app?.optBoolean("enabledLogPhoneCall", true) ?: true
                )

                val triggersObj = json.optJSONObject("triggers")
                val triggers = mutableMapOf<String, TriggerConfig>()
                if (triggersObj != null) {
                    val keys = triggersObj.keys()
                    while (keys.hasNext()) {
                        val key = keys.next()
                        val t = triggersObj.optJSONObject(key) ?: continue
                        triggers[key] = TriggerConfig(t.optString("field", ""), t.optString("value", ""))
                    }
                }

                val fieldsObj = json.optJSONObject("fields")
                val fields = mutableMapOf<String, FieldConfig>()
                if (fieldsObj != null) {
                    val keys = fieldsObj.keys()
                    while (keys.hasNext()) {
                        val key = keys.next()
                        val f = fieldsObj.optJSONObject(key) ?: continue
                        fields[key] = FieldConfig(
                            f.optString("field", ""),
                            if (f.isNull("fallback")) null else f.optString("fallback", null)
                        )
                    }
                }

                CallxConfiguration(
                    app = appConfig,
                    triggers = if (triggers.isNotEmpty()) triggers else CallxConfiguration().triggers,
                    fields = if (fields.isNotEmpty()) fields else CallxConfiguration().fields,
                    notification = NotificationConfig(
                        channelId = "callx_incoming_calls_v2",
                        channelName = "Incoming Calls",
                        channelDescription = "Incoming call notifications with ringtone",
                        importance = "high",
                        sound = "default"
                    )
                )
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to load config from prefs: ${e.message}")
            CallxConfiguration()
        }
    }

    private fun processFcmMessage(fcmData: JSONObject, config: CallxConfiguration) {
        Log.d(TAG, "Processing FCM data")
        
        val callData = extractCallDataFromFcm(fcmData, config)
        if (callData != null) {
            val triggerType = detectTriggerType(fcmData, config)
            Log.d(TAG, "Detected trigger: $triggerType")
            
            when (triggerType) {
                "incoming" -> {
                    Log.d(TAG, "Showing incoming call notification")
                    showIncomingCallNotification(callData, config, fcmData)
                }
                "ended" -> {
                    Log.d(TAG, "Handling call ended")
                    dismissIncomingCallNotification()
                    val module = CallxModule.getInstance()
                    if (module != null) {
                        module.notifyEndedFromService(callData, fcmData)
                    } else {
                        try {
                            CallxStorage.savePendingAction(applicationContext, "end", callData)
                        } catch (_: Exception) {}
                    }
                }
                "missed" -> {
                    Log.d(TAG, "Handling missed call")
                    val module = CallxModule.getInstance()
                    if (module != null) {
                        try {
                            val closeIntent = Intent(applicationContext, IncomingCallActivity::class.java).apply {
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                                putExtra("action", "dismiss")
                                putExtra(IncomingCallActivity.EXTRA_CALL_ID, callData.callId)
                            }
                            applicationContext.startActivity(closeIntent)
                        } catch (_: Exception) {}
                        module.notifyMissedFromService(callData, fcmData)
                    } else {
                        try {
                            CallxStorage.savePendingAction(applicationContext, "missed", callData)
                        } catch (_: Exception) {}
                    }
                }
                "answered_elsewhere" -> {
                    Log.d(TAG, "Handling answered elsewhere (close UI + JS event)")
                    // Close incoming UI
                    try {
                        val closeIntent = Intent(applicationContext, IncomingCallActivity::class.java).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                            putExtra("action", "dismiss")
                            putExtra(IncomingCallActivity.EXTRA_CALL_ID, callData.callId)
                        }
                        applicationContext.startActivity(closeIntent)
                    } catch (_: Exception) {}
                    // Dismiss notification
                    dismissIncomingCallNotification()
                    // Emit answered_elsewhere like missed flow (close UI + send event)
                    val module = CallxModule.getInstance()
                    if (module != null) {
                        module.notifyAnsweredElsewhereFromService(callData, fcmData)
                    } else {
                        try {
                            CallxStorage.savePendingAction(applicationContext, "answered_elsewhere", callData)
                        } catch (_: Exception) {}
                    }
                }
                else -> {
                    Log.w(TAG, "Unknown trigger type: $triggerType")
                }
            }
        } else {
            Log.w(TAG, "Could not extract call data from FCM")
        }
    }

    private fun extractCallDataFromFcm(fcmData: JSONObject, config: CallxConfiguration): CallData? {
        return try {
            val callId = getFieldFromJson(fcmData, config.fields["callId"]) ?: generateUUID()
            val callerName = getFieldFromJson(fcmData, config.fields["callerName"]) ?: "Unknown Caller"
            val callerPhone = getFieldFromJson(fcmData, config.fields["callerPhone"]) ?: "No Number"
            val callerAvatar = getFieldFromJson(fcmData, config.fields["callerAvatar"])
            
            CallData(
                callId = callId,
                callerName = callerName,
                callerPhone = callerPhone,
                callerAvatar = callerAvatar,
                timestamp = System.currentTimeMillis()
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error extracting call data", e)
            null
        }
    }

    private fun detectTriggerType(fcmData: JSONObject, config: CallxConfiguration): String? {
        return try {
            for ((triggerName, triggerConfig) in config.triggers) {
                val fieldValue = getFieldFromJson(fcmData, FieldConfig(triggerConfig.field))
                if (fieldValue == triggerConfig.value) {
                    return triggerName
                }
            }
            null
        } catch (e: Exception) {
            null
        }
    }

    private fun getFieldFromJson(json: JSONObject, fieldConfig: FieldConfig?): String? {
        if (fieldConfig == null) return null
        
        return try {
            val fieldPath = fieldConfig.field.split(".")
            var current: Any? = json
            
            for (pathSegment in fieldPath) {
                current = when (current) {
                    is JSONObject -> if (current.has(pathSegment)) current.get(pathSegment) else null
                    else -> null
                }
                if (current == null) break
            }
            
            current?.toString() ?: fieldConfig.fallback
        } catch (e: Exception) {
            fieldConfig.fallback
        }
    }

    private fun showIncomingCallNotification(callData: CallData, config: CallxConfiguration, rawPayload: JSONObject?) {
        // Use CallxModule's existing notification logic
        // Or implement a simplified version here
        val callxModule = CallxModule.getInstance()
        callxModule?.showIncomingCallFromService(callData, rawPayload)
    }

    private fun dismissIncomingCallNotification() {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(CallxModule.NOTIFICATION_ID)
    }

    private fun generateUUID(): String {
        return UUID.randomUUID().toString()
    }

        // Removed unused helpers detectAppPackageName/detectMainActivity
} 