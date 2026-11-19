const fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto');
class Credentials{
 constructor(dir,safeStorage){this.dir=dir;this.safe=safeStorage;fs.mkdirSync(dir,{recursive:true});}
 filename(id){return path.join(this.dir,Buffer.from(id).toString('hex')+'.bin');}
 put(id,value){
  if(!this.safe.isEncryptionAvailable())throw Error('系统凭据加密不可用，未保存明文');
  const encrypted=this.safe.encryptString(value);if(this.safe.decryptString(encrypted)!==value)throw Error('凭据加密验证失败');
  const file=this.filename(id);fs.writeFileSync(file+'.tmp',encrypted);fs.renameSync(file+'.tmp',file);return id;
 }
 get(id){return this.safe.decryptString(fs.readFileSync(this.filename(id)));}
 has(id){return !!id&&fs.existsSync(this.filename(id));}
 sanitize(snapshot){
  const copy=structuredClone(snapshot);
  const visit=(value,location)=>{
   if(!value||typeof value!=='object')return;
   for(const key of Object.keys(value)){
    if(key==='apiKey'){
     const secret=value[key];
     if(typeof secret==='string'&&secret&&!/demo-placeholder|not-connected|•/.test(secret)){
      if(!this.has(value.credentialRef)||this.get(value.credentialRef)!==secret)value.credentialRef=this.put('key:'+randomUUID(),secret);
     }
     delete value.apiKey;value.hasCredential=this.has(value.credentialRef);
    }else if(/^(authorization|access_token|customHeaders)$/i.test(key)&&value[key]){const id='secret:'+randomUUID();this.put(id,typeof value[key]==='string'?value[key]:JSON.stringify(value[key]));delete value[key];value[key+'Ref']=id;}
    else visit(value[key],location+'.'+(value[key]?.id??key));
   }
   if(value.credentialRef)value.hasCredential=this.has(value.credentialRef);
  };
  visit(copy,'workspace');return copy;
 }
}
module.exports={Credentials};
