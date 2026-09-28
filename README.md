# Fale Confiante

Aplicação mobile-first para treino diário de comunicação e oratória.

## O que já está implementado

A aplicação tem um programa de 30 dias com 30 lições diferentes, área de aprendizagem, leitura das lições por voz com Web Speech API em pt-PT, gravação de exercícios com MediaRecorder, reprodução da gravação, resultados de treino, treinador virtual em modo local, biblioteca e página de progresso.

O progresso funciona localmente quando o Supabase não está configurado. Quando o Supabase está configurado e o schema foi aplicado, a autenticação e os dados passam a poder ser guardados por utilizador.

## Supabase

1. Cria ou liga um projecto Supabase.
2. Define VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY nas variáveis de ambiente da aplicação.
3. Executa supabase/schema.sql no SQL Editor do Supabase.
4. Configura no Supabase as regras de confirmação de email conforme o fluxo pretendido.

O schema cria profiles, lesson_progress, training_sessions e coach_messages, com Row Level Security baseada em auth.uid().

## Próximas fases

Ligar os dados do dashboard directamente ao Supabase em todos os fluxos, adicionar análise real da voz através de um endpoint seguro no servidor, melhorar o treinador com IA e adicionar armazenamento seguro das gravações quando necessário.