# Test Results — ScreenGuide

## Video 1: orders_normal.mp4 — PASS
- Steps: 6
- Discarded: none
- Missing: Authentication
- Final settings: { product: Samsung Galaxy A06, payment_method: MTN Mobile Money, delivery_type: Door Delivery }
- Evidence: vision-only (no narration)

## Video 2: orders_correction.mp4 — PASS
- Steps: 5
- Discarded: "View multiple products — browsing before editing cart"
- Missing: "Add items to cart", "Complete final checkout"
- Final settings: { cart_items: 1, selected_payment_method: MTN XXXX 2682 }
- Limitation: steps 2–5 share timestamp [2:00] due to 1/10s sampling

## Video 3: orders_missing.mp4 — PASS
- Steps: 3
- Discarded: "Struggled to locate product in cart"
- Missing: "Account Login", "Payment Confirmation"
- Final settings: { cart_items: 3, payment_method: MTN Mobile Money, delivery_type: Door Delivery }

## Video 4: orders_changed.mp4 — PASS
- Steps: 3
- Discarded: "Clicking remove button for other items"
- Missing: "Complete checkout/payment"
- Final settings: { cart_status: updated, checkout_action: initiated }

## Changed-recording check — PASS
- Normal ends with a completed purchase (Samsung A06, MTN, Door Delivery)
- Changed ends with a cart update and checkout initiation
- Only the terminal operation differs; the tool correctly distinguishes them

## Follow-the-guide check
- To be recorded during walkthrough video