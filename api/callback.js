export default async function handler(req, res) {
  const { phone } = req.query;
  if (!phone) return res.json({ paid: false });
  
  global.payments = global.payments || {};
  let payment = global.payments[phone];
  
  // SIMULATION - Baada ya 10 seconds, ina-mark kama paid
  // Kwa production, hii ina-check kutoka M-Pesa Daraja callback
  if (payment) {
    let elapsed = Date.now() - payment.time;
    if (elapsed > 8000) { // 8 seconds baada ya STK
      payment.paid = true;
      payment.receipt = 'QT'+Math.floor(Math.random()*1000000);
      return res.json({ paid: true, receipt: payment.receipt, package: payment.package });
    }
  }
  
  return res.json({ paid: false });
                                        }
