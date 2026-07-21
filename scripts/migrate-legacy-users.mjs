import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const applyChanges = process.argv.includes('--apply');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error(
    'Mancano NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY. ' +
      'Aggiungili a .env.local; la secret key deve restare solo sul server.',
  );
  process.exit(1);
}

if (
  secretKey === process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  secretKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  secretKey.startsWith('sb_publishable_')
) {
  console.error('SUPABASE_SECRET_KEY non può contenere una chiave pubblica.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

const { data: legacyProfiles, error: legacyError } = await supabase
  .from('users')
  .select('id,email,password,full_name,username')
  .is('auth_user_id', null)
  .not('password', 'is', null)
  .order('id');

if (legacyError) {
  console.error(`Impossibile leggere i profili legacy: ${legacyError.message}`);
  process.exit(1);
}

if (!legacyProfiles?.length) {
  console.log('Nessun profilo legacy da migrare.');
  process.exit(0);
}

for (const profile of legacyProfiles) {
  const supportedHash =
    /^\$2[aby]\$/.test(profile.password) || profile.password.startsWith('$argon2');

  if (!supportedHash) {
    console.error(`Il profilo #${profile.id} usa un formato hash non supportato.`);
    process.exit(1);
  }
}

const legacyEmails = new Set(
  legacyProfiles.map((profile) => profile.email.toLowerCase()),
);
const existingConflicts = [];

for (let page = 1; ; page += 1) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page,
    perPage: 1000,
  });

  if (error) {
    console.error(`Impossibile verificare gli account Auth: ${error.message}`);
    process.exit(1);
  }

  for (const user of data.users) {
    if (user.email && legacyEmails.has(user.email.toLowerCase())) {
      existingConflicts.push(user.email.toLowerCase());
    }
  }

  if (data.users.length < 1000) break;
}

if (existingConflicts.length > 0) {
  console.error(
    `${existingConflicts.length} profili legacy hanno già un account Auth non collegato. ` +
      'Migrazione interrotta per non sovrascrivere credenziali esistenti.',
  );
  process.exit(1);
}

console.log(`Profili legacy pronti: ${legacyProfiles.length}.`);

if (!applyChanges) {
  console.log('Controllo completato senza modifiche. Riesegui con --apply per importarli.');
  process.exit(0);
}

let migrated = 0;

for (const profile of legacyProfiles) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: profile.email,
    password_hash: profile.password,
    email_confirm: true,
    user_metadata: {
      full_name: profile.full_name,
      username: profile.username,
    },
  });

  if (error || !data.user) {
    console.error(`Migrazione del profilo #${profile.id} non riuscita: ${error?.message}`);
    process.exit(1);
  }

  const { error: profileError } = await supabase
    .from('users')
    .update({ auth_user_id: data.user.id, password: null })
    .eq('id', profile.id)
    .eq('email', profile.email);

  if (profileError) {
    console.error(
      `Account Auth creato, ma collegamento del profilo #${profile.id} non riuscito: ` +
        profileError.message,
    );
    process.exit(1);
  }

  migrated += 1;
  console.log(`Profilo #${profile.id} migrato.`);
}

const { count: remaining, error: verifyError } = await supabase
  .from('users')
  .select('id', { count: 'exact', head: true })
  .is('auth_user_id', null)
  .not('password', 'is', null);

if (verifyError) {
  console.error(`Migrazione eseguita, ma verifica non riuscita: ${verifyError.message}`);
  process.exit(1);
}

console.log(`Migrazione completata: ${migrated} profili importati, ${remaining ?? 0} rimasti.`);
