# Installment Payment System Documentation

## Overview
The BuyOps Sales Dashboard now supports broken/installment payments, allowing investors to pay for properties over time. Agent commissions are automatically distributed based on payment progress.

## Key Features

### 1. Payment Plan Configuration
- **Full Payment**: Traditional one-time payment
- **Installment Payment**: Split payment into multiple installments with flexible scheduling
  - Monthly frequency
  - Quarterly frequency
  - Custom schedule with manually defined amounts and dates

### 2. Payment Tracking
Each installment has a status:
- **Pending**: Current installment due for payment
- **Scheduled**: Future installments not yet due
- **Paid**: Successfully completed installments
- **Overdue**: Past-due installments that haven't been paid

### 3. Commission Distribution
Commissions are broken down proportionally across installments:
- **Lead Commission (2%)**: Distributed across all installments
- **Closer Commission (1%)**: Distributed across all installments
- **Status Tracking**:
  - **Earned**: Commission earned from paid installments
  - **Pending**: Commission from unpaid installments

### 4. Real-Time Progress Tracking
- Visual progress bars showing payment completion percentage
- Commission earned vs. pending breakdown
- Installment-by-installment status views

## Implementation Details

### Data Models
Located in `/src/app/types/payment.ts`:
- `PaymentPlan`: Defines payment structure (full or installment)
- `Installment`: Individual payment details with status and dates
- `CommissionInstallment`: Commission breakdown per installment
- `DealWithPaymentPlan`: Enhanced deal structure with payment tracking

### Utilities
Located in `/src/app/utils/payment-calculations.ts`:
- `generateInstallments()`: Creates installment schedule
- `calculateCommissionPerInstallment()`: Distributes commission
- `calculateEarnedCommission()`: Calculates earned vs pending
- `updateInstallmentStatuses()`: Updates status based on dates
- `calculatePaymentProgress()`: Determines payment completion percentage

### UI Components

#### InstallmentPaymentTracker
- Displays payment schedule and progress
- Shows individual installment status
- Available in compact and full modes
- Location: `/src/app/components/installment-payment-tracker.tsx`

#### InstallmentCommissionTracker
- Shows commission breakdown by installment
- Tracks earned vs pending commission
- Displays lead and closer commission separately
- Location: `/src/app/components/installment-commission-tracker.tsx`

#### PaymentPlanConfig
- Configuration UI for setting up payment plans
- Support for frequency selection and custom schedules
- Validation for custom installments
- Location: `/src/app/components/payment-plan-config.tsx`

### Integration Points

#### Deal Progress Page
- Compact payment and commission trackers inline with deal cards
- "View Details" dialog for full breakdowns
- Real-time payment progress indicators
- Installment-specific actions

#### Commission Preview Page
- Dedicated "Installment-Based Commission Tracking" section
- Shows all deals with installment payments
- Earned vs pending commission summary
- Detailed breakdown dialogs

## Usage Example

### Creating an Installment Plan
```typescript
const paymentPlan: PaymentPlan = {
  type: "installment",
  totalAmount: 680000,
  currency: "NGN",
  numberOfInstallments: 4,
  frequency: "quarterly",
  startDate: "2026-01-15",
  installments: [
    {
      id: "inst-1",
      installmentNumber: 1,
      amount: 170000,
      dueDate: "2026-01-15",
      status: "pending"
    },
    // ... more installments
  ]
};
```

### Commission Calculation
For a ₦680,000 property with 4 installments:
- Total Commission: ₦20,400 (3%)
- Per Installment: ₦5,100
  - Lead: ₦3,400 (2%)
  - Closer: ₦1,700 (1%)

When installment 1 is paid:
- Earned Commission: ₦5,100
- Pending Commission: ₦15,300 (from remaining 3 installments)

## Benefits

### For Investors
- Flexibility to pay over time
- No need for full upfront payment
- Clear payment schedule with tracking

### For Agents
- Commission earned as payments are received
- Clear visibility into pending vs earned commission
- Motivation to ensure timely investor payments
- Fair commission distribution

### For Team Leads
- Track team performance on installment deals
- Monitor payment progress across portfolio
- Team lead bonus (5%) applies to earned commission only

## Mock Data
Sample deals with various payment configurations available in:
`/src/app/data/mock-deals.ts`

Includes examples of:
- Full payment deals
- Monthly installment plans
- Quarterly installment plans
- Deals with partial payments completed
- Overdue installment scenarios

## Future Enhancements
- Payment reminder notifications
- Automatic status updates via webhook
- Payment gateway integration for direct payment links
- Commission payout automation
- Historical payment analytics
- Team Lead bonus tracking per installment
