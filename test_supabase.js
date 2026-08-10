const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key) acc[key] = val.join('=').trim();
  return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const payload = {
    user_id: '12345678-1234-1234-1234-123456789012',
    event_id: undefined, // fake uuid
    format: 'photobook',
    finish: 'matte',
    shipping_name: 'Test',
    shipping_address: '123 Test St',
    shipping_city: 'Test City',
    shipping_zip: '12345',
    status: 'pending'
  };

  const { data, error } = await supabase.from('orders').insert([payload]);
  console.log("Error:", error);
}

testInsert();
