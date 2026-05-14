/**
 * SmartOps AI — Realistic Demo Dataset Generator
 * Generates CSV strings for testing all platform modules.
 */

// ── Helpers ──────────────────────────────────────────────────
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const fmtDate = (d: Date) => d.toISOString().split('T')[0];

// ── Business Sales / Revenue CSV ─────────────────────────────
export function generateSalesCSV(industry: 'ecommerce' | 'logistics' | 'retail' = 'ecommerce'): string {
  const headers = ['date', 'product', 'category', 'revenue', 'expenses', 'units_sold', 'region'];

  const ecommerceProducts = [
    { name: 'Wireless Mouse', cat: 'Electronics', priceRange: [400, 1200] },
    { name: 'Mechanical Keyboard', cat: 'Electronics', priceRange: [2000, 8000] },
    { name: 'USB-C Hub', cat: 'Accessories', priceRange: [800, 2500] },
    { name: '4K Monitor', cat: 'Electronics', priceRange: [15000, 45000] },
    { name: 'Bluetooth Earbuds', cat: 'Audio', priceRange: [1500, 6000] },
    { name: 'Laptop Stand', cat: 'Accessories', priceRange: [600, 2000] },
    { name: 'Webcam HD', cat: 'Electronics', priceRange: [1200, 4000] },
    { name: 'Gaming Headset', cat: 'Audio', priceRange: [2000, 8000] },
    { name: 'LED Desk Lamp', cat: 'Accessories', priceRange: [400, 1500] },
    { name: 'SSD 1TB', cat: 'Storage', priceRange: [4000, 9000] },
  ];

  const logisticsProducts = [
    { name: 'Express Delivery', cat: 'Logistics', priceRange: [200, 800] },
    { name: 'Freight Forwarding', cat: 'Logistics', priceRange: [5000, 50000] },
    { name: 'Cold Chain Transport', cat: 'Specialized', priceRange: [8000, 30000] },
    { name: 'Last Mile Delivery', cat: 'Logistics', priceRange: [150, 500] },
    { name: 'Warehouse Storage', cat: 'Storage', priceRange: [1000, 15000] },
    { name: 'Cross-Docking', cat: 'Logistics', priceRange: [3000, 20000] },
  ];

  const retailProducts = [
    { name: 'Grocery Bundle', cat: 'Food', priceRange: [500, 2000] },
    { name: 'Clothing Set', cat: 'Apparel', priceRange: [800, 4000] },
    { name: 'Home Decor', cat: 'Home', priceRange: [300, 3000] },
    { name: 'Sports Equipment', cat: 'Sports', priceRange: [1000, 8000] },
    { name: 'Cosmetics Pack', cat: 'Beauty', priceRange: [400, 2500] },
    { name: 'Books Bundle', cat: 'Education', priceRange: [200, 1000] },
    { name: 'Kitchen Appliance', cat: 'Home', priceRange: [1500, 12000] },
  ];

  const products = industry === 'ecommerce' ? ecommerceProducts : industry === 'logistics' ? logisticsProducts : retailProducts;
  const regions = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];

  const rows: string[] = [headers.join(',')];
  const startDate = new Date('2024-01-01');

  // Generate 90 days of data with seasonal trends
  for (let day = 0; day < 180; day++) {
    const date = new Date(startDate.getTime() + day * 86400000);
    const month = date.getMonth();

    // Seasonality: Q4 boost (Oct-Dec), Q1 slowdown (Jan-Mar)
    const seasonMultiplier = month >= 9 ? 1.4 : month <= 2 ? 0.75 : 1.0;
    // Weekly pattern: weekends lower for B2B
    const dayOfWeek = date.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.6 : 1.0;

    // 2-8 transactions per day
    const txCount = rand(2, 8);
    for (let t = 0; t < txCount; t++) {
      const product = pick(products);
      const basePrice = rand(product.priceRange[0], product.priceRange[1]);
      const units = rand(1, 25);
      const revenue = Math.round(basePrice * units * seasonMultiplier * weekendFactor);
      // Random anomaly: occasional loss month in March
      const expenseRatio = month === 2 && rand(0, 4) === 0 ? 0.95 : rand(55, 75) / 100;
      const expenses = Math.round(revenue * expenseRatio);

      rows.push([
        fmtDate(date),
        `"${product.name}"`,
        product.cat,
        revenue,
        expenses,
        units,
        pick(regions),
      ].join(','));
    }
  }
  return rows.join('\n');
}

// ── Inventory CSV ─────────────────────────────────────────────
export function generateInventoryCSV(): string {
  const headers = ['product_id', 'name', 'category', 'stock', 'threshold', 'units_sold', 'unit_price', 'supplier'];

  const items = [
    { name: 'Wireless Mouse', cat: 'Electronics', stock: 45, sold: 32, price: 850 },
    { name: 'Mechanical Keyboard', cat: 'Electronics', stock: 8, sold: 65, price: 4500 },
    { name: 'USB-C Hub', cat: 'Accessories', stock: 120, sold: 89, price: 1200 },
    { name: '4K Monitor', cat: 'Electronics', stock: 2, sold: 12, price: 28000 },
    { name: 'Bluetooth Earbuds', cat: 'Audio', stock: 0, sold: 0, price: 3500 },
    { name: 'Laptop Stand', cat: 'Accessories', stock: 78, sold: 41, price: 950 },
    { name: 'Webcam HD', cat: 'Electronics', stock: 15, sold: 28, price: 2200 },
    { name: 'Gaming Headset', cat: 'Audio', stock: 22, sold: 19, price: 4800 },
    { name: 'LED Desk Lamp', cat: 'Accessories', stock: 95, sold: 0, price: 650 },
    { name: 'SSD 1TB', cat: 'Storage', stock: 30, sold: 55, price: 6500 },
    { name: 'HDMI Cable 2m', cat: 'Accessories', stock: 200, sold: 0, price: 299 },
    { name: 'Ergonomic Chair', cat: 'Furniture', stock: 5, sold: 18, price: 15000 },
    { name: 'Mouse Pad XL', cat: 'Accessories', stock: 150, sold: 0, price: 450 },
    { name: 'USB Flash Drive', cat: 'Storage', stock: 88, sold: 72, price: 350 },
    { name: 'Portable Charger', cat: 'Electronics', stock: 12, sold: 48, price: 1800 },
  ];

  const suppliers = ['TechPro India', 'Global Sourcing Co', 'DirectImport Ltd', 'LocalVendor Hub'];

  const rows: string[] = [headers.join(',')];
  items.forEach((item, i) => {
    rows.push([
      `SKU-${String(i + 1).padStart(3, '0')}`,
      `"${item.name}"`,
      item.cat,
      item.stock,
      rand(10, 25), // threshold
      item.sold,
      item.price,
      `"${pick(suppliers)}"`,
    ].join(','));
  });
  return rows.join('\n');
}

// ── Logistics Events CSV ──────────────────────────────────────
export function generateLogisticsCSV(): string {
  const headers = ['date', 'shipment_id', 'origin', 'destination', 'transport_mode', 'distance_km', 'cost_inr', 'co2_kg', 'status', 'cargo_weight_kg'];

  const hubs = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
  const modes = ['Truck', 'Air', 'Ship', 'Rail'];
  const statuses = ['delivered', 'in_transit', 'pending', 'delivered', 'delivered']; // weighted towards delivered

  const rows: string[] = [headers.join(',')];
  const startDate = new Date('2024-01-01');

  for (let i = 0; i < 100; i++) {
    const date = new Date(startDate.getTime() + rand(0, 180) * 86400000);
    const origin = pick(hubs);
    const dest = pick(hubs.filter(h => h !== origin));
    const mode = pick(modes);
    const dist = rand(200, 2500);
    const weight = rand(100, 5000);
    const costRates: any = { Truck: 8, Air: 45, Ship: 2, Rail: 3 };
    const co2Rates: any = { Truck: 0.27, Air: 0.6, Ship: 0.015, Rail: 0.04 };
    const cost = Math.round(dist * costRates[mode] * (weight / 1000));
    const co2 = parseFloat((dist * co2Rates[mode] * (weight / 1000)).toFixed(2));

    rows.push([
      fmtDate(date),
      `SHIP-${String(i + 1).padStart(4, '0')}`,
      origin,
      dest,
      mode,
      dist,
      cost,
      co2,
      pick(statuses),
      weight,
    ].join(','));
  }
  return rows.join('\n');
}
