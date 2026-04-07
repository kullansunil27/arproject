/*
  # Create Smart AR Shopping Database Schema

  ## Overview
  Migration to create the core tables for the Smart AR Shopping application with 
  proper security and relationships.

  ## New Tables
  
  ### `users`
  - `id` (uuid, primary key) - Unique user identifier
  - `name` (text, required) - User's full name
  - `email` (text, unique, required) - User's email address
  - `password` (text, required) - Hashed password
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `name` (text, required) - Product name
  - `category` (text, required) - Product category (Accessories, Furniture, Home Decor, Electronics)
  - `price` (numeric, required) - Product price
  - `description` (text) - Product description
  - `image` (text) - Product image URL
  - `ar_model` (text) - Path to AR model file
  - `views` (integer, default 0) - Number of views for analytics
  - `created_at` (timestamptz) - Product creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - RLS enabled on all tables
  - Users can read their own data
  - Users can update their own profile
  - Products are publicly readable
  - Only authenticated users can view products (can be adjusted for public access)
  
  ## Notes
  - All timestamps use timestamptz for timezone support
  - Email addresses are unique and indexed
  - Category field uses check constraint for valid values
  - Views counter for analytics tracking
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Accessories', 'Furniture', 'Home Decor', 'Electronics')),
  price numeric NOT NULL CHECK (price >= 0),
  description text DEFAULT '',
  image text DEFAULT '',
  ar_model text DEFAULT '',
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow user registration"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for products table
-- Products are publicly readable for catalog browsing
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();