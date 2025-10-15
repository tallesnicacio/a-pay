/**
 * Script para testar o fluxo completo de autenticação
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Carregar .env
config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

console.log('🔍 Testando autenticação...\n');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('ANON_KEY (primeiros 20 chars):', supabaseAnonKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const testEmail = 'tallesteste@gmail.com';
  const testPassword = 'senha123'; // Troque pela senha correta

  try {
    console.log(`📧 Tentando login com: ${testEmail}\n`);

    // 1. Fazer login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('❌ Erro no login Supabase Auth:', authError.message);
      return;
    }

    console.log('✅ Login Supabase Auth bem-sucedido!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);
    console.log('   Token (primeiros 30 chars):', authData.session?.access_token.substring(0, 30) + '...\n');

    // 2. Buscar dados do usuário com a query que o frontend usa
    console.log('📊 Buscando dados do usuário na tabela users...\n');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        active,
        user_roles (
          id,
          role,
          establishment_id,
          permissions,
          establishment:establishments (
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('❌ Erro ao buscar dados do usuário:', userError);
      console.error('   Código:', userError.code);
      console.error('   Detalhes:', userError.details);
      console.error('   Mensagem:', userError.message);
      return;
    }

    console.log('✅ Dados do usuário carregados com sucesso!\n');
    console.log('📋 Dados completos:');
    console.log(JSON.stringify(userData, null, 2));

    // 3. Verificar estrutura dos dados
    console.log('\n🔍 Análise dos dados:');
    console.log(`   Nome: ${userData.name}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Ativo: ${userData.active}`);
    console.log(`   Número de roles: ${userData.user_roles?.length || 0}`);

    if (userData.user_roles && userData.user_roles.length > 0) {
      console.log('\n   Roles:');
      userData.user_roles.forEach((role: any, index: number) => {
        console.log(`     ${index + 1}. ${role.role}`);
        console.log(`        - Establishment ID: ${role.establishment_id}`);
        console.log(`        - Establishment: ${role.establishment?.name || 'N/A'}`);
        console.log(`        - Slug: ${role.establishment?.slug || 'N/A'}`);
        console.log(`        - Permissions: ${role.permissions ? 'Sim' : 'Não'}`);
      });
    }

    console.log('\n✅ Teste de autenticação concluído com sucesso!');

    // 4. Fazer logout
    await supabase.auth.signOut();
    console.log('🚪 Logout realizado.');

  } catch (error: any) {
    console.error('❌ Erro inesperado:', error);
    console.error('   Stack:', error.stack);
  }
}

testLogin();
