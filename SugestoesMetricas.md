# Sugestões de Features e Melhorias Analíticas (Covilink)

Este documento reúne oportunidades e sugestões de evolução para o sistema de métricas do **covilink**, com foco em engajamento, marketing de influência, tomada de decisão e relatórios para criadores de conteúdo.

---

## 1. Comportamento e Funil de Atenção (UX & Engajamento)

* **Profundidade de Rolagem (*Scroll Depth* & *Drop-off Rate*):**
  * *O que analisa:* Percentual de visitantes que visualizaram apenas os primeiros botões versus quantos rolaram a tela até o final da página.
  * *Valor prático:* Permite saber se os links posicionados no rodapé estão recebendo atenção e ajuda a definir o número ideal de botões visíveis.
* **Métrica de Engajamento com Conteúdo Borrado (*Blur Reveal Rate*):**
  * *O que analisa:* Como o Covilink conta com cards de imagem com efeito de revelação (`hasBlur`), mede quantos visitantes clicaram no botão para **desfocar/ver a foto** versus quantos prosseguiram direto para o **link de destino**.
  * *Valor prático:* Quantifica a curiosidade gerada e o impacto da imagem antes da conversão externa.
* **Tempo Médio de Permanência (*Dwell Time*):**
  * *O que analisa:* Se o público toma a decisão rapidamente (3 a 5 segundos, padrão de stories) ou se explora a página com mais calma (20 a 30 segundos).

---

## 2. Marketing, Campanhas e Parâmetros UTM

* **Rastreamento de Campanhas UTM (`utm_source`, `utm_medium`, `utm_campaign`):**
  * *O que analisa:* Segmenta o tráfego a partir de parâmetros na URL compartilhada.
    * *Exemplos:*
      * `seusite.com/?utm_source=instagram_stories&utm_campaign=lancamento_marco`
      * `seusite.com/?utm_source=tiktok_bio`
  * *Valor prático:* Identifica com precisão qual story, vídeo do TikTok ou disparo de e-mail gerou mais acessos e conversões.
* **Repasse Automático de UTMs (*UTM Forwarding*):**
  * *O que analisa:* Ao clicar em um link externo (como checkout ou WhatsApp), preserva e anexa automaticamente as UTMs de entrada ao link de destino.
  * *Valor prático:* Permite que plataformas de pagamento (Hotmart, Kiwify, Eduzz, Stripe) identifiquem a campanha exata de origem da venda.

---

## 3. Audiência e Demografia Anônima

* **Origem Geográfica (País / Estado / Região):**
  * *O que analisa:* Distribuição geográfica dos acessos (ex: SP 45%, RJ 20%, Internacional 10%), capturada de forma anônima e sem armazenamento de dados pessoais (via headers de CDN/Edge).
  * *Valor prático:* Essencial para entender a concentração do público e identificar demanda em outros estados ou países.
* **Idioma Preferencial do Visitante:**
  * *O que analisa:* Idioma configurado no navegador/sistema operacional (`pt-BR`, `en-US`, `es`).
  * *Valor prático:* Auxilia na decisão de lançar produtos ou conteúdos bilíngues.

---

## 4. Inteligência, Picos e Otimização

* **Mapa de Calor de Horários (*Heatmap* de Melhores Momentos):**
  * *O que analisa:* Matriz semanal (7 dias × 24 horas) apontando os períodos de maior fluxo de acessos.
  * *Valor prático:* Indica o **melhor horário para publicar novos posts e stories**, sincronizando as postagens com o momento de pico de cliques na bio.
* **Alertas de "Link em Alta" (*Spike Detection*):**
  * *O que analisa:* Detecta aumentos súbitos e atípicos no volume de cliques de um botão específico (ex: +300% nas últimas 2 horas comparado à média móvel).
  * *Valor prático:* Avisa o criador em tempo real quando algum conteúdo viralizou.

---

## 6. Sugestão de Priorização (Roadmap Rápido)

| Prioridade | Funcionalidade | Esforço | Impacto |
| :--- | :--- | :--- | :--- |
| **Alta** | Rastreamento de Parâmetros UTM | Baixo | Alto |
| **Alta** | Mapa de Calor de Horários (*Heatmap*) | Médio | Alto |
| **Média** | Métrica de Revelação de Blur (*Blur Rate*) | Baixo | Médio |
| **Média** | Origem Geográfica por Estado/País | Médio | Alto |
| **Futura** | Relatório de Mídia Kit para Exportação | Médio | Alto |
| **Futura** | Testes A/B de Botões | Alto | Alto |


# PRA AGORA:
## 1. Comportamento e Funil de Atenção (UX & Engajamento)

* **Profundidade de Rolagem (*Scroll Depth* & *Drop-off Rate*):**
  * *O que analisa:* Percentual de visitantes que visualizaram apenas os primeiros botões versus quantos rolaram a tela até o final da página.
  * *Valor prático:* Permite saber se os links posicionados no rodapé estão recebendo atenção e ajuda a definir o número ideal de botões visíveis.
* **Métrica de Engajamento com Conteúdo Borrado (*Blur Reveal Rate*):**
  * *O que analisa:* Como o Covilink conta com cards de imagem com efeito de revelação (`hasBlur`), mede quantos visitantes clicaram no botão para **desfocar/ver a foto** versus quantos prosseguiram direto para o **link de destino**.
  * *Valor prático:* Quantifica a curiosidade gerada e o impacto da imagem antes da conversão externa.
* **Tempo Médio de Permanência (*Dwell Time*):**
  * *O que analisa:* Se o público toma a decisão rapidamente (3 a 5 segundos, padrão de stories) ou se explora a página com mais calma (20 a 30 segundos).

---

## 2. Marketing, Campanhas e Parâmetros UTM

* **Rastreamento de Campanhas UTM (`utm_source`, `utm_medium`, `utm_campaign`):**
  * *O que analisa:* Segmenta o tráfego a partir de parâmetros na URL compartilhada.
    * *Exemplos:*
      * `seusite.com/?utm_source=instagram_stories&utm_campaign=lancamento_marco`
      * `seusite.com/?utm_source=tiktok_bio`
  * *Valor prático:* Identifica com precisão qual story, vídeo do TikTok ou disparo de e-mail gerou mais acessos e conversões.
* **Repasse Automático de UTMs (*UTM Forwarding*):**
  * *O que analisa:* Ao clicar em um link externo (como checkout ou WhatsApp), preserva e anexa automaticamente as UTMs de entrada ao link de destino.
  * *Valor prático:* Permite que plataformas de pagamento (Hotmart, Kiwify, Eduzz, Stripe) identifiquem a campanha exata de origem da venda.

---

## 3. Audiência e Demografia Anônima

* **Origem Geográfica (País / Estado / Região):**
  * *O que analisa:* Distribuição geográfica dos acessos (ex: SP 45%, RJ 20%, Internacional 10%), capturada de forma anônima e sem armazenamento de dados pessoais (via headers de CDN/Edge).
  * *Valor prático:* Essencial para entender a concentração do público e identificar demanda em outros estados ou países.
* **Idioma Preferencial do Visitante:**
  * *O que analisa:* Idioma configurado no navegador/sistema operacional (`pt-BR`, `en-US`, `es`).
  * *Valor prático:* Auxilia na decisão de lançar produtos ou conteúdos bilíngues.

---

## 4. Inteligência, Picos e Otimização

* **Mapa de Calor de Horários (*Heatmap* de Melhores Momentos):**
  * *O que analisa:* Matriz semanal (7 dias × 24 horas) apontando os períodos de maior fluxo de acessos.
  * *Valor prático:* Indica o **melhor horário para publicar novos posts e stories**, sincronizando as postagens com o momento de pico de cliques na bio.
...

# PRA DEPOIS:

* **Testes A/B de Título, Ordem e Imagem:**
  * *O que analisa:* Divide o tráfego entre duas variações de botão (ex: *"Acessar Mentoria"* vs. *"Garantir Vaga VIP"*) para medir qual gera maior CTR.

---

## 5. Monetização e Relatórios para Marcas (Mídia Kit)

* **Exportação de Dados em CSV / Planilha:**
  * *O que analisa:* Download do histórico consolidado de cliques, acessos e fontes de tráfego por período.
* **Visão "Mídia Kit / Relatório para Patrocinadores":**
  * *O que analisa:* Relatório limpo e profissional (visualizável no painel ou exportável em PDF) com total de visualizações mensais, taxa média de cliques (CTR) e canais de maior engajamento.
  * *Valor prático:* Prova de audiência e engajamento pronta para apresentar a marcas e agências em negociações publicitárias.
