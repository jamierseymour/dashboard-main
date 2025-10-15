<template>
  <div>
    <UButton
      :loading="isProcessing"
      :disabled="isProcessing || !isReady"
      size="lg"
      color="primary"
      block
      class="cursor-pointer"
      @click="initiatePayment"
    >
      <template v-if="!isProcessing">
        <Icon name="lucide:credit-card" size="20" class="mr-2" />
        Pay {{ formatCurrency(amount) }}
      </template>
      <template v-else> Processing Payment... </template>
    </UButton>

    <!-- Payment Failed Dialog -->
    <UModal v-model="showFailDialog">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Payment Failed</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              class="cursor-pointer"
              @click="showFailDialog = false"
            />
          </div>
        </template>

        <div class="text-center py-6">
          <Icon
            name="lucide:alert-circle"
            size="64"
            class="text-red-500 mx-auto mb-4"
          />
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Your payment was unsuccessful or may still be in a pending state. If
            your payment has gone through, please click the button below to
            verify again.
          </p>
        </div>

        <template #footer>
          <div class="flex gap-2">
            <UButton
              color="primary"
              block
              class="cursor-pointer"
              @click="verifyPayment(lastReference)"
            >
              Try Again
            </UButton>
            <UButton
              color="gray"
              variant="outline"
              block
              class="cursor-pointer"
              @click="showFailDialog = false"
            >
              Close
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  bookingId: {
    type: String,
    required: true,
  },
  metadata: {
    type: Object,
    default: () => ({}),
  },
  channels: {
    type: Array as () => string[],
    default: () => ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
  },
});

const emit = defineEmits(["success", "error", "close"]);

const config = useRuntimeConfig();
const supabase = useSupabaseClient();
const auth = useAuth();

// State
const isProcessing = ref(false);
const isReady = ref(false);
const showFailDialog = ref(false);
const lastReference = ref("");

// Paystack public key - you should add this to your .env file
const PAYSTACK_PUBLIC_KEY = config.public.paystackPublicKey || "pk_test_a4dac53fcfd9ab64946bafbb665827c0b146a079";

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount);
};

// Generate unique reference
const generateReference = () => {
  return `booking_${props.bookingId}_${Date.now()}`;
};

// Verify payment on backend
const verifyPayment = async (reference: string) => {
  try {
    isProcessing.value = true;
    console.log("🔍 Verifying payment:", reference);

    // Call your backend API to verify payment
    const { data, error } = await $fetch("/api/payments/verify-paystack", {
      method: "POST",
      body: {
        reference,
        bookingId: props.bookingId,
        userId: auth.user?.id,
        userEmail: auth.user?.email || props.email,
      },
    });

    if (error) {
      throw new Error(error);
    }

    if (data?.status === "success") {
      console.log("✅ Payment verified successfully");

      // Update booking payment status in database
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          payment_reference: reference,
          paid_at: new Date().toISOString(),
        })
        .eq("id", props.bookingId);

      if (updateError) {
        console.error("Error updating booking:", updateError);
        throw updateError;
      }

      // Show success toast
      useToast().add({
        title: "Payment Successful!",
        description: "Your booking payment has been confirmed.",
        color: "success",
      });

      emit("success", { reference, data });
      return true;
    } else {
      throw new Error("Payment verification failed");
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    showFailDialog.value = true;
    emit("error", error);
    return false;
  } finally {
    isProcessing.value = false;
  }
};

// Initialize Paystack
const initiatePayment = () => {
  if (!window.PaystackPop) {
    console.error("Paystack script not loaded");
    useToast().add({
      title: "Error",
      description: "Payment system is not ready. Please refresh the page.",
      color: "error",
    });
    return;
  }

  const reference = generateReference();
  lastReference.value = reference;

  console.log("💳 Initiating payment:", {
    amount: props.amount,
    email: props.email,
    reference,
  });

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: props.email,
    amount: props.amount * 100, // Paystack expects amount in kobo (cents)
    currency: "ZAR",
    ref: reference,
    channels: props.channels,
    metadata: {
      booking_id: props.bookingId,
      user_id: auth.user?.id,
      ...props.metadata,
    },
    callback: async (response: any) => {
      console.log("✅ Payment callback:", response);
      await verifyPayment(response.reference);
    },
    onClose: () => {
      console.log("❌ Payment closed");
      emit("close");
    },
  });

  handler.openIframe();
};

// Load Paystack script
const loadPaystackScript = () => {
  if (typeof window !== "undefined") {
    if (window.PaystackPop) {
      isReady.value = true;
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="paystack"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        isReady.value = true;
      });
      return;
    }

    // Load script
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      console.log("✅ Paystack script loaded");
      isReady.value = true;
    };
    script.onerror = () => {
      console.error("❌ Failed to load Paystack script");
      useToast().add({
        title: "Error",
        description: "Failed to load payment system.",
        color: "error",
      });
    };
    document.head.appendChild(script);
  }
};

// Initialize on mount
onMounted(() => {
  loadPaystackScript();
});

// TypeScript declaration for PaystackPop
declare global {
  interface Window {
    PaystackPop: any;
  }
}
</script>
