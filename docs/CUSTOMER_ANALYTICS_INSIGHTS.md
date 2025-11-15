# Customer Analytics Insights - How They Work

This document explains how the customer insights are calculated in the Customer Analytics page (`app/admin/analytics/customers/page.tsx`).

## Overview

All insights are **calculated dynamically** from your actual customer and order data. They update in real-time as you process orders and add customers. None of the values are hardcoded.

---

## Data Sources

The insights are derived from two main data sources:

1. **Customers Table** (`customers`)
   - Customer records with user relationships
   - Includes: `id`, `user_id`, `full_name`, `email`, `source`, `created_at`

2. **Orders Table** (`orders`)
   - Paid orders (`payment_status = 'paid'`)
   - Includes: `id`, `total`, `created_at`, `customer_id`, `user_id`
   - Joined with `customers` and `users` tables for complete customer information

---

## Insight Calculations

### 1. First-Time Buyers Percentage

**What it measures:** The percentage of customers who have made only 1 order or no orders yet.

**Formula:**
```typescript
firstTimeBuyersPercentage = (
  (Count of "New (1 order)" customers) + 
  (Count of "No Orders Yet" customers)
) / Total Customers × 100
```

**Calculation Steps:**
1. Count customers in the "New (1 order)" segment
2. Count customers in the "No Orders Yet" segment
3. Add both counts
4. Divide by total customers
5. Multiply by 100 to get percentage

**Display Logic:**
- If ≥ 1%: Shows "Nearly X%" (rounded to nearest whole number)
- If > 0% but < 1%: Shows "About X.X%" (1 decimal place)
- If 0%: Shows "A small percentage"

**Example:**
- Total customers: 100
- New (1 order): 45
- No Orders Yet: 5
- **Result:** (45 + 5) / 100 × 100 = **50%** → "Nearly 50%"

---

### 2. VIP Customers Percentage

**What it measures:** The percentage of customers who have made 10 or more orders.

**Formula:**
```typescript
vipPercentage = (Count of VIP customers) / Total Customers × 100
```

**Calculation Steps:**
1. Find customers with 10+ orders from `customerSpending` data
2. Count them
3. Divide by total customers
4. Multiply by 100

**Customer Segments:**
Customers are segmented based on order count:
- **VIP:** 10+ orders
- **Loyal:** 5-9 orders
- **Regular:** 2-4 orders
- **New:** 1 order
- **No Orders Yet:** 0 orders

**Display:**
- Only shown if VIP percentage > 0%
- Format: "VIP customers (X.X%) contribute significantly to revenue - reward them"

**Example:**
- Total customers: 100
- VIP customers (10+ orders): 3.6
- **Result:** 3.6 / 100 × 100 = **3.6%**

---

### 3. Returning Customer Rate

**What it measures:** The percentage of customers who have made more than 1 order (repeat customers).

**Formula:**
```typescript
customersWithMultipleOrders = Count of customers with orders > 1
returningRate = (customersWithMultipleOrders / totalWithOrders) × 100
```

**Calculation Steps:**
1. Filter `customerSpending` to find customers with `orders > 1`
2. Count them
3. Divide by total customers who have placed orders (`totalWithOrders`)
4. Multiply by 100

**Note:** This excludes customers with 0 orders from the calculation.

**Display:**
- Only shown if returning rate > 0%
- Format: "Returning customer rate is X.X% - implement loyalty programs"

**Example:**
- Total customers with orders: 100
- Customers with 2+ orders: 34.5
- **Result:** 34.5 / 100 × 100 = **34.5%**

---

### 4. Average Lifetime Value (ALV)

**What it measures:** The average total amount spent per customer across all their orders.

**Formula:**
```typescript
totalSpent = Sum of all customer spending amounts
avgLifetimeValue = totalSpent / totalWithOrders
```

**Calculation Steps:**
1. For each customer, sum their total spending from all orders
2. Sum all customer spending to get `totalSpent`
3. Divide by the number of customers who have placed orders
4. Result is the average lifetime value per customer

**Display:**
- Only shown if ALV > 0
- Format: "Average lifetime value is GHS X,XXX - upselling opportunities exist"
- Uses `.toLocaleString()` for number formatting (e.g., 456.78 → "456.78")

**Example:**
- Total spent by all customers: GHS 45,678
- Total customers with orders: 100
- **Result:** 45,678 / 100 = **GHS 456.78**

---

## Data Processing Flow

### Step 1: Fetch Customer Data
```typescript
// Query customers with user relationships
const { data: customerRecords } = await supabase
  .from('customers')
  .select(`
    id, user_id, full_name, email, source, created_at,
    user:users!customers_user_id_fkey(...)
  `);
```

### Step 2: Fetch Order Data
```typescript
// Query paid orders with customer and user relationships
const { data: orders } = await supabase
  .from('orders')
  .select(`
    id, total, created_at, customer_id, user_id,
    customer:customers!orders_customer_id_fkey(...),
    user:users!orders_user_id_fkey(...)
  `)
  .eq('payment_status', 'paid');
```

### Step 3: Calculate Customer Spending
```typescript
// Group orders by customer and calculate totals
const customerSpending = {};
orders.forEach(order => {
  const key = order.customer_id || order.user_id;
  if (!customerSpending[key]) {
    customerSpending[key] = { orders: 0, spent: 0, ... };
  }
  customerSpending[key].orders += 1;
  customerSpending[key].spent += order.total;
});
```

### Step 4: Segment Customers
```typescript
// Categorize customers by order count
const vipCount = customers.filter(c => c.orders >= 10).length;
const loyalCount = customers.filter(c => c.orders >= 5 && c.orders < 10).length;
const regularCount = customers.filter(c => c.orders >= 2 && c.orders < 5).length;
const newCount = customers.filter(c => c.orders === 1).length;
```

### Step 5: Calculate Metrics
```typescript
// Calculate all metrics from processed data
const returningRate = (customersWithMultipleOrders / totalWithOrders) * 100;
const avgLifetimeValue = totalSpent / totalWithOrders;
```

---

## Key Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `totalCustomers` | Total number of customer records | `customers` table count |
| `newCustomers` | Customers created in selected time period | Filtered by `created_at` |
| `customerSpending` | Object mapping customer IDs to spending data | Calculated from orders |
| `customerSegments` | Array of customer segments with counts | Calculated from `customerSpending` |
| `totalWithOrders` | Number of customers who have placed orders | Count of keys in `customerSpending` |
| `customersWithoutOrders` | Customers with no orders | `totalCustomers - totalWithOrders` |

---

## Time Filtering

The analytics support time filtering (7 days, 30 days, 90 days), but note:

- **Customer counts** are filtered by `created_at` date
- **Order data** includes all paid orders (not filtered by date)
- **Spending calculations** use all historical orders, not just recent ones

This means:
- "New Customers" reflects the selected time period
- "Average Lifetime Value" and "Returning Rate" reflect all-time data

---

## Edge Cases Handled

1. **No customers:** Shows "No customer data available yet"
2. **Zero values:** Insights are only displayed if > 0
3. **Missing relationships:** Uses fallback logic to resolve customer names from orders, customers, or users tables
4. **Null values:** Uses `|| 0` and `|| null` fallbacks throughout
5. **Empty arrays:** Checks `Array.isArray()` before processing

---

## Performance Considerations

- **Indexes:** The migration creates indexes on:
  - `orders.payment_status`
  - `orders.customer_id`
  - `orders.user_id`
  - `orders.created_at`
  - `customers.user_id`
  - `customers.created_at`

- **Query Optimization:**
  - Uses `.limit()` where appropriate
  - Filters at database level (`payment_status = 'paid'`)
  - Processes aggregations in memory after fetching

---

## Example Calculation Walkthrough

Let's say you have:
- **Total customers:** 100
- **Orders:** 150 paid orders from 60 unique customers
- **Order distribution:**
  - 1 customer with 15 orders (VIP)
  - 5 customers with 7 orders each (Loyal)
  - 10 customers with 3 orders each (Regular)
  - 44 customers with 1 order each (New)
  - 40 customers with 0 orders

**Calculations:**

1. **First-Time Buyers:**
   - New (1 order): 44
   - No Orders Yet: 40
   - Total: 84 / 100 = **84%**

2. **VIP Customers:**
   - VIP count: 1
   - Percentage: 1 / 100 = **1%**

3. **Returning Rate:**
   - Customers with 2+ orders: 1 + 5 + 10 = 16
   - Total with orders: 60
   - Rate: 16 / 60 = **26.7%**

4. **Average Lifetime Value:**
   - Total spent: GHS 30,000 (example)
   - Customers with orders: 60
   - ALV: 30,000 / 60 = **GHS 500**

---

## Updating Insights

The insights automatically update when:
- New customers are created
- New orders are placed and marked as paid
- Order payment status changes to 'paid'
- Customer records are linked to users

**Refresh:** The page automatically refetches data when:
- The time filter changes
- The component mounts
- User navigates to the page

---

## Troubleshooting

### Insights show 0% or incorrect values

1. **Check if orders exist:**
   ```sql
   SELECT COUNT(*) FROM orders WHERE payment_status = 'paid';
   ```

2. **Check customer-order relationships:**
   ```sql
   SELECT COUNT(*) FROM orders 
   WHERE customer_id IS NOT NULL OR user_id IS NOT NULL;
   ```

3. **Verify foreign keys exist:**
   - Run `npm run check-db` in backend
   - Ensure migration has been applied

### "No customer data available" message

- This appears when `totalCustomers === 0`
- Check if customers table has records
- Verify RLS policies allow reading customer data

---

## Related Files

- **Component:** `app/admin/analytics/customers/page.tsx`
- **Database Migration:** `gadgetsbackend/migrations/fix_database_schema.sql`
- **Database Check:** `gadgetsbackend/src/scripts/checkDatabaseConnection.ts`

---

## Future Enhancements

Potential improvements:
- Add time-based filtering for spending calculations
- Include refunded orders in calculations
- Add trend analysis (compare periods)
- Export insights as PDF/CSV
- Add more granular segments (e.g., 20+ orders for "Super VIP")

