export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { reference, bookingId, userId, userEmail } = body;

  if (!reference) {
    throw createError({
      statusCode: 400,
      statusMessage: "Payment reference is required",
    });
  }

  try {
    console.log("🔍 Verifying Paystack payment:", reference);

    // Get Paystack secret key from environment variables
    const config = useRuntimeConfig();
    const secretKey = config.paystackSecretKey || "sk_test_your_secret_key_here";

    // Verify payment with Paystack API
    const response = await $fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    console.log("📦 Paystack response:", response);

    // Check if payment was successful
    if (response.status && response.data.status === "success") {
      console.log("✅ Payment verified successfully");

      // You can add additional logic here:
      // - Send confirmation email
      // - Update booking status
      // - Create invoice
      // - Notify vendor

      return {
        status: "success",
        data: response.data,
        message: "Payment verified successfully",
      };
    } else {
      console.log("❌ Payment verification failed");
      return {
        status: "failed",
        message: "Payment verification failed",
      };
    }
  } catch (error: any) {
    console.error("❌ Payment verification error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Payment verification failed",
    });
  }
});
