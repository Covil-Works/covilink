# Diretrizes e Regras de Desenvolvimento (AGENTS.md)

Este documento estabelece as regras obrigatórias de arquitetura, CSS e prevenção de regressões no projeto **covilink**. Todo agente e desenvolvedor DEVE seguir estas regras rigorosamente.

---

## 1. Prevenção de Tela Branca (Anti-White Screen of Death)

O erro de tela branca ocorre quando há falha de hidratação, exceções não tratadas no cliente ou falta de estilização padrão no HTML/Body do navegador.

### Regras Obrigatórias:
1. **Fundo Escuro Nativo no HTML e Body**:
   - `html` e `body` em `app/layout.tsx` e `app/globals.css` DEVEM possuir explicitamente `bg-[#08090d] text-gray-100 dark`.
   - Nunca depender exclusivamente de variáveis CSS para a cor inicial da tela (evita flash branco durante o carregamento de scripts ou falha de CSS).
2. **Error Boundaries Ativos**:
   - Manter sempre `app/error.tsx`, `app/global-error.tsx` e `app/not-found.tsx` implementados com visual dark e botões de recuperação.
3. **Defensividade Total nos Dados (Null Safety)**:
   - **NUNCA** chamar métodos de array (`.map`, `.filter`, `.reduce`, `.slice`) sem garantir que a variável é um array:
     ```tsx
     const safeList = Array.isArray(items) ? items : [];
     ```
   - Todo objeto lido do servidor ou de arquivos `data/*.json` DEVE passar por funções de sanitização (`sanitizeProfile`, `sanitizeLinks`, `sanitizeSocials`) com fallbacks seguros.
4. **Resiliência no Next.js Server Components**:
   - Em `app/page.tsx`, leituras de dados devem estar envelopadas em blocos `try/catch` com fallback para `INITIAL_*` em caso de erro no disco/cache.

---

## 2. Contenção Rigorosa de Imagens (Anti-Image Overflow)

O bug em que a foto de perfil ocupa a tela inteira ocorre quando a imagem do avatar é reaproveitada indevidamente como banner de capa ou quando elementos `<img>` escapam dos limites do container por ausência de altura, largura ou `overflow-hidden`.

### Regras Obrigatórias:
1. **Separação Estrita entre Capa e Avatar**:
   - **NUNCA** usar a foto do avatar (`avatarUrl`) como fallback para a foto de capa (`coverImageUrl`):
     ```tsx
     // ❌ ERRADO (Faz a foto do perfil ocupar o topo/tela toda se a capa não existir):
     const safeCover = profile.coverImageUrl || profile.avatarUrl;

     // ✅ CORRETO (Se não houver capa, usa gradiente escuro elegante):
     const hasCustomCover = Boolean(profile.coverImageUrl && profile.coverImageUrl.trim() !== '' && profile.coverImageUrl !== profile.avatarUrl);
     ```
2. **Containers Bounded e Rígidos para Imagens**:
   - Todo container de imagem DEVE ter:
     - Dimensões explícitas (`w-... h-...` ou aspect ratio fixo).
     - `relative` e `overflow-hidden`.
     - `shrink-0` em layouts flex para evitar distorção.
3. **Tratamento de Imagem Quebrada (`onError`)**:
   - Todas as tags `<img>` dinâmicas DEVEM possuir handler `onError` para evitar ícones de imagem quebrada ou colapso do layout:
     ```tsx
     <img
       src={imageSrc}
       alt={title}
       className="w-full h-full object-cover"
       onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
     />
     ```
4. **Nunca Renderizar Tags com `src` Vazio**:
   - Verificar se `item.image && item.image.trim() !== ''` antes de renderizar a tag `<img>`.
5. **CSS Base Universal em `app/globals.css`**:
   - Manter a regra universal no `@layer base`:
     ```css
     img, svg, video, canvas, audio, iframe, embed, object {
       display: block;
       max-width: 100%;
     }
     img {
       height: auto;
     }
     ```

---

## 3. Encaixe Mobile Perfeito e Bloqueio de Rolagem Lateral (Anti-Horizontal Scroll)

A página DEVE se encaixar perfeitamente na largura da tela de qualquer celular sem permitir qualquer rolagem lateral (scroll horizontal).

### Regras Obrigatórias:
1. **Bloqueio de Overflow Horizontal Global**:
   - `html` e `body` DEVEM possuir `overflow-x: hidden; width: 100%; max-width: 100vw;`.
   - `box-sizing: border-box` ativo globalmente em todos os elementos (`*, *::before, *::after`).
2. **Contenção de Efeitos de Luz de Fundo (Background Glows)**:
   - Todo brilho/aura decorativa em `position: absolute` ou `fixed` DEVE estar contido em um wrapper com `overflow-hidden w-full max-w-full pointer-events-none`.
   - Nunca usar coordenadas negativas ou larguras em pixels que ultrapassem a viewport sem `overflow: hidden`.
3. **Container Centralizado Mobile-First**:
   - O `<main>` do link portal deve possuir `w-full max-w-md px-4 overflow-x-hidden`.
   - Animações e transições de toque (`whileTap`, `whileHover`) devem ser sutis para não expandir além de 100% da largura da tela no mobile.

---

## 4. Integridade do Painel Administrativo (`/admin`)

1. **Edição do Perfil**:
   - Permitir que o usuário controle a visibilidade individual dos elementos (`showHandle`, `showBio`, `showContactEmail`).
   - Permitir que o usuário deixe o campo de capa vazio sem forçar o preenchimento automático com fotos antigas.
   - O preview ao vivo deve respeitar o comportamento idêntico da página pública.
2. **Criação e Modificação de Botões**:
   - Tipos de botões disponíveis:
     - `no-photo`: Botão simples sem foto.
     - `left-thumb`: Miniatura na lateral esquerda (`w-12 h-12`).
     - `card-photo`: Card visual grande (`h-48`).
     - `cta-primary`: Botão de destaque principal.
   - Ao alterar o tipo para `no-photo`, a imagem não deve ser renderizada na página pública.
   - Suporte a tag/selo opcional no canto (`badge`, ex: *"Populares"*, *"Destaque"*) com seletor de cores (`badgeColor`, presets ou cor hexadecimal customizada), editável no painel `/admin`.
3. **Padrão Visual do Efeito de Blur nos Botões/Cards**:
   - O overlay de revelação em botões com imagem borrada (`hasBlur`) DEVE exibir o ícone (`EyeOff`) diretamente em **branco** com sombra suave (`drop-shadow`), **sem círculo ou moldura de fundo** atrás dele.
   - O texto explicativo (campo `blurText` editável no painel `/admin`, com fallback para *"Clique para ver a foto"*) **NÃO deve ter fundo de pílula** (`rounded-full`, borda ou background sólido), devendo ser renderizado diretamente como texto limpo e legível sobre o backdrop.
4. **Armazenamento Seguro em `data/`**:
   - Usar gravação atômica (`.tmp` seguido de `rename`) para prevenir corrupção de arquivos JSON durante escritas concorrentes.

---

## 5. Checklist de Verificação Antes de Finalizar Qualquer Tarefa

- [ ] A página inicial (`/`) não possui nenhuma rolagem horizontal (scroll lateral bloqueado em qualquer largura de tela)?
- [ ] O layout se encaixa perfeitamente na largura do celular (`max-w-md` centralizado com `px-4`)?
- [ ] A página inicial carrega instantaneamente sem tela branca ou flash claro?
- [ ] A foto de perfil (`avatarUrl`) permanece no círculo de 96px/112px e NÃO se espalha pela tela?
- [ ] Quando `coverImageUrl` está vazia, o topo exibe um gradiente dark em vez da foto do perfil?
- [ ] Os botões com blur possuem ícone branco sem círculo atrás e texto sem fundo de pílula?
- [ ] O painel administrativo (`/admin`) permite salvar e alternar visibilidade sem erros?
- [ ] O comando `npm run build` compila com sucesso (`0 errors, 0 warnings`)?
