import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { settingService } from "../services/dataService";

export function useBusinessProfile() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let isMounted = true;
    settingService
      .getSettings()
      .then((data) => {
        if (isMounted && data) {
          setSettings(data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch business settings:", err?.message || err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const ub = user?.business || {};

  const companyName =
    ub.companyName?.trim() ||
    settings?.companyName?.trim() ||
    (user?.name ? `${user.name.split(" ")[0]}'s Glass Works` : "Glass & Glazing Solutions");

  const tagline =
    ub.tagline?.trim() ||
    settings?.tagline?.trim() ||
    "Architectural & Toughened Glass Works";

  const address = ub.address?.trim() || settings?.address?.trim() || "";
  const city = ub.city?.trim() || settings?.city?.trim() || "Mumbai";
  const state = ub.state?.trim() || settings?.state?.trim() || "Maharashtra";
  const pincode = ub.pincode?.trim() || settings?.pincode?.trim() || "";

  const addressParts = [];
  if (address) addressParts.push(address);
  if (city) addressParts.push(city);
  if (state && pincode) addressParts.push(`${state} - ${pincode}`);
  else if (state) addressParts.push(state);
  else if (pincode) addressParts.push(pincode);

  const fullAddress =
    addressParts.length > 0
      ? addressParts.join(", ")
      : "Glass Tech Industrial Estate, Sakinaka, Mumbai - 400072";

  const phone = ub.phone?.trim() || settings?.phone?.trim() || "+91 98200 12345";
  const email = ub.email?.trim() || user?.email?.trim() || settings?.email?.trim() || "sales@glassplant.com";
  const gstin = ub.gstin?.trim() || settings?.gstin?.trim() || "27AABCU9603R1ZX";
  const pan = ub.pan?.trim() || settings?.pan?.trim() || "AABCU9603R";

  const bankName = ub.bankName?.trim() || settings?.bankName?.trim() || "HDFC Bank Ltd";
  const accountNumber = ub.accountNumber?.trim() || settings?.accountNumber?.trim() || "50200088991122";
  const ifscCode = ub.ifscCode?.trim() || settings?.ifscCode?.trim() || "HDFC0000240";
  const branch = ub.branch?.trim() || settings?.branch?.trim() || "Main Branch";
  const upiId = ub.upiId?.trim() || settings?.upiId?.trim() || "";

  const termsAndConditions =
    ub.termsAndConditions?.trim() ||
    settings?.termsAndConditions?.trim() ||
    "1. All dimensions must be verified by the customer before toughening.\n2. No claims for breakage after delivery.\n3. Toughened glass cannot be cut or altered after processing.\n4. Standard dimensional tolerance: ±2mm.\n5. 50% advance along with confirmed order.";

  return {
    companyName,
    tagline,
    address,
    city,
    state,
    pincode,
    fullAddress,
    phone,
    email,
    gstin,
    pan,
    bankName,
    accountNumber,
    ifscCode,
    branch,
    upiId,
    termsAndConditions,
    settings,
  };
}
