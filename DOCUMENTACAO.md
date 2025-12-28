# Documentação Técnica - Mobile

## Visão Geral
O Gestão Atípicos utiliza **Capacitor** para oferecer uma experiência nativa em Android, mantendo a base de código web (React + Vite). Além disso, funciona como **PWA** (Progressive Web App) para instalação via navegador.

## Estrutura do Projeto Mobile
- **`android/`**: Contém o projeto nativo Android gerado pelo Capacitor.
- **`capacitor.config.ts`**: Configurações do Capacitor.
- **`assets/`**: Pasta para ícones e splash screens (`icon.png`, `splash.png`).

## Guia de Build e Deploy (Android)

### Pré-requisitos
1. **Node.js** e **npm** instalados.
2. **Android Studio** configurado (com SDK e Build Tools).
3. **Java (JDK)** configurado (geralmente incluso no Android Studio).

### Passo a Passo para Gerar APK

1. **Build da Aplicação Web**
   Gera os arquivos estáticos na pasta `dist/`.
   ```bash
   npm run build
   ```
   > **Importante:** Verifique se o arquivo `.env` contém `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` antes do build.

2. **Sincronização com Capacitor**
   Copia os arquivos de `dist/` para `android/app/src/main/assets/public/`.
   ```bash
   npx cap sync
   ```

3. **Geração de Ícones e Splash Screen**
   Gera recursos para todas as densidades de tela a partir de `assets/icon.png` e `assets/splash.png`.
   ```bash
   npx @capacitor/assets generate --android
   ```

4. **Compilação do APK (Debug)**
   Compila o projeto nativo e gera o arquivo `.apk`.
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   **Saída:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Distribuição
Para disponibilizar o download direto no site:
1. Copie o APK gerado para a pasta `public/` do projeto web.
2. Renomeie para `GestaoAtipicos.apk`.
3. Faça o deploy da aplicação web.

O botão "Instalar App" na tela de login detectará dispositivos Android e baixará este arquivo automaticamente se a instalação PWA não for acionada.