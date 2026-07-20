        let state = {
            player: {
                hp: 80, maxHp: 80, gold: 50,
                deck: [], hand: [], discard: [], energy: 3, maxEnergy: 3, armor: 0,
                grid: Array(16).fill(null)
            },
            currentMapNodeIndex: 0,
            nodes: [
                { type: 'combat', icon: 'fa-khanda', index: 0, enemyIndex: 0 },
                { type: 'combat', icon: 'fa-khanda', index: 1, enemyIndex: 1 },
                { type: 'campfire', icon: 'fa-fire', index: 2 },
                { type: 'combat_elite', icon: 'fa-skull', index: 3, enemyIndex: 2 },
                { type: 'merchant', icon: 'fa-store', index: 4 },
                { type: 'combat_boss', icon: 'fa-dragon', index: 5, enemyIndex: 3 }
            ],
            combat: {
                enemy: null, turn: 1, selectedCardIndex: null, selectedGridIndex: null,
                activeCardIndexesHighlight: [], enemyIntent: { type: 'attack', value: 0 }, draggedIndex: null
            }
        };

        window.onload = function() {
            applyTranslationsToStatic();
            initNewGame();
        };

        function initNewGame() {
            state.player.hp = 80; state.player.maxHp = 80; state.player.gold = 50;
            state.currentMapNodeIndex = 0; state.player.maxEnergy = 3;
            state.player.grid = Array(16).fill(null);
            state.player.grid[0] = { type: 'iron_scrap' }; state.player.grid[1] = { type: 'wood_stick' };
            state.player.deck = [
                { id: 1, type: 'gather_iron' }, { id: 2, type: 'gather_iron' }, { id: 3, type: 'gather_iron' },
                { id: 4, type: 'gather_wood' }, { id: 5, type: 'gather_wood' }, { id: 6, type: 'gather_wood' },
                { id: 7, type: 'gather_magic' }, { id: 8, type: 'gather_poison' },
                { id: 9, type: 'quick_scavenge' }, { id: 10, type: 'quick_scavenge' }
            ];
            updateGlobalHeader();
            renderMap();
            showView('view-map');
        }

        function showView(viewId) {
            const views = ['view-map', 'view-combat', 'view-rewards', 'view-campfire', 'view-merchant', 'view-game-end'];
            views.forEach(v => {
                const el = document.getElementById(v);
                if (v === viewId) el.classList.remove('hidden'); else el.classList.add('hidden');
            });
            if (viewId === 'view-map') renderMap();
        }

        function updateGlobalHeader() {
            document.getElementById('player-hp-header').innerText = `${state.player.hp}/${state.player.maxHp}`;
            document.getElementById('player-gold-header').innerText = state.player.gold;
            document.getElementById('player-progress-header').innerText = `${state.currentMapNodeIndex + 1}/${state.nodes.length}`;
            document.getElementById('deck-size-map').innerText = state.player.deck.length;

            const list = document.getElementById('deck-list-preview');
            list.innerHTML = '';
            state.player.deck.forEach(card => {
                const tObj = CARD_TYPES[card.type];
                const badge = document.createElement('div');
                badge.className = `text-[11px] px-2.5 py-1 rounded-md border ${tObj.border} ${tObj.bg} ${tObj.color} flex items-center gap-1.5 font-bold uppercase`;
                badge.innerHTML = `<i class="fas ${tObj.icon}"></i> ${t(tObj.nameKey)}`;
                list.appendChild(badge);
            });
        }

        function renderMap() {
            const container = document.getElementById('map-nodes-container');
            container.innerHTML = '';

            const totalNodes = state.nodes.length;
            const percentage = (state.currentMapNodeIndex / (totalNodes - 1)) * 100;
            document.getElementById('map-progress-bar').style.width = `${percentage}%`;

            state.nodes.forEach((node, idx) => {
                const nodeWrapper = document.createElement('div');
                nodeWrapper.className = "flex flex-col items-center relative z-10 w-16"; 

                const isCurrent = idx === state.currentMapNodeIndex;
                const isPassed = idx < state.currentMapNodeIndex;
                let colorClass = "bg-slate-800 border-slate-700 text-slate-500";
                
                if (isCurrent) colorClass = "bg-indigo-600 border-indigo-400 text-white scale-110 shadow-[0_0_15px_rgba(99,102,241,0.6)]";
                else if (isPassed) colorClass = "bg-slate-900 border-indigo-500 text-indigo-400";

                let localizedLabel = "";
                if(node.type === 'campfire') localizedLabel = t('map_node_camp');
                else if(node.type === 'merchant') localizedLabel = t('map_node_shop');
                else localizedLabel = t(ENEMIES[node.enemyIndex].nameKey);

                nodeWrapper.innerHTML = `
                    <div class="w-12 h-12 rounded-full border-2 ${colorClass} flex items-center justify-center transition-all duration-300 relative z-20">
                        <i class="fas ${node.icon} text-lg"></i>
                    </div>
                    <span class="absolute top-14 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-indigo-400 font-extrabold scale-110' : 'text-slate-400'} text-center w-32 transition-all duration-300 line-clamp-2">
                        ${localizedLabel}
                    </span>
                `;
                container.appendChild(nodeWrapper);
            });

            const currentNode = state.nodes[state.currentMapNodeIndex];
            const btnText = document.getElementById('btn-action-node-text');
            const btnIcon = document.getElementById('btn-action-node-icon');
            if (currentNode.type === 'campfire') { btnText.innerText = t('map_btn_campfire'); btnIcon.className = 'fas fa-fire'; }
            else if (currentNode.type === 'merchant') { btnText.innerText = t('map_btn_merchant'); btnIcon.className = 'fas fa-store'; }
            else { btnText.innerText = t('map_btn_combat'); btnIcon.className = 'fas fa-khanda'; }
        }

        function enterCurrentNode() {
            playSound('select');
            const node = state.nodes[state.currentMapNodeIndex];
            if (node.type.startsWith('combat')) setupCombat(node.enemyIndex);
            else if (node.type === 'campfire') setupCampfire();
            else if (node.type === 'merchant') setupMerchant();
        }

        function setupCombat(enemyIndex) {
            const enemyBase = ENEMIES[enemyIndex];
            state.combat.enemy = {
                nameKey: enemyBase.nameKey, maxHp: enemyBase.maxHp, hp: enemyBase.maxHp,
                armor: 0, poison: 0, actions: enemyBase.actions, attackVal: enemyBase.attackVal, defendVal: enemyBase.defendVal, svg: enemyBase.svg
            };
            state.combat.turn = 1; state.player.armor = 0;
            evaluateRelicMaxEnergy();
            state.player.energy = state.player.maxEnergy;
            state.player.discard = []; state.player.hand = [];
            state.player.deck = shuffleArray([...state.player.deck]);

            let cauldrons = countItemsOnGrid('relic_cauldron');
            if (cauldrons > 0) state.combat.enemy.poison += (cauldrons * 3);

            drawCards(5); generateEnemyIntent(); updateCombatUI(); showView('view-combat');
        }

        function evaluateRelicMaxEnergy() {
            const rings = countItemsOnGrid('relic_ring');
            state.player.maxEnergy = 3 + rings;
        }

        function countItemsOnGrid(type) { return state.player.grid.filter(item => item && item.type === type).length; }

        function drawCards(count) {
            for (let i = 0; i < count; i++) {
                if (state.player.deck.length === 0) {
                    if (state.player.discard.length === 0) break;
                    state.player.deck = shuffleArray([...state.player.discard]); state.player.discard = [];
                }
                state.player.hand.push(state.player.deck.pop());
            }
        }

        function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function generateEnemyIntent() {
            const enemy = state.combat.enemy;
            const action = enemy.actions[Math.floor(Math.random() * enemy.actions.length)];
            if (action === 'attack') state.combat.enemyIntent = { type: 'attack', value: enemy.attackVal };
            else if (action === 'heavy_attack') state.combat.enemyIntent = { type: 'attack', value: Math.round(enemy.attackVal * 1.5) };
            else if (action === 'defend') state.combat.enemyIntent = { type: 'defend', value: enemy.defendVal };
            else if (action === 'flame_breath') state.combat.enemyIntent = { type: 'flame', value: enemy.attackVal };
        }

        function updateCombatUI() {
            const enemy = state.combat.enemy;
            if (!enemy) return;

            document.getElementById('enemy-name').innerText = t(enemy.nameKey);
            document.getElementById('enemy-hp-text').innerText = `${enemy.hp} / ${enemy.maxHp}`;
            document.getElementById('enemy-hp-bar').style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;

            const enemyArmorBadge = document.getElementById('enemy-armor-badge');
            if (enemy.armor > 0) {
                enemyArmorBadge.classList.remove('hidden'); enemyArmorBadge.classList.add('flex');
                document.getElementById('enemy-armor-val').innerText = enemy.armor;
                document.getElementById('enemy-armor-bar').style.width = `${Math.min((enemy.armor / enemy.maxHp) * 100, 100)}%`;
            } else {
                enemyArmorBadge.classList.add('hidden'); document.getElementById('enemy-armor-bar').style.width = `0%`;
            }

            const enemyPoisonBadge = document.getElementById('enemy-poison-badge');
            if (enemy.poison > 0) {
                enemyPoisonBadge.classList.remove('hidden'); enemyPoisonBadge.classList.add('flex');
                document.getElementById('enemy-poison-val').innerText = enemy.poison;
            } else { enemyPoisonBadge.classList.add('hidden'); }

            generateEnemySVG(enemy.svg);

            const intentBubble = document.getElementById('enemy-intent-bubble');
            if (state.combat.enemyIntent.type === 'attack') {
                intentBubble.innerHTML = `<i class="fas fa-khanda text-red-500 animate-pulse"></i> <span class="text-xs text-red-400 font-black">${t('intent_attack')} ${state.combat.enemyIntent.value}</span>`;
            } else if (state.combat.enemyIntent.type === 'flame') {
                intentBubble.innerHTML = `<i class="fas fa-fire text-orange-500 animate-bounce"></i> <span class="text-xs text-orange-400 font-black">${t('intent_flame')} ${state.combat.enemyIntent.value}</span>`;
            } else if (state.combat.enemyIntent.type === 'defend') {
                intentBubble.innerHTML = `<i class="fas fa-shield-alt text-blue-400"></i> <span class="text-xs text-blue-300 font-black">${t('intent_defend')} ${state.combat.enemyIntent.value}</span>`;
            }

            document.getElementById('player-hp-combat').innerText = `${state.player.hp} / ${state.player.maxHp}`;
            document.getElementById('player-hp-bar-combat').style.width = `${(state.player.hp / state.player.maxHp) * 100}%`;

            const playerArmorBadge = document.getElementById('player-armor-badge');
            if (state.player.armor > 0) {
                playerArmorBadge.classList.remove('hidden'); playerArmorBadge.classList.add('flex');
                document.getElementById('player-armor-val').innerText = state.player.armor;
            } else { playerArmorBadge.classList.add('hidden'); }

            document.getElementById('combat-turn-badge').innerText = `${t('combat_turn')} ${state.combat.turn}`;
            document.getElementById('player-energy-text').innerText = state.player.energy;
            document.getElementById('deck-count').innerText = state.player.deck.length;
            document.getElementById('discard-count').innerText = state.player.discard.length;

            renderActiveRelicsHUD(); renderHand(); renderGrid(); updateSelectedPanel();
        }

        function renderActiveRelicsHUD() {
            const list = document.getElementById('active-grid-relics');
            list.innerHTML = '';
            const activeKeys = ['relic_leaf', 'relic_cauldron', 'relic_ring', 'relic_anvil'];
            let foundAny = false;

            activeKeys.forEach(key => {
                const count = countItemsOnGrid(key);
                if (count > 0) {
                    foundAny = true; const r = ITEMS[key]; const div = document.createElement('div');
                    div.className = "flex justify-between items-center bg-slate-950/60 border border-slate-800 p-1.5 rounded-lg text-xs";
                    div.innerHTML = `
                        <span class="font-bold ${r.color} flex items-center gap-1.5">
                            <i class="fas ${r.icon}"></i> ${t(r.nameKey)} x${count}
                        </span>
                        <span class="text-[10px] text-slate-400">(${count}x)</span>
                    `;
                    list.appendChild(div);
                }
            });

            if (!foundAny) list.innerHTML = `<span class="text-[10px] text-slate-600 italic">${t('combat_relics_none')}</span>`;
        }

        function renderHand() {
            const container = document.getElementById('player-hand');
            container.innerHTML = '';

            state.player.hand.forEach((card, index) => {
                const tObj = CARD_TYPES[card.type];
                const isSelected = state.combat.selectedCardIndex === index;
                const cardEl = document.createElement('div');
                cardEl.className = `h-28 rounded-xl border p-2 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-200 transform ${tObj.bg} ${tObj.border} ${tObj.color} ${isSelected ? 'scale-105 border-indigo-500 bg-indigo-950/20 -translate-y-2 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'hover:-translate-y-1'}`;
                
                cardEl.innerHTML = `
                    <div class="flex justify-between items-center w-full">
                        <span class="w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">1</span>
                        <i class="fas ${tObj.icon} text-xs"></i>
                    </div>
                    <div class="text-[9px] font-bold leading-tight uppercase tracking-wider line-clamp-2">${t(tObj.nameKey)}</div>
                    <div class="text-[8px] text-slate-400 font-semibold leading-normal mt-1">${t(tObj.descKey)}</div>
                `;
                cardEl.onclick = () => selectCard(index);
                container.appendChild(cardEl);
            });
        }

        function selectCard(index) {
            playSound('select');
            if (state.combat.selectedCardIndex === index) {
                state.combat.selectedCardIndex = null; state.combat.activeCardIndexesHighlight = [];
            } else {
                state.combat.selectedCardIndex = index; state.combat.selectedGridIndex = null;
                state.combat.activeCardIndexesHighlight = state.player.grid.map((item, idx) => item === null ? idx : null).filter(val => val !== null);
            }
            updateCombatUI();
        }

        function renderGrid() {
            const container = document.getElementById('merge-grid');
            container.innerHTML = '';

            state.player.grid.forEach((item, index) => {
                const slot = document.createElement('div');
                const isHighlight = state.combat.activeCardIndexesHighlight.includes(index);
                const isSelected = state.combat.selectedGridIndex === index;
                
                let highlightClass = "border-slate-800 bg-slate-900/30 hover:border-slate-700";
                if (isHighlight) highlightClass = "border-emerald-500 bg-emerald-950/15 border-dashed animate-pulse cursor-pointer";
                else if (isSelected) highlightClass = "border-amber-400 bg-amber-950/20 scale-105 z-20 cursor-pointer shadow-lg";

                slot.className = `w-16 h-16 sm:w-20 sm:h-20 border-2 rounded-xl flex flex-col items-center justify-center relative transition-all duration-150 ${highlightClass}`;
                slot.setAttribute('data-index', index);
                slot.setAttribute('ondragover', 'allowDrop(event)'); slot.setAttribute('ondragenter', 'dragEnter(event)');
                slot.setAttribute('ondragleave', 'dragLeave(event)'); slot.setAttribute('ondrop', 'handleDrop(event)');

                if (item) {
                    const data = ITEMS[item.type];
                    slot.classList.add('cursor-pointer', 'item-pop', 'border-2', `rarity-${data.rarity}`);
                    slot.setAttribute('draggable', 'true'); slot.setAttribute('ondragstart', `handleDragStart(event, ${index})`);

                    let typeBadge = "";
                    if (data.usable) typeBadge = `<i class="fas fa-bolt text-[9px] text-amber-400 absolute top-1.5 right-1.5 animate-pulse drop-shadow-md"></i>`;
                    else if (data.effect && data.effect.type === 'passive_relic') typeBadge = `<i class="fas fa-gem text-[9px] text-fuchsia-400 absolute top-1.5 right-1.5 drop-shadow-md"></i>`;

                    slot.innerHTML = `
                        ${typeBadge}
                        <i class="fas ${data.icon} text-2xl sm:text-3xl ${data.color} mb-3 drop-shadow-md"></i>
                        <span class="absolute bottom-0.5 text-[7.5px] font-black uppercase text-slate-300 leading-[1] w-full px-0.5 text-center line-clamp-2">
                            ${t(data.nameKey)}
                        </span>
                    `;

                    slot.onclick = (e) => { e.stopPropagation(); gridSlotInteraction(index); };
                    slot.ondblclick = (e) => { e.stopPropagation(); state.combat.selectedGridIndex = index; activateSelectedItem(); };
                } else {
                    slot.innerHTML = `<div class="w-2 h-2 bg-slate-800 rounded-full"></div>`;
                    slot.onclick = () => gridSlotInteraction(index);
                }
                container.appendChild(slot);
            });
        }

        function handleDragStart(e, index) { state.combat.draggedIndex = index; e.dataTransfer.setData("text/plain", index); }
        function allowDrop(e) { e.preventDefault(); }
        function dragEnter(e) { e.preventDefault(); e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-950/20'); }
        function dragLeave(e) { e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-950/20'); }
        
        function handleDrop(e) {
            e.preventDefault(); e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-950/20');
            const originIdx = parseInt(e.dataTransfer.getData("text/plain"));
            const targetIdx = parseInt(e.currentTarget.getAttribute('data-index'));
            if (isNaN(originIdx) || isNaN(targetIdx) || originIdx === targetIdx) return;
            executeGridAction(originIdx, targetIdx);
        }

        function handleRecycleDrop(e) {
            e.preventDefault(); const originIdx = parseInt(e.dataTransfer.getData("text/plain"));
            if (!isNaN(originIdx)) recycleItemAtIndex(originIdx);
        }

        function gridSlotInteraction(index) {
            const item = state.player.grid[index];
            if (state.combat.selectedCardIndex !== null) {
                if (!item) {
                    const card = state.player.hand[state.combat.selectedCardIndex];
                    if (state.player.energy >= 1) {
                        state.player.energy -= 1; executeCardSpawn(card, index);
                        state.player.discard.push(state.player.hand.splice(state.combat.selectedCardIndex, 1)[0]);
                        state.combat.selectedCardIndex = null; state.combat.activeCardIndexesHighlight = [];
                        playSound('spawn'); evaluateRelicMaxEnergy(); updateCombatUI();
                    } else playSound('fail_recipe');
                }
                return;
            }

            if (state.combat.selectedGridIndex === null) {
                if (item) { state.combat.selectedGridIndex = index; playSound('select'); }
            } else {
                executeGridAction(state.combat.selectedGridIndex, index);
            }
            updateCombatUI();
        }

        function executeGridAction(originIdx, targetIdx) {
            const originItem = state.player.grid[originIdx];
            const targetItem = state.player.grid[targetIdx];
            if (!originItem) return;
            if (originIdx === targetIdx) { state.combat.selectedGridIndex = null; return; }

            if (!targetItem) {
                state.player.grid[targetIdx] = originItem; state.player.grid[originIdx] = null; playSound('select');
            } else {
                const recipeResult = checkRecipe(originItem.type, targetItem.type);
                if (recipeResult) {
                    state.player.grid[targetIdx] = { type: recipeResult }; state.player.grid[originIdx] = null;
                    playSound('merge');
                    setTimeout(() => { const slots = document.querySelectorAll('#merge-grid > div'); if (slots[targetIdx]) slots[targetIdx].classList.add('merge-glow'); }, 50);
                } else {
                    state.player.grid[originIdx] = targetItem; state.player.grid[targetIdx] = originItem; playSound('select');
                }
            }
            state.combat.selectedGridIndex = null; state.combat.activeCardIndexesHighlight = [];
            evaluateRelicMaxEnergy();
        }

        function checkRecipe(typeA, typeB) {
            const r = RECIPES.find(r => (r.in1 === typeA && r.in2 === typeB) || (r.in1 === typeB && r.in2 === typeA));
            return r ? r.out : null;
        }

        function executeCardSpawn(card, targetIndex) {
            const action = CARD_TYPES[card.type].action;
            if (action.exact) {
                let currentIdx = targetIndex;
                action.exact.forEach(type => {
                    while (currentIdx < 16 && state.player.grid[currentIdx] !== null) currentIdx++;
                    if (currentIdx < 16) state.player.grid[currentIdx] = { type };
                });
            } else {
                const amount = action.min + Math.floor(Math.random() * (action.max - action.min + 1));
                let currentIdx = targetIndex;
                for (let i = 0; i < amount; i++) {
                    const chosenType = action.pool[Math.floor(Math.random() * action.pool.length)];
                    while (currentIdx < 16 && state.player.grid[currentIdx] !== null) currentIdx++;
                    if (currentIdx < 16) state.player.grid[currentIdx] = { type: chosenType };
                    else {
                        const fallbackIdx = state.player.grid.indexOf(null);
                        if (fallbackIdx !== -1) state.player.grid[fallbackIdx] = { type: chosenType };
                    }
                }
            }
        }

        function recycleSelectedGridItem() {
            if (state.combat.selectedGridIndex !== null) {
                recycleItemAtIndex(state.combat.selectedGridIndex); state.combat.selectedGridIndex = null;
            }
        }

        function recycleItemAtIndex(idx) {
            const item = state.player.grid[idx];
            if (item) {
                state.player.grid[idx] = null; state.player.gold += 2;
                playSound('recycle'); updateGlobalHeader(); updateCombatUI();
            }
        }

        function toggleRecipeBook() {
            playSound('select');
            const panel = document.getElementById('recipe-book-panel');
            const container = document.getElementById('recipe-list-container');
            if (panel.classList.contains('hidden') && container.children.length === 0) {
                renderRecipeBook(container);
            }
            panel.classList.toggle('hidden');
        }

        function renderRecipeBook(container) {
            let html = '';
            RECIPES.forEach(r => {
                const i1 = ITEMS[r.in1], i2 = ITEMS[r.in2], out = ITEMS[r.out];
                if(i1 && i2 && out) {
                    html += `
                        <div class="flex items-center gap-2 bg-slate-900/50 p-1 rounded border border-slate-800">
                            <span class="${i1.color}"><i class="fas ${i1.icon}"></i> <span class="text-[10px] hidden sm:inline">${t(i1.nameKey)}</span></span>
                            <span class="text-slate-500 font-bold">+</span>
                            <span class="${i2.color}"><i class="fas ${i2.icon}"></i> <span class="text-[10px] hidden sm:inline">${t(i2.nameKey)}</span></span>
                            <span class="text-slate-500 font-bold">=</span>
                            <span class="${out.color} font-bold"><i class="fas ${out.icon}"></i> ${t(out.nameKey)}</span>
                        </div>
                    `;
                }
            });
            container.innerHTML = html;
        }

        function updateSelectedPanel() {
            const icon = document.getElementById('selected-item-icon');
            const title = document.getElementById('selected-item-title');
            const desc = document.getElementById('selected-item-desc');
            const btn = document.getElementById('btn-activate-item');

            const selectedIdx = state.combat.selectedGridIndex;
            if (selectedIdx === null || !state.player.grid[selectedIdx]) {
                icon.innerHTML = `<i class="fas fa-hand-pointer"></i>`;
                icon.className = "w-10 h-10 rounded-lg border border-slate-700 flex items-center justify-center bg-slate-950 text-slate-400";
                title.innerText = t('panel_no_item');
                desc.innerText = t('panel_no_item_desc');
                btn.disabled = true;
                btn.className = "bg-slate-800 text-slate-500 font-bold py-2 px-5 rounded-lg text-xs tracking-wider uppercase transition-all cursor-not-allowed";
                return;
            }

            const item = state.player.grid[selectedIdx];
            const data = ITEMS[item.type];

            icon.innerHTML = `<i class="fas ${data.icon}"></i>`;
            icon.className = `w-10 h-10 rounded-lg border flex items-center justify-center bg-slate-950 text-lg rarity-${data.rarity}`;
            title.innerHTML = `${t(data.nameKey)} <span class="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-800 rarity-${data.rarity}">${data.rarity}</span>`;
            desc.innerText = t(data.descKey);
            
            if (data.usable) {
                btn.disabled = false;
                btn.className = `bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-5 rounded-lg text-xs tracking-wider uppercase transition-all cursor-pointer animate-pulse shadow-md`;
            } else {
                btn.disabled = true;
                btn.className = "bg-slate-800 text-slate-500 font-bold py-2 px-5 rounded-lg text-xs tracking-wider uppercase transition-all cursor-not-allowed";
            }
        }

        function activateSelectedItem() {
            const index = state.combat.selectedGridIndex;
            if (index === null) return;
            const item = state.player.grid[index];
            if (!item || !ITEMS[item.type].usable) { playSound('fail_recipe'); return; }

            const data = ITEMS[item.type]; const eff = data.effect;
            const anvilBonus = (data.effect.type.includes('damage') && countItemsOnGrid('relic_anvil') > 0) ? (countItemsOnGrid('relic_anvil') * 4) : 0;

            if (eff.type === 'damage') { dealDamageToEnemy(eff.value + anvilBonus); playSound('attack'); } 
            else if (eff.type === 'armor') { state.player.armor += eff.value; playSound('defend'); } 
            else if (eff.type === 'damage_mana') { dealDamageToEnemy(eff.damage + anvilBonus); state.player.energy += eff.mana; playSound('attack'); } 
            else if (eff.type === 'mana') { state.player.energy += eff.value; playSound('defend'); } 
            else if (eff.type === 'damage_poison') { dealDamageToEnemy(eff.damage + anvilBonus); state.combat.enemy.poison += eff.poison; playSound('attack'); } 
            else if (eff.type === 'armor_damage') { state.player.armor += eff.armor; dealDamageToEnemy(eff.damage); playSound('defend'); }

            state.player.grid[index] = null; state.combat.selectedGridIndex = null; state.combat.activeCardIndexesHighlight = [];

            if (state.combat.enemy.hp <= 0) triggerVictory(); else updateCombatUI();
        }

        function dealDamageToEnemy(amount) {
            const enemy = state.combat.enemy;
            const enemyContainer = document.getElementById('enemy-sprite-container');
            enemyContainer.classList.add('scale-95', 'damage-flash');
            setTimeout(() => enemyContainer.classList.remove('scale-95', 'damage-flash'), 250);

            if (enemy.armor >= amount) enemy.armor -= amount;
            else { const diff = amount - enemy.armor; enemy.armor = 0; enemy.hp = Math.max(0, enemy.hp - diff); }
        }

        function endPlayerTurn() {
            playSound('select');
            
            executeEnemyTurn(); resolvePoison();

            let leaves = countItemsOnGrid('relic_leaf');
            if (leaves > 0) { state.player.hp = Math.min(state.player.maxHp, state.player.hp + (leaves * 4)); playSound('defend'); }

            if (state.player.hp <= 0) { triggerDefeat(); return; }
            if (state.combat.enemy.hp <= 0) { triggerVictory(); return; }

            state.player.armor = 0; state.player.energy = state.player.maxEnergy;
            state.player.hand.forEach(card => state.player.discard.push(card)); state.player.hand = [];
            drawCards(5); state.combat.turn += 1; generateEnemyIntent();

            let cauldrons = countItemsOnGrid('relic_cauldron');
            if (cauldrons > 0) state.combat.enemy.poison += (cauldrons * 3);

            updateCombatUI();
        }

        function executeEnemyTurn() {
            const intent = state.combat.enemyIntent; const enemy = state.combat.enemy;
            const container = document.getElementById('enemy-sprite-container');
            container.classList.add('translate-y-4'); setTimeout(() => container.classList.remove('translate-y-4'), 150);

            if (intent.type === 'attack' || intent.type === 'flame') {
                const dmg = intent.value;
                if (state.player.armor >= dmg) state.player.armor -= dmg;
                else { const diff = dmg - state.player.armor; state.player.armor = 0; state.player.hp = Math.max(0, state.player.hp - diff); playSound('hurt'); }
            } else if (intent.type === 'defend') {
                enemy.armor += intent.value;
            }
        }

        function resolvePoison() {
            const enemy = state.combat.enemy;
            if (enemy.poison > 0) { enemy.hp = Math.max(0, enemy.hp - enemy.poison); enemy.poison = Math.max(0, enemy.poison - 1); playSound('hurt'); }
        }

        function triggerVictory() {
            playSound('win');
            
            state.player.deck = [...state.player.deck, ...state.player.hand, ...state.player.discard];
            state.player.hand = []; state.player.discard = [];
            
            const goldEarned = 25 + Math.floor(Math.random() * 12);
            state.player.gold += goldEarned;
            document.getElementById('reward-gold-text').innerText = `+${goldEarned}`;

            generateCardDraftOptions(); updateGlobalHeader(); showView('view-rewards');
        }

        function renderRewardsTexts() {}

        function generateCardDraftOptions() {
            const container = document.getElementById('card-draft-options'); container.innerHTML = '';
            const keys = Object.keys(CARD_TYPES); const choices = [];
            
            const shuffledKeys = shuffleArray([...keys]);
            for (let i = 0; i < 3; i++) choices.push(shuffledKeys[i]);

            choices.forEach(type => {
                const tObj = CARD_TYPES[type]; const opt = document.createElement('div');
                opt.className = `p-4 border rounded-xl flex flex-col justify-between items-center text-center cursor-pointer transition-all hover:scale-105 ${tObj.bg} ${tObj.border} ${tObj.color}`;
                opt.innerHTML = `
                    <i class="fas ${tObj.icon} text-2xl mb-2"></i>
                    <strong class="text-xs uppercase font-extrabold tracking-wider block">${t(tObj.nameKey)}</strong>
                    <span class="text-[9px] text-slate-400 mt-2 leading-snug">${t(tObj.descKey)}</span>
                    <button class="mt-4 bg-slate-800 hover:bg-slate-700 text-[10px] uppercase tracking-wider font-bold py-1 px-3 rounded-md text-white">${t('btn_add')}</button>
                `;
                opt.onclick = () => addCardToDeck(type); container.appendChild(opt);
            });
        }

        function addCardToDeck(type) { playSound('select'); state.player.deck.push({ id: Date.now(), type }); advanceMapNode(); }
        function skipCardDraft() { playSound('select'); advanceMapNode(); }

        function advanceMapNode() {
            state.currentMapNodeIndex += 1;
            if (state.currentMapNodeIndex >= state.nodes.length) { triggerGameCompleted(); } 
            else { updateGlobalHeader(); showView('view-map'); }
        }

        function setupCampfire() { showView('view-campfire'); }
        function campfireRest() { playSound('defend'); const healAmt = Math.round(state.player.maxHp * 0.3); state.player.hp = Math.min(state.player.maxHp, state.player.hp + healAmt); advanceMapNode(); }
        function campfireForge() { playSound('merge'); spawnItemOnFirstEmptySlot('magic_shard'); spawnItemOnFirstEmptySlot('poison_gland'); advanceMapNode(); }
        function spawnItemOnFirstEmptySlot(type) { const idx = state.player.grid.indexOf(null); if (idx !== -1) { state.player.grid[idx] = { type }; return true; } return false; }

        function setupMerchant() { renderMerchantShop(); showView('view-merchant'); }
        function renderMerchantShop() {
            const cardsList = document.getElementById('shop-cards-list'); cardsList.innerHTML = '';
            Object.keys(CARD_TYPES).forEach(type => {
                const tObj = CARD_TYPES[type]; const cost = 30; const row = document.createElement('div');
                row.className = "flex justify-between items-center border border-slate-800 p-2 rounded-lg bg-slate-900/40 text-xs";
                row.innerHTML = `
                    <div class="flex items-center gap-2 ${tObj.color}">
                        <i class="fas ${tObj.icon}"></i>
                        <div>
                            <span class="font-bold">${t(tObj.nameKey)}</span>
                            <span class="block text-[8px] text-slate-500">${t(tObj.descKey)}</span>
                        </div>
                    </div>
                    <button onclick="buyShopCard('${type}', ${cost})" class="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-1 px-3 rounded text-[10px] transition-all">
                        ${t('btn_buy')} ${cost} <i class="fas fa-coins"></i>
                    </button>
                `;
                cardsList.appendChild(row);
            });

            const ingredientsList = document.getElementById('shop-ingredients-list'); ingredientsList.innerHTML = '';
            const buyableIngredients = [ { type: 'magic_shard', cost: 25 }, { type: 'poison_gland', cost: 20 } ];

            buyableIngredients.forEach(item => {
                const r = ITEMS[item.type]; const row = document.createElement('div');
                row.className = "flex justify-between items-center border border-slate-800 p-2 rounded-lg bg-slate-900/40 text-xs";
                row.innerHTML = `
                    <div class="space-y-0.5">
                        <strong class="text-slate-100"><i class="fas ${r.icon} ${r.color} mr-1"></i> ${t(r.nameKey)}</strong>
                        <span class="text-[9px] text-slate-400 block">${t(r.descKey).slice(0, 45)}...</span>
                    </div>
                    <button onclick="buyShopIngredient('${item.type}', ${item.cost})" class="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-1 px-3 rounded text-[10px] transition-all">
                        ${t('btn_acquire')} ${item.cost} <i class="fas fa-coins"></i>
                    </button>
                `;
                ingredientsList.appendChild(row);
            });

            const btnRemove = document.getElementById('btn-shop-remove-card');
            if (state.player.deck.length <= 4) {
                btnRemove.disabled = true; btnRemove.className = "bg-slate-800 text-slate-500 py-2 px-4 rounded-lg text-xs font-bold cursor-not-allowed";
            } else {
                btnRemove.disabled = false;
                btnRemove.innerHTML = `<i class="fas fa-trash-alt text-[10px]"></i> <span>${t('btn_pay')} <i class="fas fa-coins text-[10px]"></i></span>`;
                btnRemove.className = "bg-amber-600/20 hover:bg-amber-600 border border-amber-600 text-amber-300 hover:text-slate-950 font-bold py-2 px-4 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer";
            }
        }

        function buyShopCard(type, cost) {
            if (state.player.gold >= cost) { state.player.gold -= cost; state.player.deck.push({ id: Date.now(), type }); playSound('select'); updateGlobalHeader(); renderMerchantShop(); } 
            else playSound('fail_recipe');
        }

        function buyShopIngredient(type, cost) {
            if (state.player.gold >= cost) { const added = spawnItemOnFirstEmptySlot(type);
                if (added) { state.player.gold -= cost; playSound('spawn'); updateGlobalHeader(); renderMerchantShop(); } else playSound('fail_recipe');
            } else playSound('fail_recipe');
        }

        function shopRemoveCardService() {
            const cost = 45;
            if (state.player.gold >= cost && state.player.deck.length > 4) {
                const idx = state.player.deck.findIndex(c => c.type === 'gather_iron' || c.type === 'gather_wood');
                if (idx !== -1) { state.player.gold -= cost; state.player.deck.splice(idx, 1); playSound('hurt'); updateGlobalHeader(); renderMerchantShop(); }
            } else playSound('fail_recipe');
        }

        function exitMerchant() { playSound('select'); advanceMapNode(); }

        function triggerDefeat() {
            playSound('hurt');
            document.getElementById('game-end-icon-container').innerHTML = `<div class="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500 rounded-full flex items-center justify-center mx-auto text-3xl"><i class="fas fa-skull"></i></div>`;
            document.getElementById('game-end-title').className = "fantasy-title text-4xl font-bold tracking-wider text-red-500";
            document.getElementById('game-end-title').innerText = t('end_defeat');
            document.getElementById('game-end-desc').innerText = t('end_defeat_desc');
            showView('view-game-end');
        }

        function triggerGameCompleted() {
            playSound('win');
            document.getElementById('game-end-icon-container').innerHTML = `<div class="w-16 h-16 bg-amber-500/10 text-amber-500 border border-amber-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce"><i class="fas fa-crown"></i></div>`;
            document.getElementById('game-end-title').className = "fantasy-title text-4xl font-bold tracking-wider text-amber-400";
            document.getElementById('game-end-title').innerText = t('end_win');
            document.getElementById('game-end-desc').innerText = t('end_win_desc');
            showView('view-game-end');
        }

        function renderGameEndTexts() {
            if(document.getElementById('game-end-title').classList.contains('text-red-500')){
                document.getElementById('game-end-title').innerText = t('end_defeat');
                document.getElementById('game-end-desc').innerText = t('end_defeat_desc');
            } else {
                document.getElementById('game-end-title').innerText = t('end_win');
                document.getElementById('game-end-desc').innerText = t('end_win_desc');
            }
        }

        function restartGame() { playSound('select'); initNewGame(); }

        function generateEnemySVG(type) {
            const container = document.getElementById('enemy-sprite-container'); let svg = "";
            if (type === 'slime') {
                svg = `<svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]"><ellipse cx="50" cy="65" rx="35" ry="25" fill="#10b981" /><ellipse cx="50" cy="55" rx="25" ry="15" fill="#34d399" /><circle cx="42" cy="55" r="3" fill="#ffffff" /><circle cx="58" cy="55" r="3" fill="#ffffff" /><circle cx="42" cy="55" r="1.5" fill="#000000" /><circle cx="58" cy="55" r="1.5" fill="#000000" /><path d="M 45 65 Q 50 68 55 65" stroke="#047857" stroke-width="2" fill="none" /></svg>`;
            } else if (type === 'goblin') {
                svg = `<svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"><polygon points="15,40 30,50 30,30" fill="#4ade80" /><polygon points="85,40 70,50 70,30" fill="#4ade80" /><circle cx="50" cy="45" r="22" fill="#22c55e" /><polygon points="38,38 48,43 38,44" fill="#fbbf24" /><polygon points="62,38 52,43 62,44" fill="#fbbf24" /><circle cx="43" cy="41" r="1.5" fill="#ef4444" /><circle cx="57" cy="41" r="1.5" fill="#ef4444" /><polygon points="50,45 47,56 53,56" fill="#15803d" /><path d="M 32 65 Q 50 55 68 65 L 75 90 L 25 90 Z" fill="#b45309" /></svg>`;
            } else if (type === 'gargoyle') {
                svg = `<svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-[0_0_15px_rgba(148,163,184,0.5)]"><polygon points="20,50 5,20 30,40" fill="#475569" /><polygon points="80,50 95,20 70,40" fill="#475569" /><polygon points="30,25 50,10 70,25 65,65 35,65" fill="#64748b" /><circle cx="42" cy="35" r="4" fill="#f87171" class="animate-pulse" /><circle cx="58" cy="35" r="4" fill="#f87171" class="animate-pulse" /><polygon points="42,32 50,34 58,32" fill="#1e293b" /><rect x="35" y="65" width="30" height="25" rx="5" fill="#475569" /><path d="M 40 90 L 40 95 M 50 90 L 50 95 M 60 90 L 60 95" stroke="#1e293b" stroke-width="3" /></svg>`;
            } else if (type === 'dragon') {
                svg = `<svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]"><polygon points="15,45 0,10 40,35" fill="#7f1d1d" /><polygon points="85,45 100,10 60,35" fill="#7f1d1d" /><polygon points="32,25 20,5 38,20" fill="#facc15" /><polygon points="68,25 80,5 62,20" fill="#facc15" /><polygon points="30,35 50,15 70,35 65,70 50,85 35,70" fill="#dc2626" /><polygon points="35,70 50,55 65,70" fill="#991b1b" /><polygon points="40,36 48,40 38,42" fill="#fbbf24" /><polygon points="60,36 52,40 62,42" fill="#fbbf24" /><circle cx="46" cy="74" r="2" fill="#1e293b" /><circle cx="54" cy="74" r="2" fill="#1e293b" /></svg>`;
            }
            container.innerHTML = svg;
        }



// Expose to window for inline HTML handlers
if (typeof state !== "undefined") window.state = state;
if (typeof ITEMS !== "undefined") window.ITEMS = ITEMS;
if (typeof RECIPES !== "undefined") window.RECIPES = RECIPES;
if (typeof CARD_TYPES !== "undefined") window.CARD_TYPES = CARD_TYPES;
if (typeof ENEMIES !== "undefined") window.ENEMIES = ENEMIES;
if (typeof DICT !== "undefined") window.DICT = DICT;
