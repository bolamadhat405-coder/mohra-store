import { Router } from 'express';
import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server';
import { q } from '../db.js';
import { optionalAuth, requireAdmin, createSession, audit } from '../auth.js';
import { HttpError } from '../lib/errors.js';
import { publicUser } from '../lib/user.js';

const r=Router();
const RP_NAME=process.env.WEBAUTHN_RP_NAME||'BOLA TECH';
function rpID(req){ return process.env.WEBAUTHN_RP_ID || String(req.hostname).split(':')[0]; }
function origin(req){ return process.env.WEBAUTHN_ORIGIN || `${req.protocol}://${req.get('host')}`; }
function saveChallenge(userId,challenge,kind){ return q(`INSERT INTO edu_passkey_challenges(user_id,challenge,kind,expires_at) VALUES($1,$2,$3,now()+interval '5 minutes') ON CONFLICT(user_id) DO UPDATE SET challenge=EXCLUDED.challenge,kind=EXCLUDED.kind,expires_at=EXCLUDED.expires_at`,[userId,challenge,kind]); }

r.get('/passkeys/status', optionalAuth, async (req,res)=>{
 if(!req.user) return res.json({authenticated:false});
 const c=(await q('SELECT count(*)::int count FROM edu_passkeys WHERE user_id=$1',[req.user.id])).rows[0].count;
 res.json({authenticated:true,count:c,required:process.env.REQUIRE_ADMIN_PASSKEY==='true' && req.user.role==='admin'});
});

r.post('/passkeys/register/options', optionalAuth, async (req,res)=>{
 if(!req.user || req.user.role!=='admin') throw new HttpError(403,'ADMIN_ONLY');
 const creds=(await q('SELECT credential_id,transports FROM edu_passkeys WHERE user_id=$1',[req.user.id])).rows;
 const options=await generateRegistrationOptions({rpName:RP_NAME,rpID:rpID(req),userName:req.user.email,userDisplayName:req.user.name,userID:Buffer.from(String(req.user.id)),attestationType:'none',authenticatorSelection:{residentKey:'preferred',userVerification:'required',authenticatorAttachment:'platform'},excludeCredentials:creds.map(x=>({id:x.credential_id,transports:x.transports}))});
 await saveChallenge(req.user.id,options.challenge,'register'); res.json(options);
});

r.post('/passkeys/register/verify', optionalAuth, async (req,res)=>{
 if(!req.user || req.user.role!=='admin') throw new HttpError(403,'ADMIN_ONLY');
 const row=(await q("SELECT challenge FROM edu_passkey_challenges WHERE user_id=$1 AND kind='register' AND expires_at>now()",[req.user.id])).rows[0]; if(!row) throw new HttpError(400,'PASSKEY_CHALLENGE_EXPIRED');
 const v=await verifyRegistrationResponse({response:req.body,expectedChallenge:row.challenge,expectedOrigin:origin(req),expectedRPID:rpID(req)});
 if(!v.verified || !v.registrationInfo) throw new HttpError(400,'PASSKEY_VERIFY_FAILED');
 const i=v.registrationInfo; const id=typeof i.credential.id==='string'?i.credential.id:Buffer.from(i.credential.id).toString('base64url');
 await q('INSERT INTO edu_passkeys(user_id,credential_id,public_key,counter,transports,device_name) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(credential_id) DO UPDATE SET public_key=EXCLUDED.public_key,counter=EXCLUDED.counter,transports=EXCLUDED.transports',[req.user.id,id,Buffer.from(i.credential.publicKey),i.credential.counter,i.credential.transports||[],String(req.body.deviceName||'جهاز الأدمن').slice(0,80)]);
 await q('DELETE FROM edu_passkey_challenges WHERE user_id=$1',[req.user.id]); audit(req.user,'PASSKEY_REGISTER','user',req.user.id); res.json({ok:true});
});

r.post('/passkeys/auth/options', async (req,res)=>{
 const identifier=String(req.body?.identifier||req.body?.email||'').trim();
 if(!identifier) throw new HttpError(400,'ADMIN_ID_REQUIRED');
 const u=(await q("SELECT id FROM users WHERE (email=$1 OR admin_id=$1) AND is_active=true AND role='admin'",[identifier.toLowerCase()])).rows[0];
 if(!u) throw new HttpError(401,'INVALID_CREDENTIALS');
 const creds=(await q('SELECT credential_id,transports FROM edu_passkeys WHERE user_id=$1',[u.id])).rows; if(!creds.length) throw new HttpError(400,'NO_PASSKEY');
 const options=await generateAuthenticationOptions({rpID:rpID(req),userVerification:'required',allowCredentials:creds.map(x=>({id:x.credential_id,transports:x.transports}))});
 await saveChallenge(u.id,options.challenge,'auth'); res.json({options,userId:u.id});
});

r.post('/passkeys/auth/verify', async (req,res)=>{
 const uid=Number(req.body?.userId); if(!uid) throw new HttpError(400,'INVALID_INPUT');
 const row=(await q("SELECT challenge FROM edu_passkey_challenges WHERE user_id=$1 AND kind='auth' AND expires_at>now()",[uid])).rows[0]; if(!row) throw new HttpError(400,'PASSKEY_CHALLENGE_EXPIRED');
 const credId=String(req.body?.response?.id||'');
 const a=(await q('SELECT * FROM edu_passkeys WHERE user_id=$1 AND credential_id=$2',[uid,credId])).rows[0]; if(!a) throw new HttpError(401,'PASSKEY_NOT_FOUND');
 const v=await verifyAuthenticationResponse({response:req.body.response,expectedChallenge:row.challenge,expectedOrigin:origin(req),expectedRPID:rpID(req),credential:{id:a.credential_id,publicKey:new Uint8Array(a.public_key),counter:Number(a.counter),transports:a.transports}});
 if(!v.verified) throw new HttpError(401,'PASSKEY_VERIFY_FAILED');
 await q('UPDATE edu_passkeys SET counter=$2,last_used_at=now() WHERE id=$1',[a.id,v.authenticationInfo.newCounter]); await q('DELETE FROM edu_passkey_challenges WHERE user_id=$1',[uid]);
 const u=(await q('SELECT * FROM users WHERE id=$1 AND is_active=true',[uid])).rows[0]; if(!u) throw new HttpError(401,'ACCOUNT_DISABLED');
 await createSession(req,res,u,'passkey'); audit(u,'PASSKEY_LOGIN','user',u.id); res.json({user:publicUser(u)});
});
export default r;
