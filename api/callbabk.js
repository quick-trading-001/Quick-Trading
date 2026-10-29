let payments = global.paymentsStore || {};
global.paymentsStore = payments;

export default async function handler(req,res){
 if(req.method==='POST'){
   try{
     let body=req.body;
     if(typeof body === 'string') body=JSON.parse(body);
     let stkCallback=body.Body?.stkCallback;
     if(!stkCallback) return res.json({ResultCode:0, ResultDesc:'OK'});
     if(stkCallback.ResultCode===0){
       let items=stkCallback.CallbackMetadata?.Item||[];
       let getVal=(n)=>items.find(i=>i.Name===n)?.Value;
       let phone=getVal('PhoneNumber');
       payments[phone]={paid:true, amount:getVal('Amount'), receipt:getVal('MpesaReceiptNumber'), time:Date.now()};
       if(phone.toString().startsWith('254')){
         payments['0'+phone.toString().substring(3)]=payments[phone];
       }
     }
   }catch(e){}
   return res.json({ResultCode:0, ResultDesc:'Accepted'});
 }
 if(req.method==='GET'){
   let phone=req.query.phone;
   if(phone){
     let p=payments[phone] || payments['254'+phone.substring(1)] || null;
     if(p && p.paid) return res.json({paid:true, ...p});
     return res.json({paid:false});
   }
   return res.json({ok:true, total:Object.keys(payments).length});
 }
         }
