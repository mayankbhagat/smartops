import { generateSalesCSV, generateInventoryCSV, generateLogisticsCSV } from '@/data/generateMockData';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'sales';
  const industry = (url.searchParams.get('industry') || 'ecommerce') as any;

  let csv = '';
  let filename = '';

  if (type === 'sales') {
    csv = generateSalesCSV(industry);
    filename = `smartops_demo_sales_${industry}.csv`;
  } else if (type === 'inventory') {
    csv = generateInventoryCSV();
    filename = 'smartops_demo_inventory.csv';
  } else if (type === 'logistics') {
    csv = generateLogisticsCSV();
    filename = 'smartops_demo_logistics.csv';
  } else {
    return new Response('Invalid type. Use: sales, inventory, logistics', { status: 400 });
  }

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
