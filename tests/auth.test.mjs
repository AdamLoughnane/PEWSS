import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import {betterAuth} from 'better-auth';
import {memoryAdapter} from 'better-auth/adapters/memory';
const modelSource=await readFile(new URL('../lib/admin/model.ts',import.meta.url),'utf8');
const encode=source=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const config=(await readFile(new URL('../lib/admin/auth-config.ts',import.meta.url),'utf8'))
 .replace('"./model"',JSON.stringify(encode(modelSource)))
 .replace('"better-auth/plugins"',JSON.stringify(import.meta.resolve('better-auth/plugins')))
 .replace('"@better-auth/passkey"',JSON.stringify(import.meta.resolve('@better-auth/passkey')));
const {authOptions}=await import(encode(config));
const email='adam.loughnane@ucc.ie';
const owner='08e4779b-748b-43f3-b83e-9c1df4ef2b5a';
function setup(){
 const db={pewss_auth_user:[{id:owner,name:'Test organiser',email,emailVerified:false,createdAt:new Date(),updatedAt:new Date()}],pewss_auth_session:[],pewss_auth_account:[],pewss_auth_verification:[],pewss_auth_passkey:[]};
 let code;
 const auth=betterAuth(authOptions(memoryAdapter(db),'test-secret-which-is-long-and-random-enough-123456789','https://pewss.org',async c=>{code=c}));
 const headers=new Headers({origin:'https://pewss.org'});
 const request=()=>auth.api.sendVerificationOTP({body:{email,type:'sign-in'},headers});
 const verify=otp=>auth.api.signInEmailOTP({body:{email,otp},headers,asResponse:true});
 return {db,auth,headers,request,verify,code:()=>code};
}
test('organiser OTP is hashed, single-use, and creates a secure revocable session',async()=>{
 const t=setup();await t.request();
 assert.match(t.code(),/^\d{8}$/);
 assert.ok(!t.db.pewss_auth_verification[0].value.includes(t.code()));
 assert.equal((await t.verify('000000000')).ok,false);
 const r=await t.verify(t.code());assert.equal(r.status,200);
 const cookie=r.headers.getSetCookie().find(c=>c.includes('session_token='));
 assert.match(cookie,/HttpOnly/i);assert.match(cookie,/Secure/i);assert.match(cookie,/SameSite=Lax/i);
 const h=new Headers({origin:'https://pewss.org',cookie:cookie.split(';')[0]});
 assert.equal((await t.auth.api.getSession({headers:h})).user.id,owner);
 assert.equal((await t.verify(t.code())).ok,false);
 await t.auth.api.signOut({headers:h});
 assert.equal(await t.auth.api.getSession({headers:h}),null);
});
test('expired codes, too many guesses, and unregistered users cannot sign in',async()=>{
 const t=setup();await t.request();
 t.db.pewss_auth_verification[0].expiresAt=new Date(Date.now()-1000);
 assert.equal((await t.verify(t.code())).ok,false);
 await t.request();const valid=t.code();
 for(let i=0;i<5;i++) assert.equal((await t.verify('not-the-code')).ok,false);
 assert.equal((await t.verify(valid)).ok,false);
 const other=await t.auth.api.signInEmailOTP({body:{email:'other@example.com',otp:valid},headers:t.headers,asResponse:true});
 assert.equal(other.ok,false);assert.equal(t.db.pewss_auth_user.length,1);
});
test('passkeys: only a freshly signed-in organiser can register, for pewss.org with Touch ID required',async()=>{
 const t=setup();
 const anon=await t.auth.api.generatePasskeyRegistrationOptions({headers:t.headers,asResponse:true});
 assert.equal(anon.ok,false);
 await t.request();const r=await t.verify(t.code());
 const cookie=r.headers.getSetCookie().find(c=>c.includes('session_token=')).split(';')[0];
 const h=new Headers({origin:'https://pewss.org',cookie});
 const ok=await t.auth.api.generatePasskeyRegistrationOptions({headers:h,asResponse:true});
 assert.equal(ok.status,200);
 const options=await ok.json();
 assert.equal(options.rp.id,'pewss.org');
 assert.equal(options.authenticatorSelection.userVerification,'required');
 assert.equal(options.authenticatorSelection.residentKey,'required');
 assert.ok(ok.headers.getSetCookie().some(c=>/passkey/.test(c)&&/HttpOnly/i.test(c)));
 // A session older than 15 minutes cannot add a passkey.
 t.db.pewss_auth_session[0].createdAt=new Date(Date.now()-16*60*1000);
 assert.equal((await t.auth.api.generatePasskeyRegistrationOptions({headers:h,asResponse:true})).status,403);
});
test('passkeys: sign-in options are issued for pewss.org and a forged response is rejected',async()=>{
 const t=setup();
 const r=await t.auth.api.generatePasskeyAuthenticationOptions({headers:t.headers,asResponse:true});
 assert.equal(r.status,200);
 const options=await r.json();
 assert.equal(options.rpId,'pewss.org');
 assert.equal(options.userVerification,'required');
 const challenge=r.headers.getSetCookie().find(c=>/passkey/.test(c)).split(';')[0];
 const h=new Headers({origin:'https://pewss.org',cookie:challenge});
 const forged={id:'abc',rawId:'abc',type:'public-key',clientExtensionResults:{},response:{clientDataJSON:'e30',authenticatorData:'AA',signature:'AA'}};
 const v=await t.auth.api.verifyPasskeyAuthentication({body:{response:forged},headers:h,asResponse:true});
 assert.equal(v.ok,false);
 assert.equal(v.headers.getSetCookie().some(c=>c.includes('session_token=')&&!/Max-Age=0/i.test(c)),false);
});
