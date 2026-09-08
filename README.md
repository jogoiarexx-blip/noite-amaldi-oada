# Noite Amaldiçoada 0.4.1

Correção de bugs de dano recorrente e flicker do cenário.

## Corrigido
- dano de contato agora tem cooldown individual por inimigo;
- inimigos são afastados após acertar o player, evitando ficar sobrepostos causando dano recorrente;
- todo dano recebido mostra a origem na tela;
- projéteis inimigos ficaram maiores, com brilho e rastro;
- colisão de projéteis inimigos usa varredura entre frames para evitar hits invisíveis;
- cenário/obstáculos não entram mais no screen shake;
- chão da Fase 1 usa uma textura precomposta em pattern, reduzindo dezenas/centenas de draw calls por frame;
- removida a camada procedural extra das outras fases, deixando os backgrounds estáveis.

Todos os assets continuam em WebP e o jogo segue compatível com abertura por dois cliques no index.html.
