# Noite Amaldiçoada 0.4.6

Correção do background da Fase 1.

## Bug encontrado
O `stage01.webp` estava sendo carregado corretamente, mas o `ground_pattern.webp` era RGB/opaco e era desenhado depois do background, cobrindo visualmente o cenário inteiro.

## Correções
- o chão da Fase 1 agora funciona como overlay translúcido;
- transparência também foi aplicada diretamente no `ground_pattern.webp`;
- intensidade da camada varia por qualidade gráfica para reduzir custo em hardware fraco;
- o background real `stage01.webp` volta a permanecer visível durante toda a fase;
- mantido o scrolling do cenário e do piso.

Continua abrindo com 2 cliques no `index.html`.
