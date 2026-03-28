-- Supabase Schema for SmartOps AI

-- Custom types
CREATE TYPE delivery_status AS ENUM ('pending', 'in_transit', 'delivered', 'canceled');
CREATE TYPE agent_type AS ENUM ('ingestion', 'analyst', 'inventory', 'logistics', 'decision', 'conversational');

-- 1. Businesses Table (extends auth.users implicitly by FK)
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT,
    products_type TEXT,
    sales_model TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Sales Table
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category TEXT,
    items_sold JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Expenses Table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    expense_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Inventory Table
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    sku TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2),
    reorder_threshold INTEGER DEFAULT 10,
    status TEXT, -- e.g., 'in_stock', 'low_stock', 'out_of_stock'
    last_restocked DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Deliveries Table
CREATE TABLE public.deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    route_name TEXT,
    destination TEXT NOT NULL,
    distance_km DECIMAL(8, 2),
    estimated_fuel_cost DECIMAL(8, 2),
    status delivery_status DEFAULT 'pending',
    delivery_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Predictions & Insights Table (Output of Agents)
CREATE TABLE public.insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL, -- e.g., 'demand_prediction', 'logistics_optimization', 'financial_health'
    title TEXT NOT NULL,
    description TEXT,
    data JSONB, -- Storing structured JSON of the prediction
    action_items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Agent Logs (Crucial for visualizing AI thought process)
CREATE TABLE public.agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    agent_name agent_type NOT NULL,
    status TEXT NOT NULL, -- 'started', 'processing', 'completed', 'failed'
    input_data JSONB,
    output_data JSONB,
    reasoning TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies to ensure users only see their own business data
-- (Assuming user authenticates and the policy checks auth.uid() against business user_id)
-- Note: Simplified for quick start. In production, policies should be more granular.

CREATE POLICY "Users can access their own business" ON public.businesses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access sales for their business" ON public.sales
    FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can access expenses for their business" ON public.expenses
    FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));    

CREATE POLICY "Users can access inventory for their business" ON public.inventory
    FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can access deliveries for their business" ON public.deliveries
    FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can access insights for their business" ON public.insights
    FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));    

CREATE POLICY "Users can access agent logs for their business" ON public.agent_logs
    FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
