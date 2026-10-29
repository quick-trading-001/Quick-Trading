// 100% AUTO PAYMENT STORE
let payments = global.paymentsStore || {};
global.paymentsStore = payments;

export default async function handler(req,res){
 // M-PESA CALLBACK - Safaricom hutuma hapa baada ya mteja kuweka PIN
 if(req.method==='POST'){
   try{
     let body=req.body;
     if(typeof body === 'string') body=JSON.parse(body);
     let stkCallback=body.Body?.stkCallback;
     if(!stkCallback) return res.json({ResultCode:0, ResultDesc:'OK'});
     
     if(stkCallback.ResultCode===0){
       let items=stkCallback.CallbackMetadata?.Item||[];
       let getVal=(n)=>items.find(i=>i.Name===n)?.Value;
       let amount=getVal('Amount');
       let receipt=getVal('MpesaReceiptNumber');
       let phone=getVal('PhoneNumber');
       
       let pack = stkCallback.CheckoutRequestID ? "QT" : "QT";
       
       payments[phone]={paid:true, amount, receipt, pack, time:Date.now()};
       // pia weka 07 version
       if(phone.toString().startsWith('254')){
         payments['0'+phone.toString().substring(3)]={paid:true, amount, receipt, pack, time:Date.now()};
       }
       console.log('PAID AUTO:', phone, amount, receipt);
     }
   }catch(e){ console.log('Callback error', e.message); }
   return res.json({ResultCode:0, ResultDesc:'Accepted'});
 }
 
 // FRONTEND INA-CHECK HAPA KILA 3 SEC - 100% AUTO
 if(req.method==='GET'){
   let phone=req.query.phone;
   if(phone){
     let p=payments[phone] || payments['254'+phone.substring(1)] || payments['0'+phone.substring(1)] || null;
     if(p && p.paid) return res.json({paid:true, ...p});
     return res.json({paid:false});
   }
   return res.json({ok:true, total:Object.keys(payments).length, payments});
 }
        }
