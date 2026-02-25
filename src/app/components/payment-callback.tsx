import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentsApi } from "../utils/api-service";
import { useToast } from "../contexts/toast-context";

export function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, warning, error } = useToast();
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const provider = (searchParams.get("provider") || "").toLowerCase();
    const reference =
      searchParams.get("reference") || searchParams.get("tx_ref") || "";

    if ((provider !== "paystack" && provider !== "flutterwave") || !reference) {
      setMessage("Missing callback details.");
      warning(
        "Payment callback",
        "Missing provider/reference in callback URL.",
      );
      setTimeout(() => navigate("/deals", { replace: true }), 1200);
      return;
    }

    paymentsApi
      .verify(provider as "paystack" | "flutterwave", reference)
      .then((res: any) => {
        const status = String(
          res?.data?.status || res?.status || "",
        ).toLowerCase();
        if (status === "success") {
          setMessage("Payment verified successfully.");
          success("Payment verified", "Checkout was completed successfully.");
        } else {
          setMessage(
            `Payment status: ${res?.data?.status || res?.status || "unknown"}`,
          );
          warning(
            "Payment status",
            `Verification returned ${res?.data?.status || res?.status || "unknown"}.`,
          );
        }
      })
      .catch((err: any) => {
        const errMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Payment verification failed.";
        setMessage(errMsg);
        error("Verification failed", errMsg);
      })
      .finally(() => {
        setTimeout(() => navigate("/deals", { replace: true }), 1500);
      });
  }, [navigate, searchParams, success, warning, error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center text-muted-foreground">{message}</div>
    </div>
  );
}
