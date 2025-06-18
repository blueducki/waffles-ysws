let honey = 0;
let bees = 0;
let environment = 0;
let flowers = {
    forgetMeNot: 0,
    marigold: 0,
    daisy: 0,
    dandelion: 0,
    knapweed: 0,
    muskMallow: 0
};
let unlocked = {
    forgetMeNot: true,
    marigold: false,
    daisy: false,
    dandelion: false,
    knapweed: false,
    muskMallow: false
};

let costs = {
    bee: 50,
    environment: 1000,
    forgetMeNot: 150,
    marigold: 300,
    daisy: 600,
    dandelion: 1200,
    knapweed: 2400,
    muskMallow: 4800
};

let production = {
    bee: 1,
    forgetMeNot: 3,
    marigold: 7,
    daisy: 14,
    dandelion: 30,
    knapweed: 48,
    muskMallow: 96
};

let envNames = ['city', 'town', 'village', 'farm', 'forest', 'garden'];
let envMultipliers = [1, 2, 4, 8, 16, 32];

let flowerNames = {
    forgetMeNot: 'forget-me-not',
    marigold: 'marigold',
    daisy: 'daisy',
    dandelion: 'dandelion',
    knapweed: 'knapweed',
    muskMallow: 'musk mallow'
};

window.addEventListener('load', function() {
    setTimeout(function() {
        loadGame();
        updateDisplay();
    }, 100);
    
    let honeyJar = document.getElementById('honey-jar');
    if (honeyJar) {
        honeyJar.addEventListener("click", function() {
            honey += envMultipliers[environment];
            updateDisplay();
            saveGame();
        });
    }
    
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener("click", function() {
            let item = this.closest('.shop-item');
            let type = item.dataset.type;
            
            if (type === 'bee') {
                if (honey >= costs.bee) {
                    honey -= costs.bee;
                    bees++;
                    costs.bee = Math.floor(costs.bee * 1.15);
                }
            } else if (type === 'environment') {
                if (honey >= costs.environment && environment < envNames.length - 1) {
                    honey -= costs.environment;
                    environment++;
                    costs.environment *= 2;
                }
            } else {
                if (unlocked[type]) {
                    if (honey >= costs[type]) {
                        honey -= costs[type];
                        flowers[type]++;
                        costs[type] = Math.floor(costs[type] * 1.15);
                    }
                } else {
                    if (honey >= costs[type]) {
                        honey -= costs[type];
                        unlocked[type] = true;
                        let img = item.querySelector('img');
                        let h3 = item.querySelector('h3');
                        let p = item.querySelector('p');
                        img.src = type + '.png';
                        h3.textContent = flowerNames[type];
                        p.textContent = 'produces ' + production[type] + ' honey/s';
                        item.classList.remove('locked');
                        this.textContent = 'buy (' + costs[type] + ' honey)';
                    }
                }
            }
            
            updateDisplay();
            saveGame();
        });
    });
    
    setInterval(function() {
        let totalProduction = bees * production.bee;
        for (let flower in flowers) {
            totalProduction += flowers[flower] * production[flower];
        }
        totalProduction *= envMultipliers[environment];
        honey += totalProduction;
        updateDisplay();
        saveGame();
    }, 1000);
});

function updateDisplay() {
    let honeyElements = document.querySelectorAll('#honey-count');
    honeyElements.forEach(el => el.textContent = Math.floor(honey));
    
    let beeCountElement = document.getElementById('bee-count');
    if (beeCountElement) beeCountElement.textContent = bees;
    
    let envElement = document.getElementById('environment');
    if (envElement) envElement.textContent = envNames[environment];
    
    let envNameElement = document.getElementById('env-name');
    if (envNameElement) envNameElement.textContent = envNames[environment];
    
    let perSecondElement = document.getElementById('per-second');
    if (perSecondElement) {
        let total = bees * production.bee;
        for (let flower in flowers) {
            total += flowers[flower] * production[flower];
        }
        total *= envMultipliers[environment];
        perSecondElement.textContent = Math.floor(total);
    }
    
    let beesContainer = document.getElementById('bees-container');
    if (beesContainer) {
        beesContainer.innerHTML = '';
        for (let i = 0; i < Math.min(bees, 12); i++) {
            let bee = document.createElement('img');
            bee.src = 'icons/bee.png';
            bee.className = 'bee';
            bee.style.width = '30px'
            bee.style.height = '30px';
            bee.style.transform = 'rotate(' + (360 / Math.min(bees, 12)) * i + 'deg) translateX(150px) rotate(-' + (360 / Math.min(bees, 12)) * i + 'deg)';
            beesContainer.appendChild(bee);
        }
    }
    
    document.querySelectorAll('.owned').forEach((el, index) => {
        if (index === 0) el.textContent = bees;
        else {
            let flowerTypes = Object.keys(flowers);
            if (flowerTypes[index - 1]) {
                el.textContent = flowers[flowerTypes[index - 1]];
            }
        }
    });
    
    document.querySelectorAll('.buy-btn').forEach(btn => {
        let item = btn.closest('.shop-item');
        let type = item.dataset.type;
        let cost = costs[type];
        
        if (type === 'bee') {
            btn.textContent = 'buy (' + cost + ' honey)';
            btn.disabled = honey < cost;
        } else if (type === 'environment') {
            if (environment >= envNames.length - 1) {
                btn.textContent = 'max level';
                btn.disabled = true;
            } else {
                btn.textContent = 'upgrade (' + cost + ' honey)';
                btn.disabled = honey < cost;
            }
        } else {
            if (unlocked[type]) {
                btn.textContent = 'buy (' + cost + ' honey)';
                btn.disabled = honey < cost;
            } else {
                btn.textContent = 'unlock (' + cost + ' honey)';
                btn.disabled = honey < cost;
            }
        }
    });
}

function saveGame() {
    let gameData = {
        honey: honey,
        bees: bees,
        environment: environment,
        flowers: flowers,
        unlocked: unlocked,
        costs: costs
    };
    localStorage.setItem('honeyClickerSave', JSON.stringify(gameData));
}

function loadGame() {
    let saved = localStorage.getItem('honeyClickerSave');
    if (saved) {
        let gameData = JSON.parse(saved);
        honey = gameData.honey || 0;
        bees = gameData.bees || 0;
        environment = gameData.environment || 0;
        flowers = gameData.flowers || flowers;
        unlocked = gameData.unlocked || unlocked;
        costs = gameData.costs || costs;
        
        for (let type in unlocked) {
            if (unlocked[type] && type !== 'forgetMeNot') {
                let item = document.querySelector('[data-type="' + type + '"]');
                if (item) {
                    let img = item.querySelector('img');
                    let h3 = item.querySelector('h3');
                    let p = item.querySelector('p');
                    if (img) img.src = type + '.png';
                    if (h3) h3.textContent = flowerNames[type];
                    if (p) p.textContent = 'produces ' + production[type] + ' honey/s';
                    item.classList.remove('locked');
                }
            }
        }
    }
}