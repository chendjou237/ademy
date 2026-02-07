import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../contexts/ThemeContext';
import { checkPaymentStatus } from '../services/payunitService';
import { AppText, Button } from './ui';

interface PaymentWebViewProps {
  visible: boolean;
  paymentUrl: string;
  transactionId: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export const PaymentWebView: React.FC<PaymentWebViewProps> = ({
  visible,
  paymentUrl,
  transactionId,
  onSuccess,
  onCancel,
  onError,
}) => {
  const { theme } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll payment status every 3 seconds
  useEffect(() => {
    if (!visible || !transactionId) {
      // Clear polling when modal is closed
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    console.log('🔄 Starting payment status polling for transaction:', transactionId);

    const checkStatus = async () => {
      if (checkingStatus) return; // Prevent concurrent checks

      try {
        setCheckingStatus(true);
        console.log('📡 Checking payment status...');

        const statusResponse = await checkPaymentStatus(transactionId);
        const status = statusResponse.data.transaction_status;

        console.log('📊 Payment status:', status);

        if (status === 'SUCCESS') {
          console.log('✅ Payment successful!');
          // Clear polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          // Trigger success callback
          onSuccess(transactionId);
        } else if (status === 'FAILED') {
          console.log('❌ Payment failed');
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          onError('Payment failed. Please try again.');
        } else if (status === 'CANCELLED') {
          console.log('🚫 Payment cancelled');
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          onCancel();
        }
        // If PENDING, continue polling
      } catch (error) {
        console.error('Error checking payment status:', error);
        // Don't stop polling on error, just log it
      } finally {
        setCheckingStatus(false);
      }
    };

    // Check immediately
    checkStatus();

    // Then poll every 3 seconds
    pollingIntervalRef.current = setInterval(checkStatus, 3000);

    // Cleanup on unmount or when modal closes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [visible, transactionId, onSuccess, onError, onCancel, checkingStatus]);

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    setCanGoBack(navState.canGoBack);

    // Check if the URL indicates payment completion
    // PayUnit redirects to return_url after payment
    if (url.includes('payment-result') || url.includes('payment-success')) {
      console.log('🔗 Detected success URL redirect');
      // Payment completed, status polling will handle the rest
    } else if (url.includes('payment-cancel') || url.includes('cancel')) {
      console.log('🔗 Detected cancel URL redirect');
      // Payment cancelled
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      onCancel();
    } else if (url.includes('payment-error') || url.includes('error')) {
      console.log('🔗 Detected error URL redirect');
      // Payment error
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      onError('Payment failed or was cancelled');
    }
  };

  const handleGoBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const handleClose = () => {
    // Clear polling when user manually closes
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <AppText variant="h3" color="text">
            Payment
          </AppText>
          <Button variant="outline" onPress={handleClose} style={styles.closeButton}>
            Close
          </Button>
        </View>

        {/* WebView */}
        <View style={styles.webViewContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <AppText variant="body" color="textSecondary" style={{ marginTop: 16 }}>
                Loading payment page...
              </AppText>
            </View>
          )}

          <WebView
            ref={webViewRef}
            source={{ uri: paymentUrl }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={handleNavigationStateChange}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              onError(`Failed to load payment page: ${nativeEvent.description}`);
            }}
            style={styles.webView}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
          />

          {/* Status checking indicator */}
          {checkingStatus && (
            <View style={styles.statusIndicator}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <AppText variant="caption" color="textSecondary" style={{ marginLeft: 8 }}>
                Checking payment status...
              </AppText>
            </View>
          )}
        </View>

        {/* Footer with back button */}
        {canGoBack && (
          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <Button variant="outline" onPress={handleGoBack}>
              Go Back
            </Button>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    paddingHorizontal: 16,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
