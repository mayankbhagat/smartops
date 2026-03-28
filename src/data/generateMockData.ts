import { supabase } from '@/lib/supabase';

// Helper to generate a random number within a range
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

// Generate a realistic date array within a range
const generateDates = (days: number) => {
  const dates = [];
  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

export async function generateDemoData(userId: string) {
  try {
    // 1. Create a Business Profile
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert({
        user_id: userId,
        name: 'Demo Retail Co',
        industry: 'Retail',
        products_type: 'Electronics & Accessories',
        sales_model: 'B2C',
      })
      .select()
      .single();

    if (bizError) throw bizError;
    const businessId = business.id;

    // 2. Generate Sales (last 30 days)
    const dates = generateDates(30);
    const salesData = dates.map((date) => {
      // Create some seasonality or trend
      const baseAmount = 500;
      const noise = getRandomInt(-100, 300);
      return {
        business_id: businessId,
        transaction_date: date,
        amount: baseAmount + noise,
        category: 'Electronics',
        items_sold: [{ name: 'Wireless Mouse', qty: getRandomInt(1, 4) }, { name: 'Keyboard', qty: getRandomInt(0, 2) }]
      };
    });
    const { error: salesError } = await supabase.from('sales').insert(salesData);
    if (salesError) throw salesError;

    // 3. Generate Expenses (weekly)
    const expensesData = [
      { business_id: businessId, expense_date: dates[0], amount: 1200, category: 'Rent', description: 'Office Rent' },
      { business_id: businessId, expense_date: dates[7], amount: 300, category: 'Marketing', description: 'Ads' },
      { business_id: businessId, expense_date: dates[14], amount: 800, category: 'Payroll', description: 'Staff' },
      { business_id: businessId, expense_date: dates[21], amount: 350, category: 'Utilities', description: 'Internet & Power' },
      { business_id: businessId, expense_date: dates[28], amount: 400, category: 'Logistics', description: 'Shipping fees' }
    ];
    const { error: expensesError } = await supabase.from('expenses').insert(expensesData);
    if (expensesError) throw expensesError;

    // 4. Generate Inventory
    const inventoryData = [
      { business_id: businessId, item_name: 'Wireless Mouse', sku: 'WM-01', quantity: 45, unit_price: 25.00, reorder_threshold: 20, status: 'in_stock' },
      { business_id: businessId, item_name: 'Mechanical Keyboard', sku: 'MK-02', quantity: 8, unit_price: 85.00, reorder_threshold: 15, status: 'low_stock' },
      { business_id: businessId, item_name: 'USB-C Cable', sku: 'UC-03', quantity: 120, unit_price: 15.00, reorder_threshold: 50, status: 'in_stock' },
      { business_id: businessId, item_name: '4K Monitor', sku: 'MO-04', quantity: 2, unit_price: 299.00, reorder_threshold: 5, status: 'low_stock' },
      { business_id: businessId, item_name: 'Bluetooth Earbuds', sku: 'BE-05', quantity: 0, unit_price: 55.00, reorder_threshold: 10, status: 'out_of_stock' }
    ];
    const { error: invError } = await supabase.from('inventory').insert(inventoryData);
    if (invError) throw invError;

    // 5. Generate Deliveries
    const deliveriesData = [
      { business_id: businessId, route_name: 'Downtown Route', destination: 'City Center Hub', distance_km: 15.5, estimated_fuel_cost: 3.5, status: 'delivered', delivery_date: dates[dates.length - 2] },
      { business_id: businessId, route_name: 'North Suburbs', destination: 'North Mall', distance_km: 45.0, estimated_fuel_cost: 12.0, status: 'in_transit', delivery_date: dates[dates.length - 1] },
      { business_id: businessId, route_name: 'West End', destination: 'West Warehouse', distance_km: 30.2, estimated_fuel_cost: 8.0, status: 'pending', delivery_date: dates[dates.length - 1] }
    ];
    const { error: delError } = await supabase.from('deliveries').insert(deliveriesData);
    if (delError) throw delError;

    return { success: true, message: 'Demo data generated successfully.' };

  } catch (error: any) {
    console.error('Error generating mock data:', error);
    return { success: false, error: error.message };
  }
}
