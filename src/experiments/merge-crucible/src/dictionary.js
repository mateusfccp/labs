const DICT = {
            "pt": {
                "header_sub": "Alquimia, Forja e Tática Rogue-like",
                "ui_life": "Vida:", "ui_gold": "Ouro:", "ui_progress": "Progresso:",
                "map_title": "SUA JORNADA PELO CRISOL",
                "map_desc": "O tabuleiro persiste entre combates! Estoque armas, escudos e relíquias na grade para se preparar.",
                "map_btn_combat": "Entrar em Combate", "map_btn_campfire": "Ir para a Fogueira", "map_btn_merchant": "Comerciar",
                "map_node_camp": "Fogueira", "map_node_shop": "Mercador",
                "ui_deck_preview": "Seu Baralho de Evocação",
                "combat_turn": "Turno", "combat_enemy": "Inimigo:",
                "combat_enemy_hp": "INTEGRIDADE DO OPONENTE", "combat_enemy_def": "Defesa", "combat_enemy_poi": "Veneno",
                "combat_player_def": "Defesa Atual", "combat_player_hp": "SUA INTEGRALIDADE",
                "combat_relics": "Efeitos Passivos de Relíquias (Na Grade)", "combat_relics_none": "Nenhuma relíquia montada na grade no momento.",
                "combat_phase": "Fase de Forja", "combat_hint": "Clique/Arraste para mesclar. Duplo clique para usar!",
                "btn_end_turn": "Finalizar Turno", "grid_title": "Tabela Alquímica 4x4",
                "ui_recycle": "Lixeira (Ouro)", "ui_recipe": "Receitas",
                "ui_hand": "Sua Mão de Cartas", "ui_deck": "Baralho:", "ui_discard": "Descarte:",
                "panel_no_item": "Nenhum item selecionado", "panel_no_item_desc": "Dê duplo clique para usar peças úteis de batalha. Arraste-as para fundir.",
                "btn_activate": "Ativar (Duplo Clique)",
                "reward_title": "COMBATE VENCIDO!", "reward_desc": "O tabuleiro foi mantido intocado para as próximas etapas. Escolha novas runas.",
                "reward_gold": "OURO ENCONTRADO", "reward_choose": "Escolha 1 runa de coleta para adicionar:", "btn_skip": "Pular escolha de carta (- Não adicionar nada)",
                "camp_title": "ACAMPAMENTO DA ALMA", "camp_desc": "Organize as runas ou recupere o vigor de seu campeão.",
                "camp_rest": "Descansar", "camp_rest_desc": "Recupera 30% da sua Vida Máxima (+24 HP).",
                "camp_forge": "Ganhar Material", "camp_forge_desc": "Insere diretamente 1 Fragmento de Mana e 1 Vesícula de Veneno no tabuleiro.",
                "shop_title": "MERCADOR DE RUNAS", "shop_desc": "Gaste seu ouro acumulado para comprar runas melhores ou materiais.",
                "btn_exit": "Sair da Loja", "shop_runes": "Runas de Coleta", "shop_ingredients": "Ingredientes Raros (Direto pro Board)",
                "shop_purge": "Excluir Runa do Baralho", "shop_purge_desc": "Purifique o baralho para focar nas melhores coletas.",
                "btn_buy": "Comprar:", "btn_acquire": "Adquirir:", "btn_pay": "Pagar 45", "btn_add": "Adicionar",
                "end_defeat": "DERROTA NO CRISOL", "end_defeat_desc": "Seu corpo colapsou. Aprimore suas receitas de merge, purifique seu baralho e tente mais uma vez!",
                "end_win": "VITORIOSO SUPREMO!", "end_win_desc": "Você desvendou as receitas secretas, ergueu monumentos mágicos e expurgou o Dragão das Cinzas!",
                "btn_restart": "Iniciar Nova Jornada",
                "recipe_book_title": "Grimório de Receitas de Fusão", "recipe_close": "Fechar [x]",
                "rec_cat_1": "Armas e Defesas Comuns",
                "rec_1_1": "⚡ Sucata de Ferro + Graveto = <strong>Adaga</strong>", "rec_1_2": "🛡️ Graveto + Graveto = <strong>Roda de Madeira</strong>",
                "rec_1_3": "⚔️ Sucata + Sucata = <strong>Lâmina de Ferro</strong>", "rec_1_4": "🛡️ Sucata + Roda de Madeira = <strong>Escudo de Ferro</strong>",
                "rec_cat_2": "Fusões Raras e Arcanas",
                "rec_2_1": "🔮 Adaga + Fragmento Mana = <strong>Lâmina Rúnica</strong>", "rec_2_2": "⚡ Fragmento Mana + Graveto = <strong>Cajado Elemental</strong>",
                "rec_2_3": "💀 Adaga + Vesícula Veneno = <strong>Adaga Peçonhenta</strong>", "rec_2_4": "🛡️ Escudo Ferro + Fragmento Mana = <strong>Baluarte Espiritual</strong>",
                "rec_cat_3": "Artefatos de Relíquia (Ocupam espaço na grade dando buffs passivos)",
                "rec_3_1": "🔥 Fragmento Mana + Fragmento Mana = <strong>Núcleo de Relíquia</strong> (Base)",
                "rec_3_2": "🟢 Núcleo de Relíquia + Graveto = <strong>Jade Vital</strong> (Cura por turno)",
                "rec_3_3": "🟣 Núcleo de Relíquia + Sucata = <strong>Bigorna da Sorte</strong> (+Dano de armas)",
                "rec_3_4": "🟢 Núcleo de Relíquia + Vesícula = <strong>Caldeirão Tóxico</strong> (Veneno passivo)",
                "rec_3_5": "🟣 Núcleo de Relíquia + Fragmento Mana = <strong>Anel de Éter</strong> (+1 Mana máx)",

                "intent_attack": "Ataque:", "intent_flame": "Chamas:", "intent_defend": "Defesa:",

                "item_iron_scrap_name": "Sucata de Ferro", "item_iron_scrap_desc": "Ferro cru. Use em armas e escudos metálicos.",
                "item_wood_stick_name": "Graveto Rústico", "item_wood_stick_desc": "Madeira forte. Essencial para adagas ou rodas protetoras.",
                "item_magic_shard_name": "Fragmento de Mana", "item_magic_shard_desc": "Cristal energizado. Infunde armas com mana ou forja relíquias.",
                "item_poison_gland_name": "Vesícula Veneno", "item_poison_gland_desc": "Toxinas letais. Usada para envenenar lâminas.",
                "item_relic_core_name": "Núcleo de Relíquia", "item_relic_core_desc": "Núcleo forjado. Combine com básicos para criar relíquias.",
                "item_dagger_name": "Adaga Improvisada", "item_dagger_desc": "Garante 8 de dano físico imediato.",
                "item_wooden_shield_name": "Roda de Madeira", "item_wooden_shield_desc": "Concede 8 de Escudo para mitigar dano.",
                "item_iron_blade_name": "Lâmina de Ferro", "item_iron_blade_desc": "Forte corte. Desfere 18 de dano físico.",
                "item_iron_shield_name": "Escudo Reforçado", "item_iron_shield_desc": "Garante 18 de Escudo para este turno.",
                "item_mage_blade_name": "Lâmina Rúnica", "item_mage_blade_desc": "Lâmina que drena energia. Causa 15 de dano e recupera 1 Mana.",
                "item_magic_staff_name": "Cajado Elemental", "item_magic_staff_desc": "Concentração profunda. Concede 2 de Mana adicionais.",
                "item_poison_dagger_name": "Lâmina Peçonhenta", "item_poison_dagger_desc": "Causa 6 de dano e infecta com 12 de Veneno.",
                "item_force_shield_name": "Baluarte Espiritual", "item_force_shield_desc": "Barreira mística. Concede 25 Escudo e devolve 10 dano.",
                "item_relic_leaf_name": "Jade Vital", "item_relic_leaf_desc": "[Relíquia Ativa] Cura 4 Vida no fim do seu turno.",
                "item_relic_cauldron_name": "Caldeirão Tóxico", "item_relic_cauldron_desc": "[Relíquia Ativa] Aplica 3 Veneno ao inimigo no seu turno.",
                "item_relic_ring_name": "Anel de Éter", "item_relic_ring_desc": "[Relíquia Ativa] Comece as rodadas com +1 Mana Máxima.",
                "item_relic_anvil_name": "Bigorna da Sorte", "item_relic_anvil_desc": "[Relíquia Ativa] Armas ativadas causam +4 dano.",

                "card_gather_iron_name": "Coleta Mineral", "card_gather_iron_desc": "Evoque de 1 a 2 Sucatas de Ferro no tabuleiro.",
                "card_gather_wood_name": "Corte de Lenha", "card_gather_wood_desc": "Evoque de 1 a 2 Gravetos Rústicos no tabuleiro.",
                "card_gather_magic_name": "Sintonia Rúnica", "card_gather_magic_desc": "Evoque 1 Fragmento de Mana no tabuleiro.",
                "card_gather_poison_name": "Extração Tóxica", "card_gather_poison_desc": "Evoque de 1 a 2 Vesículas de Veneno na grade.",
                "card_quick_scavenge_name": "Pilhagem Rápida", "card_quick_scavenge_desc": "Gera exatamente 1 Sucata de Ferro e 1 Graveto.",

                "enemy_slime": "Limo Mutante", "enemy_goblin": "Goblin Minerador", "enemy_gargoyle": "Gárgula Rúnica", "enemy_dragon": "Dragão das Cinzas"
            },
            "en": {
                "header_sub": "Alchemy, Forge & Roguelike Tactics",
                "ui_life": "Life:", "ui_gold": "Gold:", "ui_progress": "Progress:",
                "map_title": "YOUR JOURNEY THROUGH THE CRUCIBLE",
                "map_desc": "The board persists between combats! Stockpile weapons, shields and relics in the grid to prepare yourself.",
                "map_btn_combat": "Enter Combat", "map_btn_campfire": "Go to Campfire", "map_btn_merchant": "Trade",
                "map_node_camp": "Campfire", "map_node_shop": "Merchant",
                "ui_deck_preview": "Your Summoning Deck",
                "combat_turn": "Turn", "combat_enemy": "Enemy:",
                "combat_enemy_hp": "OPPONENT INTEGRITY", "combat_enemy_def": "Defense", "combat_enemy_poi": "Poison",
                "combat_player_def": "Current Defense", "combat_player_hp": "YOUR INTEGRITY",
                "combat_relics": "Passive Relic Effects (On Grid)", "combat_relics_none": "No active relics on the grid.",
                "combat_phase": "Forge Phase", "combat_hint": "Click/Drag to merge. Double click to use items!",
                "btn_end_turn": "End Turn", "grid_title": "4x4 Alchemy Grid",
                "ui_recycle": "Recycle (Gold)", "ui_recipe": "Recipes",
                "ui_hand": "Your Hand", "ui_deck": "Deck:", "ui_discard": "Discard:",
                "panel_no_item": "No item selected", "panel_no_item_desc": "Double click to use battle items. Drag to merge them.",
                "btn_activate": "Activate (Double Click)",
                "reward_title": "COMBAT WON!", "reward_desc": "The board was kept intact for the next stages. Choose new gather runes for your deck.",
                "reward_gold": "GOLD FOUND", "reward_choose": "Choose 1 gather rune to add:", "btn_skip": "Skip card selection (- Add nothing)",
                "camp_title": "SOUL CAMPFIRE", "camp_desc": "Organize your runes or recover your champion's vigor.",
                "camp_rest": "Rest", "camp_rest_desc": "Recovers 30% of your Max Life (+24 HP).",
                "camp_forge": "Gather Material", "camp_forge_desc": "Inserts 1 Magic Shard and 1 Poison Gland directly into your grid.",
                "shop_title": "RUNE MERCHANT", "shop_desc": "Spend your accumulated gold to buy better runes or rare materials.",
                "btn_exit": "Leave Shop", "shop_runes": "Gather Runes", "shop_ingredients": "Rare Ingredients (Direct to Board)",
                "shop_purge": "Remove Rune from Deck", "shop_purge_desc": "Purify your deck to focus on your best gather cards.",
                "btn_buy": "Buy:", "btn_acquire": "Acquire:", "btn_pay": "Pay 45", "btn_add": "Add",
                "end_defeat": "DEFEAT IN THE CRUCIBLE", "end_defeat_desc": "Your body collapsed. Improve your merge recipes, purify your deck and try again!",
                "end_win": "SUPREME VICTOR!", "end_win_desc": "You uncovered secret recipes, raised magical monuments and purged the Ash Dragon from Crucible!",
                "btn_restart": "Start New Journey",
                "recipe_book_title": "Merge Recipe Grimoire", "recipe_close": "Close [x]",
                "rec_cat_1": "Common Weapons & Defenses",
                "rec_1_1": "⚡ Iron Scrap + Stick = <strong>Dagger</strong>", "rec_1_2": "🛡️ Stick + Stick = <strong>Wood Wheel</strong>",
                "rec_1_3": "⚔️ Scrap + Scrap = <strong>Iron Blade</strong>", "rec_1_4": "🛡️ Scrap + Wood Wheel = <strong>Iron Shield</strong>",
                "rec_cat_2": "Rare & Arcane Merges",
                "rec_2_1": "🔮 Dagger + Magic Shard = <strong>Rune Blade</strong>", "rec_2_2": "⚡ Magic Shard + Stick = <strong>Elemental Staff</strong>",
                "rec_2_3": "💀 Dagger + Poison Gland = <strong>Venom Dagger</strong>", "rec_2_4": "🛡️ Iron Shield + Magic Shard = <strong>Spirit Bulwark</strong>",
                "rec_cat_3": "Relic Artifacts (Takes up grid space giving passive buffs)",
                "rec_3_1": "🔥 Magic Shard + Magic Shard = <strong>Relic Core</strong> (Base)",
                "rec_3_2": "🟢 Relic Core + Stick = <strong>Vital Jade</strong> (Heal per turn)",
                "rec_3_3": "🟣 Relic Core + Scrap = <strong>Lucky Anvil</strong> (+Weapon Damage)",
                "rec_3_4": "🟢 Relic Core + Poison Gland = <strong>Toxic Brew</strong> (Passive Poison)",
                "rec_3_5": "🟣 Relic Core + Magic Shard = <strong>Aether Ring</strong> (+1 Max Mana)",
                
                "intent_attack": "Attack:", "intent_flame": "Flame:", "intent_defend": "Defend:",

                "item_iron_scrap_name": "Iron Scrap", "item_iron_scrap_desc": "Raw iron. Use in metallic weapons and shields.",
                "item_wood_stick_name": "Wood Stick", "item_wood_stick_desc": "Strong wood. Essential for basic daggers or wooden wheels.",
                "item_magic_shard_name": "Magic Shard", "item_magic_shard_desc": "Energized crystal. Infuses weapons with mana or forges relics.",
                "item_poison_gland_name": "Poison Gland", "item_poison_gland_desc": "Lethal toxins. Used to poison blades.",
                "item_relic_core_name": "Relic Core", "item_relic_core_desc": "Forged core. Combine with basics to build passive relics.",
                "item_dagger_name": "Improv Dagger", "item_dagger_desc": "Deals 8 physical damage immediately.",
                "item_wooden_shield_name": "Wood Wheel", "item_wooden_shield_desc": "Grants 8 Shield to mitigate damage.",
                "item_iron_blade_name": "Iron Blade", "item_iron_blade_desc": "Strong slash. Deals 18 physical damage.",
                "item_iron_shield_name": "Reinforced Shield", "item_iron_shield_desc": "Grants 18 Shield for this turn.",
                "item_mage_blade_name": "Rune Blade", "item_mage_blade_desc": "Energy drain. Deals 15 damage and restores 1 Mana.",
                "item_magic_staff_name": "Elemental Staff", "item_magic_staff_desc": "Elemental focus. Grants 2 additional Mana.",
                "item_poison_dagger_name": "Venom Dagger", "item_poison_dagger_desc": "Deals 6 damage and infects target with 12 Poison.",
                "item_force_shield_name": "Spirit Bulwark", "item_force_shield_desc": "Mystic barrier. Grants 25 Shield and deals 10 retaliation damage.",
                "item_relic_leaf_name": "Vital Jade", "item_relic_leaf_desc": "[Passive Grid Relic] Heals 4 Life at the end of your turn.",
                "item_relic_cauldron_name": "Toxic Brew", "item_relic_cauldron_desc": "[Passive Grid Relic] Applies 3 Poison to enemy on your turn.",
                "item_relic_ring_name": "Aether Ring", "item_relic_ring_desc": "[Passive Grid Relic] Start all rounds with +1 Max Mana.",
                "item_relic_anvil_name": "Lucky Anvil", "item_relic_anvil_desc": "[Passive Grid Relic] All activated weapons deal +4 damage.",

                "card_gather_iron_name": "Mineral Gather", "card_gather_iron_desc": "Summon 1-2 free Iron Scraps on the board.",
                "card_gather_wood_name": "Chop Wood", "card_gather_wood_desc": "Summon 1-2 free Wood Sticks on the board.",
                "card_gather_magic_name": "Runic Attunement", "card_gather_magic_desc": "Summon 1 Magic Shard on the board.",
                "card_gather_poison_name": "Toxic Extraction", "card_gather_poison_desc": "Summon 1-2 Poison Glands on the grid.",
                "card_quick_scavenge_name": "Quick Scavenge", "card_quick_scavenge_desc": "Generates exactly 1 Iron Scrap and 1 Wood Stick.",

                "enemy_slime": "Mutant Slime", "enemy_goblin": "Miner Goblin", "enemy_gargoyle": "Rune Gargoyle", "enemy_dragon": "Ash Dragon"
            },
            "es": {
                "header_sub": "Alquimia, Forja y Tácticas Roguelike",
                "ui_life": "Vida:", "ui_gold": "Oro:", "ui_progress": "Progreso:",
                "map_title": "TU VIAJE POR EL CRISOL",
                "map_desc": "¡El tablero persiste entre combates! Almacena armas, escudos y reliquias para prepararte.",
                "map_btn_combat": "Entrar en Combate", "map_btn_campfire": "Ir a la Hoguera", "map_btn_merchant": "Comerciar",
                "map_node_camp": "Hoguera", "map_node_shop": "Mercader",
                "ui_deck_preview": "Tu Mazo de Invocación",
                "combat_turn": "Turno", "combat_enemy": "Enemigo:",
                "combat_enemy_hp": "INTEGRIDAD DEL OPONENTE", "combat_enemy_def": "Defensa", "combat_enemy_poi": "Veneno",
                "combat_player_def": "Defensa Actual", "combat_player_hp": "TU INTEGRIDAD",
                "combat_relics": "Efectos Pasivos de Reliquias (En Rejilla)", "combat_relics_none": "No hay reliquias activas en la rejilla.",
                "combat_phase": "Fase de Forja", "combat_hint": "¡Haz clic/arrastra para fusionar. Doble clic para usar!",
                "btn_end_turn": "Finalizar Turno", "grid_title": "Rejilla Alquímica 4x4",
                "ui_recycle": "Reciclar (Oro)", "ui_recipe": "Recetas",
                "ui_hand": "Tu Mano de Cartas", "ui_deck": "Mazo:", "ui_discard": "Descarte:",
                "panel_no_item": "Ningún objeto seleccionado", "panel_no_item_desc": "Haz doble clic para usar piezas. Arrastra para fusionarlas.",
                "btn_activate": "Activar (Doble Clic)",
                "reward_title": "¡COMBATE GANADO!", "reward_desc": "El tablero se mantuvo intacto para las siguientes etapas. Elige nuevas runas.",
                "reward_gold": "ORO ENCONTRADO", "reward_choose": "Elige 1 runa de recolección para agregar:", "btn_skip": "Omitir carta (- No agregar nada)",
                "camp_title": "HOGUERA DEL ALMA", "camp_desc": "Organiza tus runas o recupera el vigor de tu campeón.",
                "camp_rest": "Descansar", "camp_rest_desc": "Recupera 30% de tu Vida Máxima (+24 HP).",
                "camp_forge": "Obtener Material", "camp_forge_desc": "Inserta 1 Fragmento de Maná y 1 Vesícula de Veneno directamente en el tablero.",
                "shop_title": "MERCADER DE RUNAS", "shop_desc": "Gasta tu oro acumulado para comprar mejores runas o materiales.",
                "btn_exit": "Salir de Tienda", "shop_runes": "Runas de Recolección", "shop_ingredients": "Ingredientes Raros",
                "shop_purge": "Eliminar Runa del Mazo", "shop_purge_desc": "Purifica el mazo para centrarte en tus mejores cartas.",
                "btn_buy": "Comprar:", "btn_acquire": "Adquirir:", "btn_pay": "Pagar 45", "btn_add": "Añadir",
                "end_defeat": "DERROTA EN EL CRISOL", "end_defeat_desc": "Tu cuerpo colapsó. ¡Mejora tus recetas, purifica tu mazo y vuelve a intentarlo!",
                "end_win": "¡VICTORIOSO SUPREMO!", "end_win_desc": "¡Descubriste recetas secretas, erigiste monumentos mágicos y purgaste al Dragón de las Cenizas!",
                "btn_restart": "Iniciar Nuevo Viaje",
                "recipe_book_title": "Grimorio de Recetas de Fusión", "recipe_close": "Cerrar [x]",
                "rec_cat_1": "Armas y Defensas Comunes",
                "rec_1_1": "⚡ Chatarra Hierro + Palo = <strong>Daga</strong>", "rec_1_2": "🛡️ Palo + Palo = <strong>Rueda de Madera</strong>",
                "rec_1_3": "⚔️ Chatarra + Chatarra = <strong>Espada de Hierro</strong>", "rec_1_4": "🛡️ Chatarra + Rueda = <strong>Escudo de Hierro</strong>",
                "rec_cat_2": "Fusiones Raras y Arcanas",
                "rec_2_1": "🔮 Daga + Fragmento Maná = <strong>Espada Rúnica</strong>", "rec_2_2": "⚡ Fragmento Maná + Palo = <strong>Bastón Elemental</strong>",
                "rec_2_3": "💀 Daga + Vesícula Veneno = <strong>Daga Venenosa</strong>", "rec_2_4": "🛡️ Escudo Hierro + Frag. Maná = <strong>Baluarte Espiritual</strong>",
                "rec_cat_3": "Artefactos Reliquia (Dan buffs pasivos)",
                "rec_3_1": "🔥 Fragmento Maná x2 = <strong>Núcleo de Reliquia</strong> (Base)",
                "rec_3_2": "🟢 Núcleo Reliquia + Palo = <strong>Jade Vital</strong> (Cura por turno)",
                "rec_3_3": "🟣 Núcleo Reliquia + Chatarra = <strong>Yunque Suerte</strong> (+Daño de armas)",
                "rec_3_4": "🟢 Núcleo Reliquia + Vesícula = <strong>Caldero Tóxico</strong> (Veneno pasivo)",
                "rec_3_5": "🟣 Núcleo Reliquia + Frag. Maná = <strong>Anillo de Éter</strong> (+1 Maná máx)",
                
                "intent_attack": "Ataque:", "intent_flame": "Llamas:", "intent_defend": "Defensa:",

                "item_iron_scrap_name": "Chatarra de Hierro", "item_iron_scrap_desc": "Hierro crudo. Úsalo en armas y escudos.",
                "item_wood_stick_name": "Palo Rústico", "item_wood_stick_desc": "Madera fuerte. Esencial para dagas o escudos.",
                "item_magic_shard_name": "Fragmento de Maná", "item_magic_shard_desc": "Cristal. Infunde armas con maná o forja reliquias.",
                "item_poison_gland_name": "Vesícula Veneno", "item_poison_gland_desc": "Toxinas. Se usa para envenenar hojas.",
                "item_relic_core_name": "Núcleo Reliquia", "item_relic_core_desc": "Núcleo. Combínalo para crear reliquias.",
                "item_dagger_name": "Daga Improvisada", "item_dagger_desc": "Otorga 8 de daño físico de inmediato.",
                "item_wooden_shield_name": "Rueda de Madera", "item_wooden_shield_desc": "Otorga 8 de Escudo para mitigar daño.",
                "item_iron_blade_name": "Hoja de Hierro", "item_iron_blade_desc": "Fuerte corte. Inflige 18 de daño físico.",
                "item_iron_shield_name": "Escudo Reforzado", "item_iron_shield_desc": "Otorga 18 de Escudo para este turno.",
                "item_mage_blade_name": "Hoja Rúnica", "item_mage_blade_desc": "Drena energía. Causa 15 de daño y recupera 1 Maná.",
                "item_magic_staff_name": "Bastón Elemental", "item_magic_staff_desc": "Concentración. Otorga 2 de Maná adicionales.",
                "item_poison_dagger_name": "Daga Venenosa", "item_poison_dagger_desc": "Causa 6 de daño e infecta con 12 de Veneno.",
                "item_force_shield_name": "Baluarte Espiritual", "item_force_shield_desc": "Otorga 25 Escudo y devuelve 10 de daño.",
                "item_relic_leaf_name": "Jade Vital", "item_relic_leaf_desc": "[Reliquia Activa] Cura 4 Vida al final del turno.",
                "item_relic_cauldron_name": "Caldero Tóxico", "item_relic_cauldron_desc": "[Reliquia Activa] Aplica 3 Veneno al enemigo.",
                "item_relic_ring_name": "Anel de Éter", "item_relic_ring_desc": "[Reliquia Activa] Comienza con +1 Maná Máx.",
                "item_relic_anvil_name": "Yunque de Suerte", "item_relic_anvil_desc": "[Reliquia Activa] Armas activadas causan +4 daño.",

                "card_gather_iron_name": "Recolección Mineral", "card_gather_iron_desc": "Invoca 1-2 Chatarras de Hierro.",
                "card_gather_wood_name": "Corte de Leña", "card_gather_wood_desc": "Invoca 1-2 Palos Rústicos.",
                "card_gather_magic_name": "Sintonía Rúnica", "card_gather_magic_desc": "Invoca 1 Fragmento de Maná.",
                "card_gather_poison_name": "Extracción Tóxica", "card_gather_poison_desc": "Invoca 1-2 Vesículas de Veneno.",
                "card_quick_scavenge_name": "Saqueo Rápido", "card_quick_scavenge_desc": "Genera exactamente 1 Chatarra y 1 Palo.",

                "enemy_slime": "Limo Mutante", "enemy_goblin": "Goblin Minero", "enemy_gargoyle": "Gárgula Rúnica", "enemy_dragon": "Dragón Ceniza"
            }
        };

        let currentLang = 'en';
        function t(key) {
            return DICT[currentLang][key] || key;
        }

        function changeLanguage(lang) {
            currentLang = lang;
            applyTranslationsToStatic();
            updateGlobalHeader();
            renderMap();
            if(!document.getElementById('view-combat').classList.contains('hidden')) updateCombatUI();
            if(!document.getElementById('view-merchant').classList.contains('hidden')) renderMerchantShop();
            if(!document.getElementById('view-rewards').classList.contains('hidden')) renderRewardsTexts();
            if(!document.getElementById('view-game-end').classList.contains('hidden')) renderGameEndTexts();
        }

        function applyTranslationsToStatic() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                el.innerHTML = t(el.getAttribute('data-i18n'));
            });
            document.querySelectorAll('[data-i18n-attr]').forEach(el => {
                const attrs = el.getAttribute('data-i18n-attr').split(',');
                attrs.forEach(attrPair => {
                    const [attrName, key] = attrPair.split(':');
                    el.setAttribute(attrName, t(key));
                });
            });
        }

