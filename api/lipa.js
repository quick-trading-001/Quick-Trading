export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({success:false, message:'Method not allowed'});
 const {amount, phone} = req.body;
 try{
   const consumerKey = process.env.MPESA_CONSUMER_KEY;
   const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
   const shortCode = process.env.MPESA_SHORTCODE || '174379';
   const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
   
   if(!consumerKey || !consumerSecret){
     return res.json({success:false, message:'Weka MPESA keys Vercel Settings!'});
   }

   const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
   const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',{
     headers:{ Authorization:`Basic ${auth}` }
   });
   const tokenData = await tokenRes.json();
   
   if(!tokenData.access_token){
     return res.json({success:false, message:'Token failed: '+JSON.stringify(tokenData)});
   }

   const timestamp = new Date().toISOString().replace(/[-T:.Z]/g,'').slice(0,14);
   const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
   
   const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',{
     method:'POST',
     headers:{
       Authorization:`Bearer ${tokenData.access_token}`,
       'Content-Type':'application/json'
     },
     body:JSON.stringify({
       BusinessShortCode: shortCode,
       Password: password,
       Timestamp: timestamp,
       TransactionType: "CustomerPayBillOnline",
       Amount: Number(amount),
       PartyA: phone,
       PartyB: shortCode,
       PhoneNumber: phone,
       CallBackURL: `https://${req.headers.host}/api/callback`,
       AccountReference: "QT",
       TransactionDesc: "QT Payment"
     })
   });
   
   const stkData = await stkRes.json();
   
   if(stkData.ResponseCode === '0'){
     return res.json({success:true, message:'STK Imetumwa!'});
   } else {
     return res.json({success:false, message: stkData.errorMessage || stkData.ResponseDescription || 'STK failed'});
   }
 }catch(e){
   return res.json({success:false, message: e.message});
 }
 }
