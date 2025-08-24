import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, X, Check, Star } from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useUserStore } from '@/store/userStore';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ visible, onClose }: SubscriptionModalProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { setSubscription } = useUserStore();
  const [loading, setLoading] = useState(false);

  const handleSubscription = async (type: 'monthly' | 'yearly') => {
    setLoading(true);

    try {
      // Create payment intent on your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionType: type,
          amount: type === 'monthly' ? 999 : 9999, // $9.99 or $99.99 in cents
        }),
      });

      const { clientSecret, ephemeralKey, customer } = await response.json();

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'FastOut',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'FastOut User',
        },
      });

      if (initError) {
        Alert.alert('Error', initError.message);
        return;
      }

      // Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        Alert.alert('Payment Failed', paymentError.message);
      } else {
        // Payment successful
        setSubscription(type);
        Alert.alert(
          'Payment Successful! 🎉',
          `Your ${type} subscription has been activated. Welcome to premium!`,
          [{ text: 'Awesome!', onPress: onClose }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subscriptionPlans = [
    {
      type: 'monthly' as const,
      title: 'Monthly',
      price: '$9.99',
      period: '/month',
      features: [
        'All fasting protocols',
        'Advanced workout tracking',
        'Detailed analytics',
        'Priority support',
      ],
      gradient: ['#3B82F6', '#2563EB'],
      popular: false,
    },
    {
      type: 'yearly' as const,
      title: 'Yearly',
      price: '$99.99',
      period: '/year',
      savings: 'Save 17%',
      features: [
        'All fasting protocols',
        'Advanced workout tracking',
        'Detailed analytics',
        'Priority support',
        'Exclusive content',
        'Early access to features',
      ],
      gradient: ['#8B5CF6', '#7C3AED'],
      popular: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Crown size={32} color="#F59E0B" />
            <Text style={styles.title}>Unlock Premium</Text>
            <Text style={styles.subtitle}>
              Get unlimited access to all features and advanced analytics
            </Text>
          </View>
        </View>

        <View style={styles.plansContainer}>
          {subscriptionPlans.map((plan) => (
            <TouchableOpacity
              key={plan.type}
              style={[styles.planCard, plan.popular && styles.popularCard]}
              onPress={() => handleSubscription(plan.type)}
              disabled={loading}
            >
              <LinearGradient
                colors={plan.gradient}
                style={styles.planGradient}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Star size={12} color="white" />
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                
                <Text style={styles.planTitle}>{plan.title}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
                
                {plan.savings && (
                  <Text style={styles.savingsText}>{plan.savings}</Text>
                )}

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Check size={16} color="white" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.selectButton}>
                  <Text style={styles.selectButtonText}>
                    {loading ? 'Processing...' : 'Select Plan'}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Cancel anytime • Secure payment with Stripe
          </Text>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#374151',
    borderRadius: 20,
    padding: 8,
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  plansContainer: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  planCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  planGradient: {
    padding: 24,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  planTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  planPeriod: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  savingsText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'white',
    flex: 1,
  },
  selectButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});