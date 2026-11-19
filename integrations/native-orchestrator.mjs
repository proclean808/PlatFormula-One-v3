import {randomUUID} from 'node:crypto';
export function chooseRoute(request, inventory) {
 if (!request || !['s25','s26'].includes(request.device) || typeof request.capability !== 'string') throw Error('Invalid request');
 return inventory.filter(x=>x.device===request.device && x.capability===request.capability && x.verified===true && x.available===true).sort((a,b)=>(a.priority??100)-(b.priority??100))[0]??null;
}
export function plan(request,inventory){
 const route=chooseRoute(request,inventory);
 return {id:randomUUID(),timestamp:new Date().toISOString(),device:request.device,capability:request.capability,state:route?'AWAITING_AUTHORIZATION':'BLOCKED',route:route?.adapter??null,reason:route?'Requires signed authorization and independent verification':'No verified available adapter',executed:false,verified:false};
}
