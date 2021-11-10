const fs = require('fs'),
    path = require('path');

//const DataCenter_ClassNames = {
//    "warrior": "Warrior",
//    "lancer": "Lancer",
//    "slayer": "Slayer",
//    "berserker": "Berserker",
//    "sorcerer": "Sorcerer",
//    "archer": "Archer",
//    "priest": "Priest",
//    "elementalist": "Mystic",
//    "soulless": "Reaper",
//    "engineer": "Gunner",
//    "fighter": "Brawler",
//    "assassin": "Ninja",
//    "glaiver": "Valkyrie"
//};

module.exports = function GunJS(mod) {
    const { command } = mod;
    const { player } = mod.require.library;

    let skill_ids = {};
    let isEnabled = true;
    let lastTimeout = null;
    let config_file = require('./config.json');

    if (config_file['BLAST_CANCEL_DELAY'] && typeof config_file['BLAST_CANCEL_DELAY'] === "number") {
        skill_ids['1'] = {
            'delay': config_file['BLAST_CANCEL_DELAY']
        };
        skill_ids['42'] = {
            'delay': config_file['BLAST_CANCEL_DELAY']
        };
    }
    if (config_file['BOMBARDMENT_CANCEL_DELAY'] && typeof config_file['BOMBARDMENT_CANCEL_DELAY'] === "number") {
        skill_ids['2-1'] = {
            'delay': config_file['BOMBARDMENT_CANCEL_DELAY']
        };
    }
    if (config_file['SCATTERSHOT_CANCEL_DELAY'] && typeof config_file['SCATTERSHOT_CANCEL_DELAY'] === "number") {
        skill_ids['3'] = {
            'delay': config_file['SCATTERSHOT_CANCEL_DELAY']
        };
    }
    if (config_file['MANA_MISSILE_CANCEL_DELAY'] && typeof config_file['MANA_MISSILE_CANCEL_DELAY'] === "number") {
        skill_ids['9-11'] = {
            'delay': config_file['MANA_MISSILE_CANCEL_DELAY']
        };
    }
    if (config_file['BALDER_CANCEL_DELAY'] && typeof config_file['BALDER_CANCEL_DELAY'] === "number") {
        skill_ids['13-2'] = {
            'delay': config_file['BALDER_CANCEL_DELAY']
        };
        skill_ids['44-2'] = {
            'delay': config_file['BALDER_CANCEL_DELAY']
        };
    }
    if (config_file['REPLENISHMENT_CANCEL_DELAY'] && typeof config_file['REPLENISHMENT_CANCEL_DELAY'] === "number") {
        skill_ids['15'] = {
            'delay': config_file['REPLENISHMENT_CANCEL_DELAY']
        };
    }
    if (config_file['HB_7_CANCEL_DELAY'] && typeof config_file['HB_7_CANCEL_DELAY'] === "number") {
        skill_ids['18'] = {
            'delay': config_file['HB_7_CANCEL_DELAY']
        };
    }
    if (config_file['MWS_CANCEL_DELAY'] && typeof config_file['MWS_CANCEL_DELAY'] === "number") {
        skill_ids['41'] = {
            'delay': config_file['MWS_CANCEL_DELAY']
        };
    }
    if (config_file['REMOTE_TRIGGER_CANCEL_DELAY'] && typeof config_file['REMOTE_TRIGGER_CANCEL_DELAY'] === "number") {
        skill_ids['43-31'] = {
            'delay': config_file['REMOTE_TRIGGER_CANCEL_DELAY'],
            'fixedDelay': true
        };
    }
    if (config_file['OBLITERATION_CANCEL_DELAY'] && typeof config_file['OBLITERATION_CANCEL_DELAY'] === "number") {
        skill_ids['47-1'] = {
            'delay': config_file['OBLITERATION_CANCEL_DELAY']
        };
    }

    command.add('shadowgun', {
        '$default'() {
            isEnabled = !isEnabled;
            command.message(' Gunner script is now ' + (isEnabled ? 'enabled' : 'disabled') + '.');
        }
    });

    mod.hook('S_ACTION_STAGE', 9, { order: -1000000, filter: {fake: true} }, event => {

        if (!isEnabled || event.gameId !== mod.game.me.gameId || mod.game.me.class !== 'engineer') return;

        const skill_id = Math.floor(event.skill.id / 10000);
        const altSkill_id = event.skill.id % 100;

        if (skill_id in skill_ids || skill_id + '-' + altSkill_id in skill_ids) {
        
            const skillInfo = skill_id in skill_ids ? skill_ids[skill_id] : skill_ids[skill_id + '-' + altSkill_id];
        
            lastTimeout = mod.setTimeout(() => {
                mod.toClient('S_ACTION_END', 5, {
                    gameId: event.gameId,
                    loc: {
                        x: event.loc.x,
                        y: event.loc.y,
                        z: event.loc.z
                    },
                    w: event.w,
                    templateId: event.templateId,
                    skill: event.skill.id,
                    type: 12394123,
                    id: event.id
                });
        
            }, skillInfo['fixedDelay'] ? skillInfo['delay'] : skillInfo['delay'] / player['aspd']);
        }
    });
    
    mod.hook('S_ACTION_END', 5, { 'order': -1000000, 'filter': { 'fake': true } }, event => {
        if (!isEnabled || event.gameId !== mod.game.me.gameId || mod.game.me.class !== 'engineer') return;

        const skill_id = Math.floor(event.skill.id / 10000);
        const altSkill_id = event.skill.id % 100;

        if (lastTimeout && (skill_id in skill_ids || skill_id + '-' + altSkill_id in skill_ids)) {
            lastTimeout = null;
            if (event.type == 12394123) {
                event.type = 4;
                return true;
            } else {
                return false;
            }
        }
    });

    mod.hook('C_CANCEL_SKILL', 3, event => {
        if (!isEnabled || mod.game.me.class !== 'engineer') return;

        if (lastTimeout) {
            mod.clearTimeout(lastTimeout);
            lastTimeout = null;
        }
    });

    mod.hook('S_EACH_SKILL_RESULT', 15, { 'order': -10000000 }, event => {
        if (!isEnabled || !lastTimeout || event.target !== mod.game.me.gameId || !event.reaction.enable) return;

        mod.clearTimeout(lastTimeout);
        lastTimeout = null;        
    });
}
