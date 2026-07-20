tailwind = {
            config: {
                safelist: [
                    'text-slate-400', 'text-amber-600', 'text-indigo-400', 'text-emerald-400', 'text-purple-400', 'text-red-400', 'text-amber-500', 'text-red-500', 'text-blue-400', 'text-indigo-300', 'text-cyan-400', 'text-emerald-300', 'text-pink-400', 'text-teal-400', 'text-green-500', 'text-fuchsia-400', 'text-yellow-400', 'text-yellow-500',
                    'bg-slate-950/20', 'bg-amber-950/20', 'bg-indigo-950/20', 'bg-emerald-950/20', 'bg-yellow-950/20',
                    'border-slate-800', 'border-amber-800/40', 'border-indigo-800/40', 'border-emerald-800/40', 'border-yellow-800/40'
                ]
            }
        }

const ITEMS = {
            iron_scrap: { nameKey: "item_iron_scrap_name", descKey: "item_iron_scrap_desc", icon: "fa-cube", usable: false, rarity: "comum", color: "text-slate-400", bg: "rgba(148,163,184,0.1)", border: "border-slate-500" },
            wood_stick: { nameKey: "item_wood_stick_name", descKey: "item_wood_stick_desc", icon: "fa-tree", usable: false, rarity: "comum", color: "text-amber-600", bg: "rgba(180,83,9,0.1)", border: "border-amber-700" },
            magic_shard: { nameKey: "item_magic_shard_name", descKey: "item_magic_shard_desc", icon: "fa-magic", usable: false, rarity: "incomum", color: "text-indigo-400", bg: "rgba(129,140,248,0.1)", border: "border-indigo-500" },
            poison_gland: { nameKey: "item_poison_gland_name", descKey: "item_poison_gland_desc", icon: "fa-vial", usable: false, rarity: "incomum", color: "text-emerald-400", bg: "rgba(16,185,129,0.1)", border: "border-emerald-500" },
            relic_core: { nameKey: "item_relic_core_name", descKey: "item_relic_core_desc", icon: "fa-project-diagram", usable: false, rarity: "raro", color: "text-purple-400", bg: "rgba(168,85,247,0.15)", border: "border-purple-500" },
            dagger: { nameKey: "item_dagger_name", descKey: "item_dagger_desc", icon: "fa-khanda", usable: true, rarity: "comum", color: "text-red-400", bg: "rgba(239,68,68,0.1)", border: "border-red-500", effect: { type: 'damage', value: 8 } },
            wooden_shield: { nameKey: "item_wooden_shield_name", descKey: "item_wooden_shield_desc", icon: "fa-shield-alt", usable: true, rarity: "comum", color: "text-amber-500", bg: "rgba(245,158,11,0.1)", border: "border-amber-600", effect: { type: 'armor', value: 8 } },
            iron_blade: { nameKey: "item_iron_blade_name", descKey: "item_iron_blade_desc", icon: "fa-khanda", usable: true, rarity: "incomum", color: "text-red-500", bg: "rgba(239,68,68,0.15)", border: "border-red-600", effect: { type: 'damage', value: 18 } },
            iron_shield: { nameKey: "item_iron_shield_name", descKey: "item_iron_shield_desc", icon: "fa-shield-alt", usable: true, rarity: "incomum", color: "text-blue-400", bg: "rgba(59,130,246,0.15)", border: "border-blue-600", effect: { type: 'armor', value: 18 } },
            mage_blade: { nameKey: "item_mage_blade_name", descKey: "item_mage_blade_desc", icon: "fa-magic", usable: true, rarity: "raro", color: "text-indigo-300", bg: "rgba(129,140,248,0.2)", border: "border-indigo-400", effect: { type: 'damage_mana', damage: 15, mana: 1 } },
            magic_staff: { nameKey: "item_magic_staff_name", descKey: "item_magic_staff_desc", icon: "fa-magic", usable: true, rarity: "raro", color: "text-cyan-400", bg: "rgba(34,211,238,0.2)", border: "border-cyan-500", effect: { type: 'mana', value: 2 } },
            poison_dagger: { nameKey: "item_poison_dagger_name", descKey: "item_poison_dagger_desc", icon: "fa-skull-crossbones", usable: true, rarity: "raro", color: "text-emerald-300", bg: "rgba(52,211,153,0.2)", border: "border-emerald-400", effect: { type: 'damage_poison', damage: 6, poison: 12 } },
            force_shield: { nameKey: "item_force_shield_name", descKey: "item_force_shield_desc", icon: "fa-shield-alt", usable: true, rarity: "raro", color: "text-pink-400", bg: "rgba(244,114,182,0.2)", border: "border-pink-500", effect: { type: 'armor_damage', armor: 25, damage: 10 } },
            relic_leaf: { nameKey: "item_relic_leaf_name", descKey: "item_relic_leaf_desc", icon: "fa-leaf", usable: false, rarity: "épico", color: "text-teal-400", bg: "rgba(20,184,166,0.25)", border: "border-teal-500", effect: { type: 'passive_relic', key: 'leaf' } },
            relic_cauldron: { nameKey: "item_relic_cauldron_name", descKey: "item_relic_cauldron_desc", icon: "fa-burn", usable: false, rarity: "épico", color: "text-green-500", bg: "rgba(34,197,94,0.25)", border: "border-green-600", effect: { type: 'passive_relic', key: 'cauldron' } },
            relic_ring: { nameKey: "item_relic_ring_name", descKey: "item_relic_ring_desc", icon: "fa-ring", usable: false, rarity: "épico", color: "text-fuchsia-400", bg: "rgba(217,70,239,0.25)", border: "border-fuchsia-500", effect: { type: 'passive_relic', key: 'ring' } },
            relic_anvil: { nameKey: "item_relic_anvil_name", descKey: "item_relic_anvil_desc", icon: "fa-hammer", usable: false, rarity: "épico", color: "text-yellow-400", bg: "rgba(234,179,8,0.25)", border: "border-yellow-500", effect: { type: 'passive_relic', key: 'anvil' } }
        };

        const RECIPES = [
            { in1: 'iron_scrap', in2: 'wood_stick', out: 'dagger' },
            { in1: 'wood_stick', in2: 'wood_stick', out: 'wooden_shield' },
            { in1: 'iron_scrap', in2: 'iron_scrap', out: 'iron_blade' },
            { in1: 'iron_scrap', in2: 'wooden_shield', out: 'iron_shield' },
            { in1: 'dagger', in2: 'magic_shard', out: 'mage_blade' },
            { in1: 'magic_shard', in2: 'wood_stick', out: 'magic_staff' },
            { in1: 'dagger', in2: 'poison_gland', out: 'poison_dagger' },
            { in1: 'iron_shield', in2: 'magic_shard', out: 'force_shield' },
            { in1: 'magic_shard', in2: 'magic_shard', out: 'relic_core' },
            { in1: 'relic_core', in2: 'wood_stick', out: 'relic_leaf' },
            { in1: 'poison_gland', in2: 'relic_core', out: 'relic_cauldron' },
            { in1: 'magic_shard', in2: 'relic_core', out: 'relic_ring' },
            { in1: 'iron_scrap', in2: 'relic_core', out: 'relic_anvil' }
        ];

        const CARD_TYPES = {
            gather_iron: { nameKey: "card_gather_iron_name", descKey: "card_gather_iron_desc", icon: "fa-cube", color: "text-slate-400", bg: "bg-slate-950/20", border: "border-slate-800", action: { min: 1, max: 2, pool: ['iron_scrap'] } },
            gather_wood: { nameKey: "card_gather_wood_name", descKey: "card_gather_wood_desc", icon: "fa-tree", color: "text-amber-600", bg: "bg-slate-950/20", border: "border-amber-800/40", action: { min: 1, max: 2, pool: ['wood_stick'] } },
            gather_magic: { nameKey: "card_gather_magic_name", descKey: "card_gather_magic_desc", icon: "fa-magic", color: "text-indigo-400", bg: "bg-slate-950/20", border: "border-indigo-800/40", action: { min: 1, max: 1, pool: ['magic_shard'] } },
            gather_poison: { nameKey: "card_gather_poison_name", descKey: "card_gather_poison_desc", icon: "fa-vial", color: "text-emerald-400", bg: "bg-slate-950/20", border: "border-emerald-800/40", action: { min: 1, max: 2, pool: ['poison_gland'] } },
            quick_scavenge: { nameKey: "card_quick_scavenge_name", descKey: "card_quick_scavenge_desc", icon: "fa-toolbox", color: "text-yellow-500", bg: "bg-slate-950/20", border: "border-yellow-800/40", action: { exact: ['iron_scrap', 'wood_stick'] } }
        };

        const ENEMIES = [
            { nameKey: "enemy_slime", maxHp: 32, hp: 32, actions: ['attack', 'defend'], attackVal: 5, defendVal: 4, svg: 'slime' },
            { nameKey: "enemy_goblin", maxHp: 48, hp: 48, actions: ['attack', 'heavy_attack', 'defend'], attackVal: 7, defendVal: 5, svg: 'goblin' },
            { nameKey: "enemy_gargoyle", maxHp: 78, hp: 78, actions: ['heavy_attack', 'defend'], attackVal: 14, defendVal: 8, svg: 'gargoyle' },
            { nameKey: "enemy_dragon", maxHp: 160, hp: 160, actions: ['flame_breath', 'heavy_attack', 'defend'], attackVal: 20, defendVal: 12, svg: 'dragon' }
        ];

if (typeof tailwind !== "undefined") window.tailwind = tailwind;


// Expose to window for inline HTML handlers
window.playSound = playSound;
window.t = t;
window.changeLanguage = changeLanguage;
window.applyTranslationsToStatic = applyTranslationsToStatic;
window.initNewGame = initNewGame;
window.showView = showView;
window.updateGlobalHeader = updateGlobalHeader;
window.renderMap = renderMap;
window.enterCurrentNode = enterCurrentNode;
window.setupCombat = setupCombat;
window.evaluateRelicMaxEnergy = evaluateRelicMaxEnergy;
window.countItemsOnGrid = countItemsOnGrid;
window.drawCards = drawCards;
window.shuffleArray = shuffleArray;
window.generateEnemyIntent = generateEnemyIntent;
window.updateCombatUI = updateCombatUI;
window.renderActiveRelicsHUD = renderActiveRelicsHUD;
window.renderHand = renderHand;
window.selectCard = selectCard;
window.renderGrid = renderGrid;
window.handleDragStart = handleDragStart;
window.allowDrop = allowDrop;
window.dragEnter = dragEnter;
window.dragLeave = dragLeave;
window.handleDrop = handleDrop;
window.handleRecycleDrop = handleRecycleDrop;
window.gridSlotInteraction = gridSlotInteraction;
window.executeGridAction = executeGridAction;
window.checkRecipe = checkRecipe;
window.executeCardSpawn = executeCardSpawn;
window.recycleSelectedGridItem = recycleSelectedGridItem;
window.recycleItemAtIndex = recycleItemAtIndex;
window.toggleRecipeBook = toggleRecipeBook;
window.updateSelectedPanel = updateSelectedPanel;
window.activateSelectedItem = activateSelectedItem;
window.dealDamageToEnemy = dealDamageToEnemy;
window.endPlayerTurn = endPlayerTurn;
window.executeEnemyTurn = executeEnemyTurn;
window.resolvePoison = resolvePoison;
window.triggerVictory = triggerVictory;
window.renderRewardsTexts = renderRewardsTexts;
window.generateCardDraftOptions = generateCardDraftOptions;
window.addCardToDeck = addCardToDeck;
window.skipCardDraft = skipCardDraft;
window.advanceMapNode = advanceMapNode;
window.setupCampfire = setupCampfire;
window.campfireRest = campfireRest;
window.campfireForge = campfireForge;
window.spawnItemOnFirstEmptySlot = spawnItemOnFirstEmptySlot;
window.setupMerchant = setupMerchant;
window.renderMerchantShop = renderMerchantShop;
window.buyShopCard = buyShopCard;
window.buyShopIngredient = buyShopIngredient;
window.shopRemoveCardService = shopRemoveCardService;
window.exitMerchant = exitMerchant;
window.triggerDefeat = triggerDefeat;
window.triggerGameCompleted = triggerGameCompleted;
window.renderGameEndTexts = renderGameEndTexts;
window.restartGame = restartGame;
window.generateEnemySVG = generateEnemySVG;
if (typeof state !== "undefined") window.state = state;
if (typeof ITEMS !== "undefined") window.ITEMS = ITEMS;
if (typeof RECIPES !== "undefined") window.RECIPES = RECIPES;
if (typeof CARD_TYPES !== "undefined") window.CARD_TYPES = CARD_TYPES;
if (typeof ENEMIES !== "undefined") window.ENEMIES = ENEMIES;
if (typeof DICT !== "undefined") window.DICT = DICT;
if (typeof tailwind !== "undefined") window.tailwind = tailwind;
