import api from "../api/axios";

function loadScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// success par resolve, cancel ya fail par Error ke saath reject
export async function payForCourse(courseId, user) {
  const loaded = await loadScript();
  if (!loaded) throw new Error("Could not load the payment window. Check your internet.");

  const { data: order } = await api.post(`/payments/order/${courseId}`);

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "LMS",
      description: order.courseTitle,
      prefill: { name: user.name, email: user.email },
      handler: async (response) => {
        try {
          await api.post("/payments/verify", response);
          resolve();
        } catch (err) {
          reject(new Error(err.response?.data?.message || "Verification failed"));
        }
      },
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    });

    rzp.on("payment.failed", (r) => {
      reject(new Error(r.error?.description || "Payment failed"));
    });
    rzp.open();
  });
}