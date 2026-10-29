export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const { amount, phone, package: pkg } = req.body;
  if (!amount || !phone) return res.status(400).json({ success: false, message: 'Weka amount na phone' });

  // STK PUSH - Daraja / M-Pesa
  // Kwa sasa tuna-simulate - weka Daraja credentials zako hapa baadaye
  console.log(`STK Push ${amount} to ${phone} for ${pkg}`);
  
  // Save payment attempt to check in callback
  global.payments = global.payments || {};
  global.payments[phone] = { paid: false, amount, package: pkg, time: Date.now() };
  
  // Simulate STK sent - kwa production, hapa ndipo Daraja API inaitwa
  return res.json({ 
    success: true, 
    message: `STK Push ${amount} KES imetumwa kwa ${phone} - Weka PIN!`,
    checkoutId: 'test_'+Date.now()
  });
   }
