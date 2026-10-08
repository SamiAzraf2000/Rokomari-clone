const fs = require('fs');

async function generateSQL() {
  const res = await fetch('https://dummyjson.com/products?limit=100');
  const data = await res.json();
  
  let sql = `-- Drop existing table if any
DROP TABLE IF EXISTS products;

-- Create the products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  price NUMERIC,
  old_price NUMERIC,
  discount NUMERIC,
  rating NUMERIC,
  reviews INTEGER,
  badge TEXT,
  thumbnail TEXT,
  is_visible BOOLEAN DEFAULT true
);

-- Insert 100 products
INSERT INTO products (title, brand, category, price, old_price, discount, rating, reviews, badge, thumbnail, is_visible) VALUES
`;

  const values = data.products.map(p => {
    const title = p.title.replace(/'/g, "''");
    const brand = (p.brand || p.category).replace(/'/g, "''");
    const category = p.category.replace(/'/g, "''");
    const price = Math.round(p.price * 110);
    const old_price = Math.round(p.price * 110 / (1 - p.discountPercentage / 100));
    const discount = Math.round(p.discountPercentage);
    const rating = p.rating || 0;
    const reviews = p.reviews ? p.reviews.length * 10 + 15 : p.stock;
    const badge = p.rating > 4.8 ? 'best' : p.stock < 10 ? 'new' : '';
    const thumbnail = p.thumbnail.replace(/'/g, "''");
    
    return `('${title}', '${brand}', '${category}', ${price}, ${old_price}, ${discount}, ${rating}, ${reviews}, '${badge}', '${thumbnail}', true)`;
  });

  sql += values.join(',\n') + ';\n\nALTER TABLE products DISABLE ROW LEVEL SECURITY;\n';
  fs.writeFileSync('seed.sql', sql);
  console.log('seed.sql generated!');
}

generateSQL();
